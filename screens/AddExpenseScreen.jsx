import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getCurrencies } from "../services/CurrencyService";
import { useRoute, useNavigation } from "@react-navigation/native"; // Import useNavigation
import UserPicker from "../components/UserPicker";
import AuthContext from "../contexts/AuthContext";
import { storeExpense } from "../services/ExpenseService";
import { MASTER_KEY } from "@env";
import { decode as decodeBase64 } from '@stablelib/base64';
import { encrypt } from '../utils/crypto';
import { box } from "tweetnacl";
import { sendMessage } from "../services/MessageService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from '../store/store';

export default function AddExpenseScreen() {
    const { user: currentUser } = useContext(AuthContext);
    const route = useRoute();
    const navigation = useNavigation(); // Get the navigation object
    const { conversation } = route.params;

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        expense_date: new Date(),
        currency: "",
        user_ids: []
    });

    const [expense, setExpense] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [group, setGroup] = useState({});
    const newMessage = useStore((state) => state.newMessage);

    const fetchCurrencies = async () => {
        try {
            const response = await getCurrencies('/currencies');
            setCurrencies(response.data);
        } catch (error) {
            setError("Failed to fetch currencies");
            console.error("Failed to fetch currencies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();

        if (conversation.is_group) {
            setGroup(conversation);

            // If there's a default currency in the conversation, set it
            const defaultCurrency = conversation?.default_currency || "";
            
            // Setting additional fields in formData
            setFormData(prevFormData => ({
                ...prevFormData,
                currency: defaultCurrency,
                group_id: conversation.id || "", // Set group_id based on conversation id
                split_type: "equally", // Set split_type to "equally"
                user_ids: conversation.users
                    .filter((u) => conversation.owner_id !== u.id) // Filter users based on owner_id
                    .map((u) => u.id), // Map to get user ids
            }));
        }
    }, [conversation]);

    const createOrUpdateExpense = async () => {
        setProcessing(true);

        try {
            // Get the current logged-in user's master key
            const masterKey = await AsyncStorage.getItem(MASTER_KEY);
            if (!masterKey) {
                console.log("Key expired. Please update key.");
                return;
            }

            // Use the existing formData state
            const expenseData = {
                group_id: group.id,
                description: formData.description,
                amount: formData.amount,
                expense_date: formData.expense_date.toISOString(), // Use ISO string for dates
                split_type: formData.split_type,
                user_ids: JSON.stringify(formData.user_ids),
                currency: formData.currency,
            };

            const response = await storeExpense("/expense", expenseData);

            const users = conversation.users;
            const encryptedMessages = {};
            const obj = { message: response.message };

            await Promise.all(users.map(async (user) => {
                if (!user.public_key) {
                    return;
                }

                const sharedKeyForOtherUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
            }));

            const sharedKeyForCurrentUser = box.before(decodeBase64(currentUser.public_key), decodeBase64(masterKey));
            const encryptedForCurrentUser = encrypt(sharedKeyForCurrentUser, obj);
            encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

            expenseData.expense_id = response.expense_id;
            expenseData.message = JSON.stringify(encryptedMessages);
            expenseData.type = "expense";
            expenseData.message_string = response.message;

            const data = await sendMessage("/message", expenseData);

            // Redirect to ChatRoom after successfully creating the expense
            const linkRoute = conversation.is_group ? `/group/${conversation.id}` : `/user/${conversation.id}`;
            navigation.navigate('ChatRoom', {
                conversation,
                linkRoute,
            });
            newMessage(data.data);
            setProcessing(false);

        } catch (err) {
            console.error(err);
            setProcessing(false);
        }
    };

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                Add Expense
            </Text>

            <View className="mt-4">
                <UserPicker
                    value={formData.user_ids.map(id => conversation.users.find(u => u.id === id)).filter(Boolean)}
                    options={conversation.users.filter(u => currentUser.id !== u.id) || []}
                    onSelect={(selectedUsers) =>
                        setFormData({
                            ...formData,
                            user_ids: selectedUsers.map((u) => u.id),
                        })
                    }
                    isGroup={conversation.is_group} // Pass the is_group prop
                />
                {/* InputError component here if needed */}
            </View>

            {/* Currency Picker */}
            <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, marginRight: 10 }}>Currency</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : error ? (
                    <Text style={{ color: 'red' }}>{error}</Text>
                ) : (
                    <Picker
                        selectedValue={formData.currency}
                        onValueChange={(itemValue) =>
                            setFormData({ ...formData, currency: itemValue })
                        }
                        style={{ height: 50, width: '60%' }}
                    >
                        <Picker.Item label="Select a currency" value="" />
                        {currencies.map((currency) => (
                            <Picker.Item
                                key={currency.code}
                                label={currency.code.toUpperCase()}
                                value={currency.code}
                            />
                        ))}
                    </Picker>
                )}
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>Description</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter description"
                    value={formData.description}
                    onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                    }
                />
            </View>

            {/* Amount Input */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>Amount</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        paddingHorizontal: 10,
                    }}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={formData.amount}
                    onChangeText={(text) =>
                        setFormData({ ...formData, amount: text })
                    }
                />
            </View>

            {/* Date Picker */}
            <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={{ 
                        fontSize: 16, 
                        marginRight: 10, 
                        color: '#007BFF',
                        fontWeight: 'bold', // Optional: make text bold
                    }}>
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
                            setFormData({ ...formData, expense_date: currentDate });
                        }}
                    />
                )}
            </View>

            {/* Submit Button */}
            <Button title="Add Expense" onPress={createOrUpdateExpense} disabled={processing} />
        </ScrollView>
    );
}
