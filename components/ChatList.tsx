import React, { useContext, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';

import AuthContext from '../contexts/AuthContext';
import { useStore } from '../store/store';
import ChatItem from './ChatItem';
import { loadConversations } from '../services/ConversationService';

interface Conversation {
  id: number;
  is_user?: boolean;
  users?: any[];
  last_message?: string;
  last_message_date?: string;
  blocked_at?: string | null;
  // ...other fields
}

export default function ChatList() {
  const { user, echo } = useContext(AuthContext);
  const conversations = useStore((state) => state.conversations);
  const setConversations = useStore((state) => state.setConversations);

  const [refreshing, setRefreshing] = useState(true);
  const [localConversations, setLocalConversations] = useState<Conversation[]>(
    []
  );
  const [sortedConversations, setSortedConversations] = useState<
    Conversation[]
  >([]);

  // Build the URI (though not directly used below, so you could remove if unused)
  const uri =
    `http://${Constants.expoConfig?.hostUri?.split(':').shift()}:80` ||
    'http://yourapi.com';

  /** --------------------------------
   *  1. Fetch conversations on focus
   --------------------------------- */
  const getConversations = useCallback(async () => {
    try {
      const data = await loadConversations();
      setConversations(data);
    } catch (error: any) {
      console.log('Failed to load conversations:', error?.response?.data || error);
    } finally {
      setRefreshing(false);
    }
  }, [setConversations]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        getConversations();
      }
    }, [user?.id, getConversations])
  );

  /** --------------------------------
   *  2. Subscribe to Echo Channels
   *     whenever 'conversations' changes
   --------------------------------- */
   useEffect(() => {
    if (conversations?.length) {
      conversations.forEach((conversation) => {
        let channelString = `message.group.${conversation.id}`;
  
        if (conversation.is_user) {
          channelString = `message.user.${[user.id, conversation.id]
            .sort((a, b) => a - b)
            .join('.')}`;
        }
  
        echo
          ?.private(channelString)
          .error((err: any) => {
            console.error('Echo channel error:', err);
          })
          .listen('.SocketMessage', (event: any) => {
            console.log('RealTimeEvent received:', event);
          });
      });
    }
  }, [conversations, echo, user.id]);

  /** --------------------------------
   *  3. Decrypt last_message placeholders
   --------------------------------- */
  useEffect(() => {
    async function decryptConversations() {
      try {
        const decrypted = await Promise.all(
          conversations.map(async (conv) => {
            if (!conv.last_message) return conv;
            try {
              // TODO: Insert real decryption here if needed
              return {
                ...conv,
                last_message: 'Decryption logic placeholder',
              };
            } catch {
              return {
                ...conv,
                last_message: 'Decryption failed',
              };
            }
          })
        );

        setLocalConversations(decrypted);
      } catch (err) {
        console.error('Failed to decrypt conversations:', err);
      }
    }

    if (user?.id) {
      decryptConversations();
    }
  }, [conversations, user?.id]);

  /** --------------------------------
   *  4. Sort conversations
   --------------------------------- */
  useEffect(() => {
    // Avoid in-place sort by copying the array: 
    // But .sort() returns the same array reference.
    const sorted = [...localConversations].sort((a, b) => {
      // If both are blocked
      if (a.blocked_at && b.blocked_at) {
        return a.blocked_at > b.blocked_at ? 1 : -1;
      }
      // If only 'a' is blocked
      if (a.blocked_at) return 1;
      // If only 'b' is blocked
      if (b.blocked_at) return -1;

      // Then compare last_message_date
      if (a.last_message_date && b.last_message_date) {
        return b.last_message_date.localeCompare(a.last_message_date);
      } else if (a.last_message_date) {
        // 'b' doesn't have a date -> 'a' goes first
        return -1;
      } else if (b.last_message_date) {
        // 'a' doesn't have a date -> 'b' goes first
        return 1;
      }
      return 0;
    });

    setSortedConversations(sorted);
  }, [localConversations]);

  /** --------------------------------
   *  5. Render
   --------------------------------- */
  const handleRefresh = () => {
    setRefreshing(true);
    getConversations();
  };

  // Provide a stable key for FlatList items (assuming 'id' is unique)
  const keyExtractor = (item: Conversation) => item.id.toString();

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {refreshing && <ActivityIndicator size="small" />}

        <FlatList
          data={sortedConversations}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ gap: 5 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ChatItem
              noBorder={index + 1 === sortedConversations?.length}
              item={item}
              index={index}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    // any additional styling
  },
});
