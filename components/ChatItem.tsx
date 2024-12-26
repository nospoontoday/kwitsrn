import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { formatMessageDateShort } from '../helpers/date';
import { useNavigation } from '@react-navigation/native';
import { Conversation } from '../types/conversation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
interface ChatItemProps {
    item: any;
    noBorder: boolean;
    index: number;
}

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

export default function ChatItem({ item, noBorder, index }: ChatItemProps) {
    const navigation = useNavigation<NavigationProps>();
    const isGroup = item.is_group;

    const linkRoute = isGroup ? `/group/${item.id}` : `/user/${item.id}`;

    const openChatRoom = () => {
        navigation.navigate('ChatRoom', {
            conversation: item,
            linkRoute: linkRoute,
        });
    }

    return (
        <TouchableOpacity
            style={{
                padding: 15,
                backgroundColor: 'white',
                flexDirection: 'row',
                alignItems: 'center',
            }}
            className={`${noBorder ? '' : 'border-b border-b-neutral-200'}`}
            onPress={openChatRoom}
        >
        <Image
            source={require('../assets/images/avatar.png')}
            style={{ height: hp(6), width: hp(6) }}
            className="rounded-full"
        />

        {/* Container for name, last message, and time */}
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 10,
            }}
        >
            {/* Name and last message container */}
            <View
                style={{
                    flexDirection: 'column',
                }}
            >
                {/* Name */}
                <Text
                    style={{
                        fontSize: hp(1.8),
                        fontWeight: '600',
                    }}
                    className="text-neutral-800"
                >
                    {item.name}
                </Text>

                {/* Last message */}
                <Text
                    style={{
                        fontSize: hp(1.6),
                        color: '#888',
                    }}
                    className="text-neutral-500"
                >
                    {item.last_message}
                </Text>
            </View>

            {/* Time on the right */}
            <Text
                style={{
                    fontSize: hp(1.8),
                    fontWeight: '500',
                    color: '#888',
                }}
                className="text-neutral-500"
            >
            {item.last_message_date && (
                formatMessageDateShort(item.last_message_date)
            )}
            </Text>
        </View>
        </TouchableOpacity>
    );
}
