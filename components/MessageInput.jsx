import { View, TextInput, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { Feather, AntDesign } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import AuthContext from '../contexts/AuthContext';
import { sendMessage } from '../services/MessageService';
import { useStore } from '../store/store';
import { box } from "tweetnacl";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_KEY } from "@env";
import { encrypt } from '../utils/crypto';
import { decode as decodeBase64 } from '@stablelib/base64';

export default function MessageInput({ conversation }) {
    const { user: currentUser } = useContext(AuthContext);
    const [inputMessage, setInputMessage] = useState(""); // Local state for input
    const [messageSending, setMessageSending] = useState(false);
    const newMessage = useStore((state) => state.newMessage);

    async function handleSendMessage() {
        if (messageSending || inputMessage.trim() === "") return;

        try {
            setMessageSending(true);
            const encryptedMessages = {};
            const obj = { message: inputMessage };
            const formData = {
                message_string: inputMessage
            };

            // Get the current logged-in user's master key
            const masterKey = await AsyncStorage.getItem(MASTER_KEY);
            if (!masterKey) {
                console.log("Key expired. Please update key.");
                return;
            }

            const sharedKeyForCurrentUser = box.before(decodeBase64(currentUser.public_key), decodeBase64(masterKey));
            const encryptedForCurrentUser = encrypt(sharedKeyForCurrentUser, obj);

            if (conversation.is_group) {
                const users = conversation.users;
                formData['group_id'] = conversation.id;

                // Encrypt the message for each user in the group
                await Promise.all(users.map(async (user) => {
                    if (!user.public_key) {
                        return;
                    }

                    const sharedKeyForOtherUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                    const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                    // Store encrypted messages
                    encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
                }));

                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData['message'] = JSON.stringify(encryptedMessages);
            } else {

                // Check if the receiver has a public key
                if (!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                // Create shared keys for encryption
                const sharedKeyForOtherUser = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                // Store encrypted messages
                encryptedMessages[conversation.id] = { encryptedMessage: encryptedForOtherUser };
                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData["message"] = JSON.stringify(encryptedMessages);
                formData["receiver_id"] = conversation.id;
            }

            // Send the message to the server
            const response = await sendMessage("/message", formData);

            newMessage(response.data);
            setInputMessage(""); // Reset input field
            setMessageSending(false);
        } catch (e) {
            console.log("Error sending message:", e.response);
            setInputMessage(""); // Reset input field on error
            setMessageSending(false);
        }
    }

    async function handleLikeMessage() {
        
        try {
            const encryptedMessages = {};
            const obj = { message: "👍" };
            const formData = {
                message_string: inputMessage
            };
        
            // Get the current logged-in user's master key
            const masterKey = await AsyncStorage.getItem(MASTER_KEY);
            if (!masterKey) {
                console.log("Key expired. Please update key.");
                return;
            }

            const sharedKeyForCurrentUser = box.before(decodeBase64(currentUser.public_key), decodeBase64(masterKey));
            const encryptedForCurrentUser = encrypt(sharedKeyForCurrentUser, obj);

            if (conversation.is_group) {
                const users = conversation.users;
                formData['group_id'] = conversation.id;

                // Encrypt the message for each user in the group
                await Promise.all(users.map(async (user) => {
                    if (!user.public_key) {
                        return;
                    }

                    const sharedKeyForOtherUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                    const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                    // Store encrypted messages
                    encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
                }));

                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };
            
                formData['message'] = JSON.stringify(encryptedMessages);
            } else {
                
                // Check if the receiver has a public key
                if (!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                // Create shared keys for encryption
                const sharedKeyForOtherUser = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                // Store encrypted messages
                encryptedMessages[conversation.id] = { encryptedMessage: encryptedForOtherUser };
                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData["message"] = JSON.stringify(encryptedMessages);
                formData["receiver_id"] = conversation.id;
            }

            // Send the message to the server
            const response = await sendMessage("/message", formData);

            newMessage(response.data);
            setMessageSending(false);

        } catch (err) {
            setMessageSending(false);
            console.error(err);
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
                onPress={inputMessage.trim() === "" ? handleLikeMessage : handleSendMessage}
                className="bg-neutral-200 p-2 mr-[1px] rounded-full"
            >
                {inputMessage.trim() === "" ? (
                    <AntDesign name="like1" size={hp(2.7)} color="#737373" />  // Render "like" icon if input is empty
                ) : (
                    <Feather name="send" size={hp(2.7)} color="#737373" />   // Render "send" icon if there's input
                )}
            </TouchableOpacity>
        </View>
    );
}
