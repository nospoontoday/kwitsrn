import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import MessageList from '../components/MessageList';
import { loadMessages } from '../services/MessageService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Feather } from '@expo/vector-icons';
import CustomKeyboardView from '../components/CustomKeyboardView';
import AuthContext from '../contexts/AuthContext';

export default function ChatRoomScreen({ route }) {
    const { user, setUser } = useContext(AuthContext);
    const { linkRoute, conversation } = route.params;
    const [ messages, setMessages ] = useState([]);

    // get messages
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
                            <MessageList messages={messages} user={user} />
                        </View>
                    )}

                    <View style={{ marginBottom: hp(2.7) }} className="pt-2">
                        <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
                            <TextInput 
                                placeholder="Type message..."
                                style={{fontSize: hp(2)}}
                                className="flex-1 mr-2"
                            />
                            <TouchableOpacity 
                                className="bg-neutral-200 p-2 mr-[1px] rounded-full"
                            >
                                <Feather name="send" size={hp(2.7)} color="#737373" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    )
}