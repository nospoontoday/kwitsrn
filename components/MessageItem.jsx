import { View, Text } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { formatMessageDateLong } from '../helpers/date';
import { Image } from 'expo-image';

export default function MessageItem({ message, user }) {
    const isUserSender = user.id === message.sender_id;

    return (
        <View style={[
            { marginBottom: 12, flexDirection: 'row' },
            isUserSender ? { justifyContent: 'flex-end', marginRight: 12 } : { justifyContent: 'flex-start', marginLeft: 12 },
        ]}>

            {/* Display sender's avatar only if it's not the user */}
            {!isUserSender && (
                <Image
                    source={require('../assets/images/avatar.png')}
                    style={{
                        width: wp(10),
                        height: wp(10),
                        borderRadius: wp(5),
                        marginRight: 8,
                        marginTop: 3,
                    }}
                />
            )}

            <View style={{ width: wp(70) }}>

                {/* Message Header (Sender and Date) */}
                <View style={[
                    { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
                    isUserSender ? { alignSelf: 'flex-end', justifyContent: 'flex-end' } : { alignSelf: 'flex-start', justifyContent: 'flex-start' }
                ]}>
                    {!isUserSender && (
                        <Text 
                            className="text-neutral-800"
                            style={{ fontSize: hp(1.9), marginRight: 8 }}>
                            {message.sender.name}
                        </Text>
                    )}
                    <Text style={{ fontSize: hp(1.4), color: 'gray' }}>
                        {formatMessageDateLong(message.created_at)}
                    </Text>
                </View>

                {/* Message Bubble */}
                <View style={[
                    { padding: 12, borderRadius: 20 },
                    isUserSender
                        ? { alignSelf: 'flex-end', backgroundColor: 'white', borderColor: '#D3D3D3', borderWidth: 1 }
                        : { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', borderColor: '#C3DAFE', borderWidth: 1 }
                ]}>
                    <Text style={{ fontSize: hp(1.9) }}>
                        {message?.message}
                    </Text>
                </View>
            </View>
        </View>
    );
}
