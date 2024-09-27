import { View, Text, ScrollView } from 'react-native';
import React, { useRef, useEffect, useContext } from 'react';
import MessageItem from './MessageItem';
import AuthContext from '../contexts/AuthContext';
import { useStore } from '../store/store';

export default function MessageList() {
  const scrollViewRef = useRef();
  const { user } = useContext(AuthContext);
  const messages = useStore((state) => state.messages);

  // Scroll to bottom when messages are loaded or updated
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      // Delay the scroll to allow time for rendering
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true }); // animated for smooth scrolling
      }, 100);  // Short delay for rendering
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
