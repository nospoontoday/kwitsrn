import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Entypo } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Image } from 'expo-image';

export default function ChatRoomHeaderLeft({ conversation }) {
    const isGroup = conversation.is_group;
    const isUser = conversation.is_user;

    return (
        <View className="flex-row items-center gap-4">
            <TouchableOpacity>
                <Entypo name="chevron-left" size={hp(4)} color="#737373" />
            </TouchableOpacity>
            <View className="flex-row items-center">
                <Image
                    source={require('../assets/images/avatar.png')}
                    style={{height: hp(4.5), aspectRatio: 1, borderRadius: 100}}
                />
                <Text
                    style={{ fontSize: hp(2.5) }}
                    className="text-neutral-700 font-medium ml-3"
                >
                    {conversation.name}
                </Text>

            </View>
        </View>
    )
}