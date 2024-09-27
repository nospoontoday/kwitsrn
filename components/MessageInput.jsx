import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AuthContext from '../contexts/AuthContext';
import { sendMessage } from '../services/MessageService';

export default function MessageInput({conversation}) {
    const {user, setUser} = useContext(AuthContext);
    const [newMessage, setNewMessage] = useState("");
    const [messageSending, setMessageSending] = useState(false);

    async function handleSendMessage() {

        if(messageSending) return;

        if(newMessage.trim() === "") {
            //@todo set error
            return;
        }

        try {
            if(conversation.is_group) {
                //@TODO
            } else {
                setMessageSending(true);
                await sendMessage("/message", {
                    message: newMessage,
                    message_string: newMessage,
                    receiver_id: conversation.id
                });

                setNewMessage("");
                setMessageSending(false);
            }
            
        } catch (e) {
            console.log(e);
        }
    }


    return (
        <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
            <TextInput 
                value={newMessage}
                placeholder="Type message..."
                style={{fontSize: hp(2)}}
                className="flex-1 mr-2"
                onChangeText={(text) => setNewMessage(text)}
            />
            <TouchableOpacity
                disabled={messageSending}
                onPress={handleSendMessage}
                className="bg-neutral-200 p-2 mr-[1px] rounded-full"
            >
                <Feather name="send" size={hp(2.7)} color="#737373" />
            </TouchableOpacity>
        </View>
    )
}