import { Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import MessageList from '../components/MessageList';
import { loadMessages } from '../services/MessageService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import CustomKeyboardView from '../components/CustomKeyboardView';
import MessageInput from '../components/MessageInput';
import { useStore } from '../store/store';

export default function ChatRoomScreen({ route }) {
    const { linkRoute, conversation } = route.params;

    const messages = useStore((state) => state.messages);  // Zustand state
    const setMessages = useStore((state) => state.setMessages);  // Zustand state setter
    const [loading, setLoading] = useState(false);  // Loading state

    useEffect(() => {
        getMessages(linkRoute);  // Trigger message loading on route change
    }, [linkRoute, conversation]);

    async function getMessages(linkRoute) {
        try {
            setLoading(true);  // Start loading indicator
            const data = await loadMessages(linkRoute);  // Fetch messages
    
            // Ensure messages is always an array and reverse it
            const messages = data?.messages ? data.messages.reverse() : [];
            setMessages(messages);  // Update Zustand state
        } catch (e) {
            console.error(e);  // Log error
        } finally {
            setLoading(false);  // End loading indicator
        }
    }

    return (
        <CustomKeyboardView inChat={true}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar style="dark" />
                <View style={{ height: 3, borderBottomWidth: 1, borderBottomColor: '#D1D5DB' }} />
                <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: '#F3F4F6', overflow: 'visible' }}>
                    {loading ? (
                        <Text>Loading...</Text> 
                    ) : (
                        <View style={{ flex: 1 }}>
                            <MessageList loading={loading} />
                        </View>
                    )}
                    <View style={{ marginBottom: hp(2.7), paddingTop: 8 }}>
                        <MessageInput conversation={conversation} />
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}
