import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';
import { useStore } from '../store/store';

function LoadingState() {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.loadingText}>Loading messages...</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.emptyText}>No messages found</Text>
    </View>
  );
}

export default function MessageList({ loading }) {
  const scrollViewRef = useRef(null);
  const messages = useStore((state) => state.messages);

  /**
   * Helper function to scroll to the end of the ScrollView.
   * Wrapped in a useCallback so that it doesn't recreate a new
   * function every render (though that’s often not a big issue).
   */
  const scrollToBottom = useCallback(() => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, []);

  /**
   * Whenever messages changes, scroll to bottom if we have messages.
   * Add a short delay to ensure the ScrollView is fully rendered first.
   */
  useEffect(() => {
    if (messages?.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((message, index) => (
          <MessageItem message={message} key={index} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 10,
    flexGrow: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
  },
});
