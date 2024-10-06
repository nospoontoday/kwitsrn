import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function ChatRoomHeaderRight({ conversation }) {
  const navigation = useNavigation();

  const openAddExpense = () => {
    navigation.navigate('AddExpense', {
      conversation: conversation
    });
  }

  return (
    <View className="flex-row items-center gap-8">
      <TouchableOpacity
        onPress={openAddExpense}
      >
        <Ionicons name="list-sharp" size={hp(2.8)} color={"#737373"} />
      </TouchableOpacity>
    </View>
  );
}
