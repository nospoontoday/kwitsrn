import { View } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import MessageList from '../components/MessageList';
import { loadMessages } from '../services/MessageService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import CustomKeyboardView from '../components/CustomKeyboardView';
import MessageInput from '../components/MessageInput';
import { useStore } from '../store/store';

export default function ChatRoomScreen({ route }) {
    const { linkRoute, conversation } = route.params;

    const messages = useStore((state) => state.messages);
    const setMessages = useStore((state) => state.setMessages);

    useEffect(() => {
        getMessages(linkRoute);
    }, [linkRoute, conversation]);

    async function getMessages(linkRoute) {
        try {
            const data = await loadMessages(linkRoute);
            setMessages(data.messages.reverse());
        } catch (e) {
            console.log(e.response.data)
        }
    }

    return (
        <CustomKeyboardView inChat={true}>
            <View className="flex-1 bg-white">
                <StatusBar style="dark" />
                <View className="h-3 border-b border-neutral-300" />
                <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
                    {messages && (
                        <View className="flex-1">
                            <MessageList />
                        </View>
                    )}

                    <View style={{ marginBottom: hp(2.7) }} className="pt-2">
                        <MessageInput conversation={conversation} />
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}