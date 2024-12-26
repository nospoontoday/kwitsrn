import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';

const isIOS = Platform.OS === 'ios';

export default function CustomKeyboardView({ children, inChat }) {
  // Decide if we need extra offset and container style for "inChat"
  const keyboardVerticalOffset = inChat ? 90 : 0;
  const contentContainerStyle = inChat ? { flex: 1 } : undefined;

  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
