import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
export default function ChatRoomHeaderRight() {
  return (
    <View className="flex-row items-center gap-8">
      <Ionicons name="call" size={hp(2.8)} color={'#737373'} />
      <Ionicons name="videocam" size={hp(2.8)} color={'#737373'} />
    </View>
  )
}