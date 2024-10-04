import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
    const [inputMessage, setInputMessage] = useState(""); 
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

                await Promise.all(users.map(async (user) => {
                    if (!user.public_key) {
                        return;
                    }

                    const sharedKeyForOtherUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                    const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                    encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
                }));

                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData['message'] = JSON.stringify(encryptedMessages);
            } else {
                if (!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                const sharedKeyForOtherUser = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                encryptedMessages[conversation.id] = { encryptedMessage: encryptedForOtherUser };
                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData["message"] = JSON.stringify(encryptedMessages);
                formData["receiver_id"] = conversation.id;
            }

            const response = await sendMessage("/message", formData);

            newMessage(response.data);
            setInputMessage(""); 
            setMessageSending(false);
        } catch (e) {
            console.log("Error sending message:", e.response);
            setInputMessage(""); 
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

                await Promise.all(users.map(async (user) => {
                    if (!user.public_key) {
                        return;
                    }

                    const sharedKeyForOtherUser = box.before(decodeBase64(user.public_key), decodeBase64(masterKey));
                    const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                    encryptedMessages[user.id] = { encryptedMessage: encryptedForOtherUser };
                }));

                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };
            
                formData['message'] = JSON.stringify(encryptedMessages);
            } else {
                if (!conversation.public_key) {
                    console.log("This user needs to log in first.");
                    return;
                }

                const sharedKeyForOtherUser = box.before(decodeBase64(conversation.public_key), decodeBase64(masterKey));
                const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, obj);

                encryptedMessages[conversation.id] = { encryptedMessage: encryptedForOtherUser };
                encryptedMessages[currentUser.id] = { encryptedMessage: encryptedForCurrentUser };

                formData["message"] = JSON.stringify(encryptedMessages);
                formData["receiver_id"] = conversation.id;
            }

            const response = await sendMessage("/message", formData);

            newMessage(response.data);
            setMessageSending(false);

        } catch (err) {
            setMessageSending(false);
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconButton}>
                <AntDesign name="plus" size={hp(2.7)} color="#737373" />
            </TouchableOpacity>
            <TextInput
                value={inputMessage}
                placeholder="Type message..."
                style={styles.input}
                onChangeText={(text) => setInputMessage(text)}
            />
            <TouchableOpacity
                disabled={messageSending}
                onPress={inputMessage.trim() === "" ? handleLikeMessage : handleSendMessage}
                style={styles.sendButton}
            >
                {inputMessage.trim() === "" ? (
                    <AntDesign name="like1" size={hp(2.7)} color="#737373" />
                ) : (
                    <Feather name="send" size={hp(2.7)} color="#737373" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically center items
        marginHorizontal: 12,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db', // Equivalent to neutral-300
        borderRadius: 50,
        paddingVertical: 8, // Add padding for vertical centering
        paddingHorizontal: 12, // Add padding for horizontal spacing
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        marginHorizontal: 8, // Spacing between input and buttons
        height: hp(5), // Set height to align with icons
    },
    sendButton: {
        backgroundColor: '#e5e7eb', // Equivalent to neutral-200
        padding: 8,
        borderRadius: 50,
        marginLeft: 4, // Adjust spacing if necessary
    },
    iconButton: {
        marginRight: 8, // Adjust spacing for the plus icon
    },
});
