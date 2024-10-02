import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useContext, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import AuthContext from '../contexts/AuthContext';
import { sendMessage } from '../services/MessageService';
import { useStore } from '../store/store';
import { box } from "tweetnacl";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_KEY } from "@env";
import { encrypt } from '../utils/crypto';
import { decode as decodeBase64 } from '@stablelib/base64';

export default function MessageInput({ conversation }) {
    const { user } = useContext(AuthContext);
    const [inputMessage, setInputMessage] = useState(""); // Local state for input
    const [messageSending, setMessageSending] = useState(false);
    const newMessage = useStore((state) => state.newMessage);

    async function handleSendMessage() {
        if (messageSending || inputMessage.trim() === "") return;

        try {
            setMessageSending(true);
            const encryptedMessages = {};

            if (conversation.is_group) {
                const users = conversation.users;
                // @TODO: Implement group message encryption
            } else {
                const obj = { message: inputMessage };

                // Check if the receiver has a public key
                if (!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                // Get the current logged-in user's master key
                const masterKey = await AsyncStorage.getItem(MASTER_KEY);
                if (!masterKey) {
                    console.log("Key expired. Please update key.");
                    return;
                }

                // Create shared keys for encryption
                const sharedKeyForOtherUser = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                const sharedKeyForCurrentUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                const encryptedForCurrentUser = encrypt(sharedKeyForCurrentUser, obj);

                // Store encrypted messages
                encryptedMessages[conversation.id] = { encryptedMessage: encryptedForOtherUser };
                encryptedMessages[user.id] = { encryptedMessage: encryptedForCurrentUser };

                // Send the message to the server
                const response = await sendMessage("/message", {
                    message: JSON.stringify(encryptedMessages),
                    message_string: inputMessage,
                    receiver_id: conversation.id,
                });

                newMessage(response.data);
                setInputMessage(""); // Reset input field
                setMessageSending(false);
            }
        } catch (e) {
            console.log("Error sending message:", e);
            setInputMessage(""); // Reset input field on error
            setMessageSending(false);
        }
    }

    return (
        <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
            <TextInput 
                value={inputMessage}
                placeholder="Type message..."
                style={{ fontSize: hp(2) }}
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
    );
}
