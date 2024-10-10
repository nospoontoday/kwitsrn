import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ChatItem from './ChatItem'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStore } from '../store/store';
import AuthContext from '../contexts/AuthContext';
import Constants from "expo-constants";
import { RefreshControl } from 'react-native-gesture-handler';
import { loadConversations } from '../services/ConversationService';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatList() {
    const { user, echo } = useContext(AuthContext);
    
    const uri = `http://${Constants.expoConfig?.hostUri?.split(':').shift()}:80` ?? 'http://yourapi.com';

    const [refreshing, setRefreshing] = useState(true);
    const [sortedConversations, setSortedConversations] = useState([]);
    const conversations = useStore((state) => state.conversations);
    const [localConversations, setLocalConversations] = useState([]);
    const setConversations = useStore((state) => state.setConversations);

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channelString  = `message.group.${conversation.id}`;
            
            if (conversation.is_user) {
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
            });
        });

    }, [conversations]);

    useFocusEffect(
        React.useCallback(() => {
            if(user?.id) {
                getConversations();
            }
        }, [user?.id])
    );

    async function getConversations() {
        try {
            const data = await loadConversations();
            setRefreshing(false);
            setConversations(data);
        } catch (e) {
            console.log(e.response.data);
        }
    }

    useEffect(() => {
        decryptConversations();
    }, [conversations, user.id]);

    async function decryptConversations() {
        try {
            const decryptedConversations = await Promise.all(
                conversations.map(async (conversation) => {
                    if (!conversation.last_message) {
                        return conversation;
                    }
                    try {
                        // Decrypt logic here
                        return {
                            ...conversation,
                            last_message: "Decryption logic",
                        };
                    } catch (error) {
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
    }

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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                {refreshing ? <ActivityIndicator /> : null}
                <FlatList 
                    data={sortedConversations}
                    contentContainerStyle={{ gap: 5 }}
                    keyExtractor={item => Math.random()}
                    showsVerticalScrollIndicator={false}
                    enableEmptySections={true}
                    renderItem={({item, index}) => <ChatItem noBorder={index + 1 == sortedConversations?.length} item={item} index={index} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={getConversations} />
                    }
                />
            </View>
        </SafeAreaView>

    )
}