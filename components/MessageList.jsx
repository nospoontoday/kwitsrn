import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';
import { useStore } from '../store/store';

export default function MessageList({ loading }) {
  const scrollViewRef = useRef(null);
  const messages = useStore((state) => state.messages);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      onContentSizeChange={() => {
        // Whenever the content size changes (e.g., new messages), scroll to the bottom:
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }}
    >
      {messages.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>No messages found</Text>
        </View>
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
