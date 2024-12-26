import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';
import { Feather, AntDesign } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AuthContext from '../contexts/AuthContext';
import { oweMe, oweYou, sendMessage } from '../services/MessageService';
import { useStore } from '../store/store';
import { box } from 'tweetnacl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_KEY } from '@env';
import { encrypt } from '../utils/crypto';
import { decode as decodeBase64 } from '@stablelib/base64';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import MenuItem from './CustomMenuItems';

export default function MessageInput({ conversation }) {
  const { user: currentUser } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const newMessage = useStore((state) => state.newMessage);

  /**
   * Helper function to load the stored master key.
   * Throws an error if the master key is not found.
   */
  async function getMasterKeyOrFail() {
    const masterKey = await AsyncStorage.getItem(MASTER_KEY);
    if (!masterKey) {
      throw new Error('Key expired or unavailable. Please update key.');
    }
    return masterKey;
  }

  /**
   * Encrypt a message object for all relevant recipients in a conversation.
   * Returns an object mapping user IDs to their encrypted message.
   */
  async function encryptMessageForConversation(
    conversation,
    currentUser,
    masterKey,
    messageObj
  ) {
    const encryptedMessages = {};

    if (conversation.is_group) {
      // Group conversation
      const { users } = conversation;
      await Promise.all(
        users.map(async (user) => {
          if (!user.public_key) return; // Skip if user has no public key
          const sharedKey = box.before(
            decodeBase64(user.public_key),
            decodeBase64(masterKey)
          );
          const encryptedForUser = encrypt(sharedKey, messageObj);
          encryptedMessages[user.id] = { encryptedMessage: encryptedForUser };
        })
      );
    } else {
      // One-to-one conversation
      if (!conversation.public_key) {
        throw new Error('Recipient user has no public key or needs to log in.');
      }
      const sharedKeyForOtherUser = box.before(
        decodeBase64(conversation.public_key),
        decodeBase64(masterKey)
      );
      const encryptedForOtherUser = encrypt(sharedKeyForOtherUser, messageObj);
      encryptedMessages[conversation.id] = {
        encryptedMessage: encryptedForOtherUser,
      };
    }

    // Always encrypt for the current user as well
    const sharedKeyForCurrentUser = box.before(
      decodeBase64(currentUser.public_key),
      decodeBase64(masterKey)
    );
    const encryptedForCurrentUser = encrypt(sharedKeyForCurrentUser, messageObj);
    encryptedMessages[currentUser.id] = {
      encryptedMessage: encryptedForCurrentUser,
    };

    return encryptedMessages;
  }

  /**
   * Helper function to handle sending any encrypted message.
   *
   * @param {Object}   options
   * @param {string}   options.url           - The endpoint for sending the message (e.g. "/message")
   * @param {string}   options.messageString - The plain-text message (e.g., inputMessage or data.message)
   * @param {string}   options.messageType   - The type of the message, e.g. "info" or "message"
   * @param {string}   options.emoji         - Optional static emoji (like "👍") if needed
   * @param {function} options.apiMethod     - The function used to get a specialized response (e.g. oweYou, oweMe) or just null
   */
  async function sendEncryptedMessage({
    url,
    conversation,
    currentUser,
    messageString,
    messageType = 'message',
    emoji,
    apiMethod, // e.g. oweYou or oweMe, if needed
  }) {
    setMessageSending(true);

    try {
      const masterKey = await getMasterKeyOrFail();
      const formData = {};

      // For group conversations, we need the group_id. For one-to-one, receiver_id.
      if (conversation.is_group) {
        formData['group_id'] = conversation.id;
      } else {
        formData['receiver_id'] = conversation.id;
      }

      let finalMessageString = messageString;
      let messageObj = { message: messageString };

      // If there is an API method (oweYou or oweMe) that returns a data object
      // that includes the final message, call it:
      if (apiMethod) {
        const data = await apiMethod(url, formData);
        finalMessageString = data.message;
        messageObj = { message: data.message };
      }

      // If an emoji was provided, override or append the message
      if (emoji) {
        finalMessageString = emoji;
        messageObj = { message: emoji };
      }

      // Encrypt for everyone in the conversation
      const encryptedMessages = await encryptMessageForConversation(
        conversation,
        currentUser,
        masterKey,
        messageObj
      );

      // Build the final formData
      formData['message_string'] = finalMessageString;
      formData['message'] = JSON.stringify(encryptedMessages);
      if (messageType) formData['type'] = messageType;

      // Now send the message
      const response = await sendMessage('/message', formData);
      newMessage(response.data);
    } catch (error) {
      console.log('Error sending message:', error);
    } finally {
      setMessageSending(false);
    }
  }

  /**
   * Handler for "You Owe Me" clicks.
   * Uses the oweMe API method under the hood.
   */
  async function onYouOweMeClick() {
    if (messageSending) return;
    await sendEncryptedMessage({
      url: '/group/owe-me',
      conversation,
      currentUser,
      messageType: 'info',
      apiMethod: oweMe, // specifically calls the oweMe service
    });
  }

  /**
   * Handler for "I Owe You" clicks.
   * Uses the oweYou API method under the hood.
   */
  async function onIOweYouClick() {
    if (messageSending) return;
    await sendEncryptedMessage({
      url: '/group/owe-you',
      conversation,
      currentUser,
      messageType: 'info',
      apiMethod: oweYou, // specifically calls the oweYou service
    });
  }

  /**
   * Handler for sending a user-typed message.
   */
  async function handleSendMessage() {
    if (messageSending || inputMessage.trim() === '') return;

    await sendEncryptedMessage({
      url: '/message',
      conversation,
      currentUser,
      messageString: inputMessage.trim(),
    });
    setInputMessage('');
  }

  /**
   * Handler for sending a "like" (👍) emoji.
   */
  async function handleLikeMessage() {
    if (messageSending) return;
    await sendEncryptedMessage({
      url: '/message',
      conversation,
      currentUser,
      emoji: '👍',
    });
  }

  return (
    <View style={styles.container}>
      {/* Plus button with popup menu */}
      <Menu>
        <MenuTrigger>
          <AntDesign name="plus" size={hp(2.7)} color="#737373" />
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 10,
              borderCurve: 'continuous',
              marginTop: -60,
              marginLeft: 0,
              backgroundColor: 'white',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 0 },
              width: inputMessage ? 160 : 'auto',
            },
          }}
        >
          <MenuItem
            action={onYouOweMeClick}
            value={'uome'}
            icon={<Feather name="dollar-sign" size={hp(2.5)} color="#737373" />}
          />
          <Divider />
          <MenuItem
            action={onIOweYouClick}
            value={'iou'}
            icon={<Feather name="credit-card" size={hp(2.5)} color="#737373" />}
          />
        </MenuOptions>
      </Menu>

      {/* Text input field */}
      <TextInput
        value={inputMessage}
        placeholder="Type message..."
        style={styles.input}
        onChangeText={setInputMessage}
      />

      {/* Send / Like button */}
      <TouchableOpacity
        disabled={messageSending}
        onPress={
          inputMessage.trim() === '' ? handleLikeMessage : handleSendMessage
        }
        style={styles.sendButton}
      >
        {inputMessage.trim() === '' ? (
          <AntDesign name="like1" size={hp(2.7)} color="#737373" />
        ) : (
          <Feather name="send" size={hp(2.7)} color="#737373" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically center items
    marginHorizontal: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db', // Equivalent to neutral-300
    borderRadius: 50,
    paddingVertical: 8, // Add padding for vertical centering
    paddingHorizontal: 12, // Add padding for horizontal spacing
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    marginHorizontal: 8, // Spacing between input and buttons
    height: hp(5), // Set height to align with icons
  },
  sendButton: {
    backgroundColor: '#e5e7eb', // Equivalent to neutral-200
    padding: 8,
    borderRadius: 50,
    marginLeft: 4, // Adjust spacing if necessary
  },
  iconButton: {
    marginRight: 8, // Adjust spacing for the plus icon
  },
});

const Divider = () => {
  return <View style={{ height: 1, width: '100%', backgroundColor: '#e5e7eb' }} />;
};
