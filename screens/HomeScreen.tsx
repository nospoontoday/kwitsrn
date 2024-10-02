import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Button, SafeAreaView, Text, View } from "react-native";
import AuthContext from "../contexts/AuthContext";
import { logout } from "../services/AuthService";
import { StatusBar } from "expo-status-bar";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ChatList from "../components/ChatList";
import { loadConversations } from "../services/ConversationService";
import { useStore } from "../store/store";
import Pusher from "pusher-js";
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from "@env";
import Constants from "expo-constants";

export default function() {
    const { user, setUser, echo } = useContext(AuthContext);
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const conversations = useStore((state) => state.conversations);
    const setConversations = useStore((state) => state.setConversations);
    const uri = `http://${Constants.expoConfig?.hostUri?.split(':').shift()}:80` ?? 'http://yourapi.com';

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channelString  = `message.group.${conversation.id}`;
            
            if(conversation.is_user) {
                channelString = `message.user.${[
                    user.id,
                    conversation.id
                ]
                    .sort((a, b) => a - b)
                    .join(".")}`;
            }
            
            const channel = echo?.private(channelString)
            .error((err) => {
                console.error(err);
            })
            .listen('.SocketMessage', (event) => {
                console.log('RealTimeEvent received:', event);
                // Update your React component state or perform other actions
            });
        });

    }, [conversations])

    // get the conversations
    useEffect(() => {
        if(user?.id) {
            // getUsers();
            getConversations();
        }
    },[]);

    async function getConversations() {
        try {
            const data = await loadConversations();
            setConversations(data);
        } catch (e) {
            console.log(e.response.data)
        }
    }

    // decrypt the conversations
    useEffect(() => {
        decryptConversations();
    }, [conversations, user.id]);

    // sort the conversations
    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(a.last_message_date);
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);

    async function getUsers() {

    }

    async function decryptConversations() {
        try {
            const decryptedConversations = await Promise.all(
                conversations.map(async (conversation) => {
                    if (!conversation.last_message) {
                        return conversation;
                    }
                    try {
                        // check pin availability
                        // const encryptedPin = await SecureStore.getItemAsync("encryptedPin");

                        // if (!encryptedPin || (typeof encryptedPin === 'object' && Object.keys(encryptedPin).length === 0)) {
                        //     throw new Error('Decryption failed');
                        // }
                        // const salt = await base64ToArrayBuffer(currentUser.salt);
                        // const derivedPinKey = await deriveKey(import.meta.env.VITE_MASTER_KEY, salt);
        
                        // const storedPin = await decryptPrivateKey(derivedPinKey, encryptedPin, currentUser.pin_iv);

                        // const decryptedLastMessage = await decryptWithPrivateKey(
                        //     JSON.parse(conversation.last_message),
                        //     user.id,
                        //     user.iv,
                        //     user.salt,
                        //     1234
                        // );
                        // console.log("decryptConversation", decryptedLastMessage);
                        return {
                            ...conversation,
                            last_message: decryptedLastMessage ?? "Decryption failed",
                        };
                    } catch (error) {
                        // console.error("Failed to decrypt message:", error);
                        return {
                            ...conversation,
                            last_message: "Decryption failed",
                        };
                    }
                })
            );

            setLocalConversations(decryptedConversations);
        } catch (error) {
            console.error("Failed to decrypt conversations:", error);
        }
    };

    async function handleLogout() {
        try {
            await logout();
        } catch (e) {
            console.log(e.response.data);
        }

        setUser(null);
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="light" />
            {
                sortedConversations.length > 0 ? (
                    <ChatList sortedConversations={sortedConversations} />
                ) : (
                    <View className="flex items-center" style={{ top: hp(30)  }} >
                        <ActivityIndicator size="large" />
                    </View>
                )
            }
        </SafeAreaView>
    );

}