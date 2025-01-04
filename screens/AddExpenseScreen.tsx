import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { InteractionManager } from 'react-native'; // or requestAnimationFrame
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthContext from '../contexts/AuthContext';
import { MASTER_KEY_NAME } from '@env';
import { decode as decodeBase64 } from '@stablelib/base64';
import { box } from 'tweetnacl';

import { getCurrencies } from '../services/CurrencyService';
import { storeExpense } from '../services/ExpenseService';
import { sendMessage } from '../services/MessageService';
import { encrypt } from '../utils/crypto';
import { useStore } from '../store/store';

import UserPicker from '../components/UserPicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;
export default function AddExpenseScreen() {
  const { user: currentUser } = useContext(AuthContext);

  // Access route params & navigation
  const route = useRoute();
  const navigation = useNavigation<NavigationProps>();

  // Extract conversation from params if present
  const { conversation } = (route.params as { conversation: any }) || {};

  // Local UI state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expense_date: new Date(),
    currency: '',
    user_ids: [] as number[],
    group_id: undefined as number | undefined,
    split_type: '', // e.g., 'equally'
  });

  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [processing, setProcessing] = useState(false);

  // For storing new messages
  const newMessage = useStore((state) => state.newMessage);

  // If conversation is required and not provided, exit early
  if (!conversation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          No conversation data provided. Please go back.
        </Text>
      </View>
    );
  }

  /** -------------------------------------
   *  Load currencies once
   -------------------------------------- */
  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await getCurrencies('/currencies');
      setCurrencies(response.data);
    } catch (error) {
      setFetchError('Failed to fetch currencies');
      console.error('Failed to fetch currencies', error);
    } finally {
      setLoadingCurrencies(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  /** -------------------------------------
   *  Initialize form data if group conversation
   -------------------------------------- */
  useEffect(() => {
    if (!conversation) return;

    if (conversation.is_group) {
      const defaultCurrency = conversation?.default_currency || '';
      setFormData((prev) => ({
        ...prev,
        currency: defaultCurrency,
        group_id: conversation.id || '',
        split_type: 'equally',
        // By default, exclude the owner from splitting? Or do you want to include them?
        user_ids: conversation.users
          .filter((u: any) => conversation.owner_id !== u.id)
          .map((u: any) => u.id),
      }));
    }
  }, [conversation]);

  /** -------------------------------------
   *  Handle form submission
   -------------------------------------- */
  const createOrUpdateExpense = useCallback(() => {
    if (processing) return; // Prevent double-tap
    setProcessing(true);

    // Defer heavy logic until interactions have finished or next frame
    InteractionManager.runAfterInteractions(async () => {
      try {
        // 1. Master key
        const masterKey = await AsyncStorage.getItem(MASTER_KEY_NAME);
        if (!masterKey) {
          Alert.alert('Key expired', 'Please update your encryption key.');
          setProcessing(false);
          return;
        }

        // 2. Build expense data
        const expenseData = {
          group_id: formData.group_id,
          description: formData.description.trim(),
          amount: formData.amount.trim(),
          expense_date: formData.expense_date.toISOString(),
          split_type: formData.split_type,
          user_ids: JSON.stringify(formData.user_ids),
          currency: formData.currency,
        };

        // 3. Store expense
        const response = await storeExpense('/expense', expenseData);
        // 4. Build a message for the conversation about this expense
        const obj = { message: response.message };
        const users = conversation.users || [];
        const encryptedMessages: Record<number, { encryptedMessage: any }> = {};

        // 5. Encrypt message for each user in the group
        await Promise.all(
          users.map(async (user: any) => {
            if (!user.public_key) return;
            const sharedKeyForOtherUser = box.before(
              decodeBase64(user.public_key),
              decodeBase64(masterKey)
            );
            const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);
            encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
          })
        );

        // 6. Encrypt also for the current user
        if (currentUser?.public_key) {
          const sharedKeyForCurrentUser = box.before(
            decodeBase64(currentUser.public_key),
            decodeBase64(masterKey)
          );
          encryptedMessages[currentUser.id] = {
            encryptedMessage: encrypt(sharedKeyForCurrentUser, obj),
          };
        }

        // 7. Build final data for message
        const finalData: any = {
          expense_id: response.expense_id,
          message: JSON.stringify(encryptedMessages),
          type: 'expense',
          message_string: response.message,
        };

        // If in a group
        if (conversation.is_group) {
          finalData.group_id = conversation.id;
        } else {
          // For one-on-one (not sure if you handle that here)
          finalData.receiver_id = conversation.id;
        }

        // 8. Send message
        const msgResponse = await sendMessage('/message', finalData);
        newMessage(msgResponse.data);

        // 9. Navigate back to ChatRoom
        const linkRoute = conversation.is_group
          ? `/group/${conversation.id}`
          : `/user/${conversation.id}`;

        navigation.navigate('ChatRoom', {
          conversation,
          linkRoute,
        });
      } catch (err) {
        console.error('Failed to create or update expense', err);
      } finally {
        setProcessing(false);
      }
    });
  }, [
    conversation,
    currentUser,
    formData,
    navigation,
    newMessage,
    processing,
  ]);

  /** -------------------------------------
   *  UI rendering
   -------------------------------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Add Expense</Text>

      {/* UserPicker */}
      <View style={styles.section}>
        <UserPicker
          value={formData.user_ids
            .map((id) => conversation.users.find((u: any) => u.id === id))
            .filter(Boolean)}
          options={
            conversation.users.filter((u: any) => currentUser.id !== u.id) || []
          }
          onSelect={(selectedUsers) =>
            setFormData({
              ...formData,
              user_ids: selectedUsers.map((u: any) => u.id),
            })
          }
          isGroup={conversation.is_group}
        />
      </View>

      {/* Currency Picker */}
      <View style={[styles.section, styles.row]}>
        <Text style={styles.label}>Currency</Text>
        {loadingCurrencies ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : fetchError ? (
          <Text style={styles.errorText}>{fetchError}</Text>
        ) : (
          <Picker
            selectedValue={formData.currency}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, currency: val }))
            }
            style={{ flex: 1 }}
          >
            <Picker.Item label="Select a currency" value="" />
            {currencies.map((c) => (
              <Picker.Item
                key={c.code}
                label={c.code.toUpperCase()}
                value={c.code}
              />
            ))}
          </Picker>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description"
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
        />
      </View>

      {/* Amount */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, amount: text }))
          }
        />
      </View>

      {/* Date */}
      <View style={[styles.section, styles.row]}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {formData.expense_date.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.expense_date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || formData.expense_date;
              setShowDatePicker(false);
              setFormData((prev) => ({ ...prev, expense_date: currentDate }));
            }}
          />
        )}
      </View>

      {/* Submit */}
      <View style={{ marginVertical: 20 }}>
        <Button
          title={processing ? 'Processing...' : 'Add Expense'}
          onPress={createOrUpdateExpense}
          disabled={processing}
        />
      </View>
    </ScrollView>
  );
}

/** ---------------------------
 *  Styles
----------------------------*/
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginRight: 10,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginRight: 10,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});
