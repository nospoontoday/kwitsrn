import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;

interface ChatRoomHeaderRightProps {
  conversation: any;
}

export default function ChatRoomHeaderRight({ conversation }: ChatRoomHeaderRightProps) {
  const navigation = useNavigation<NavigationProps>();

  const handleOpenAddExpense = () => {
    if (!conversation) {
      console.warn('No conversation provided to ChatRoomHeaderRight.');
      return;
    }

    navigation.navigate('AddExpense', { conversation });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleOpenAddExpense}
        activeOpacity={0.6}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons name="list-sharp" size={hp(2.8)} color="#737373" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Make sure the container isn't too small or overshadowed
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  iconButton: {
    // Ensure a decent minimum tap area; 44x44 is often recommended
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
