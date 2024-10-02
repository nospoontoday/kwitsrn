import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useContext, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AuthContext from '../contexts/AuthContext';
import { sendMessage } from '../services/MessageService';
import { useStore } from '../store/store';
import { box } from "tweetnacl";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_KEY } from "@env";
import { encrypt } from '../utils/crypto';
import {decode as decodeBase64, encode as encodeBase64} from '@stablelib/base64';

export default function MessageInput({conversation}) {
    const {user, setUser} = useContext(AuthContext);
    const [inputMessage, setInputMessage] = useState(""); // Local state for input
    const [messageSending, setMessageSending] = useState(false);
    const newMessage = useStore((state) => state.newMessage);

    async function handleSendMessage() {

        if (messageSending || inputMessage.trim() === "") return;

        try {
            setMessageSending(true);
            const encryptedMessages = {};

            if(conversation.is_group) {
                const users = conversation.users;
                //@TODO
            } else {
                const obj = { message: inputMessage };

                //does he receiver have public_key?
                if(!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                // does the current logged in user have a master key?
                const masterKey = await AsyncStorage.getItem(MASTER_KEY);

                if(!masterKey) {
                    console.log("Key expired. Please update key.");
                    return;
                }

                const sharedKey = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));

                const encrypted = encrypt(sharedKey, obj);

                encryptedMessages[conversation.id] = {
                    encryptedMessage: encrypted
                }

                encryptedMessages[user.id] = {
                    encryptedMessage: encrypted
                }

                const response = await sendMessage("/message", {
                    message: JSON.stringify(encryptedMessages),
                    message_string: inputMessage,
                    receiver_id: conversation.id
                });

                newMessage(response.data);
                setInputMessage("");
                setMessageSending(false);
            }
            
        } catch (e) {
            console.log(e.response)
            console.log(e);
            setInputMessage(false);
        }
    }


    return (
        <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
            <TextInput 
                value={inputMessage}
                placeholder="Type message..."
                style={{fontSize: hp(2)}}
                className="flex-1 mr-2"
                onChangeText={(text) => setInputMessage(text)}
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