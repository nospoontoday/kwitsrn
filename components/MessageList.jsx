import { View, Text, ScrollView } from 'react-native';
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { useStore } from '../store/store';

export default function MessageList({ loading }) {
  const scrollViewRef = useRef();
  const messages = useStore((state) => state.messages);

  // Scroll to bottom when messages are loaded or updated
  useEffect(() => {
    console.log('Messages updated:', messages);
    if (messages?.length > 0) {
      // Adding a delay to ensure the ScrollView is fully rendered
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true }); // Check if ref is valid before scrolling
        }
      }, 100);  // Short delay for rendering
    }
  }, [messages]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: 'gray' }}>Loading messages...</Text>
      </View>
    );
  }

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
            <MessageItem message={message} key={index} />
          ))
        )
      }
    </ScrollView>
  );
}
