import { View, Text, Animated, StyleSheet, Alert } from 'react-native';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { formatMessageDateLong } from '../helpers/date';
import { Image } from 'expo-image';
import AuthContext from '../contexts/AuthContext';
import { MASTER_KEY } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as decodeBase64 } from '@stablelib/base64';
import { box } from "tweetnacl";
import { decrypt } from '../utils/crypto';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons'; // For showing icons
import { destroyMessage } from '../services/MessageService';
import { useStore } from '../store/store';

export default function MessageItem({ message }) {
    const { user } = useContext(AuthContext);
    const isUserSender = user.id === message.sender_id;
    const [decryptedMessage, setDecryptedMessage] = useState("Decrypting...");
    const deleteMessage = useStore((state) => state.deleteMessage);

    // Animation variables
    const translateX = useRef(new Animated.Value(0)).current; // For moving the message view left
    const iconOpacity = useRef(new Animated.Value(0)).current; // For controlling the visibility of the icons
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        // Reset the swipe position if the message is deleted
        if (isDeleted) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                // Reset deleted state after the animation is done
                setIsDeleted(false);
            });
        }
    }, [isDeleted]); // Run the effect when isDeleted changes

    useEffect(() => {
        async function decryptMessage() {
            try {
                const senderPublicKey = message.sender.public_key;
                if (!senderPublicKey) {
                    console.log("This user needs to log in first.");
                    return;
                }

                const masterKey = await AsyncStorage.getItem(MASTER_KEY);
                if (!masterKey) {
                    console.log("Key expired. Please update key.");
                    return;
                }

                const parsedMessages = JSON.parse(message.message);
                const encryptedMessage = parsedMessages[user.id]?.encryptedMessage;

                if (!encryptedMessage) return;

                const decryptMessageWithKey = (publicKey) => {
                    const sharedKey = box.before(decodeBase64(publicKey), decodeBase64(masterKey));
                    return decrypt(sharedKey, encryptedMessage);
                };

                let decrypted;

                if (message.receiver_id) {
                    const isReceiver = user.id === message.receiver_id;
                    const publicKey = isReceiver ? senderPublicKey : user.public_key;
                    decrypted = decryptMessageWithKey(publicKey);
                } else if (message.group_id) {
                    const publicKey = message.sender_id === user.id ? user.public_key : message.sender.public_key;
                    decrypted = decryptMessageWithKey(publicKey);
                }

                setDecryptedMessage(decrypted.message);

            } catch (err) {
                console.log("Failed to decrypt message:", err);
                setDecryptedMessage("Decryption failed");
            }
        }

        if (message.message) {
            decryptMessage();
        } else {
            setDecryptedMessage("No Message");
        }
    }, [message.message, user.id]);

    const handleDeleteMessage = async (message) => {
        // Check if the message has an associated expense ID
        console.log("MESSAGE:", message);
        if (message.expense_id) {
            Alert.alert(
                "Confirm Deletion",
                "Are you sure you want to delete this expense?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Deletion canceled"),
                        style: "cancel", // Adds a cancel style to the button
                    },
                    {
                        text: "Delete",
                        onPress: async () => {
                            try {
                                await destroyMessage(`/message/${message.id}`);
                                deleteMessage(message.id);
                                setIsDeleted(true);
                            } catch (error) {
                                console.error("Failed to delete message:", error);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        }
    };

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            if (nativeEvent.translationX < -50) {
                Animated.timing(translateX, {
                    toValue: -100,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
                Animated.timing(iconOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            } else {
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
                Animated.timing(iconOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    return (
        <View style={{ marginBottom: 12 }}>
            <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
                <FontAwesome 
                    name="trash" 
                    size={24} 
                    color="red" 
                    style={{ marginHorizontal: 10 }} 
                    onPress={() => handleDeleteMessage(message)}
                />
                <FontAwesome name="edit" size={24} color="blue" style={{ marginHorizontal: 10 }} />
            </Animated.View>
    
            <Animated.View
                style={[
                    {
                        flexDirection: 'row',
                        transform: [{ translateX }],
                        paddingHorizontal: 12,
                    },
                    isUserSender ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
                ]}
            >
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
                    <View
                        style={[
                            { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
                            isUserSender ? { alignSelf: 'flex-end', justifyContent: 'flex-end' } : { alignSelf: 'flex-start', justifyContent: 'flex-start' },
                        ]}
                    >
                        {!isUserSender && (
                            <Text className="text-neutral-800" style={{ fontSize: hp(1.9), marginRight: 8 }}>
                                {message.sender.name}
                            </Text>
                        )}
                        <Text style={{ fontSize: hp(1.4), color: 'gray' }}>
                            {formatMessageDateLong(message.created_at)}
                        </Text>
                    </View>
    
                    {isUserSender && message.expense_id ? (
                        <PanGestureHandler
                            onGestureEvent={onGestureEvent}
                            onHandlerStateChange={onHandlerStateChange}
                        >
                            <Animated.View
                                style={[
                                    { padding: 12, borderRadius: 20 },
                                    {
                                        alignSelf: 'flex-end',
                                        backgroundColor: 'white',
                                        borderColor: '#D3D3D3',
                                        borderWidth: 1,
                                    },
                                ]}
                            >
                                <Markdown
                                    markdownit={MarkdownIt({ typographer: true })}
                                    style={{ fontSize: hp(1.9) }}
                                >
                                    {decryptedMessage}
                                </Markdown>
                            </Animated.View>
                        </PanGestureHandler>
                    ) : (
                        <View
                            style={[
                                { padding: 12, borderRadius: 20 },
                                {
                                    alignSelf: isUserSender ? 'flex-end' : 'flex-start',
                                    backgroundColor: isUserSender ? 'white' : '#E0E7FF',
                                    borderColor: isUserSender ? '#D3D3D3' : '#C3DAFE',
                                    borderWidth: 1,
                                },
                            ]}
                        >
                            <Markdown
                                markdownit={MarkdownIt({ typographer: true })}
                                style={{ fontSize: hp(1.9) }}
                            >
                                {decryptedMessage}
                            </Markdown>
                        </View>
                    )}

                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 20,
        width: 100,
    },
});
