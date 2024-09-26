import { View, Text, ScrollView } from 'react-native';
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, user }) {
  const scrollViewRef = useRef();

  // Scroll to bottom when messages are loaded or updated
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false }); // false to immediately scroll to the end on load
    }
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 10, flexGrow: 1 }}
    >
      {
        messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'gray' }}>No messages found</Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <MessageItem message={message} key={index} user={user} />
          ))
        )
      }
    </ScrollView>
  );
}
