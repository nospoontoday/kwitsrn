import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
  } from 'react';
  import {
    View,
    Text,
    Animated,
    StyleSheet,
    Alert,
  } from 'react-native';
  import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
  import { Image } from 'expo-image';
  import { PanGestureHandler, State } from 'react-native-gesture-handler';
  import { FontAwesome } from '@expo/vector-icons';
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { decode as decodeBase64 } from '@stablelib/base64';
  import { box } from 'tweetnacl';
  import Markdown, { MarkdownIt } from 'react-native-markdown-display';
  
  import AuthContext from '../contexts/AuthContext';
  import { MASTER_KEY_NAME } from '@env';
  import { decrypt } from '../utils/crypto';
  import { formatMessageDateLong } from '../helpers/date';
  import { destroyMessage } from '../services/MessageService';
  import { useStore } from '../store/store';
  
  /* --------------------------
    1. Custom Hook for Decryption
  --------------------------- */
  function useDecryptedMessage(message, user) {
    const [decryptedMessage, setDecryptedMessage] = useState('Decrypting...');
  
    useEffect(() => {
      async function decryptMessage() {
        try {
          if (!message.sender?.public_key) {
            console.log('This user needs to log in first.');
            return;
          }
  
          const masterKey = await AsyncStorage.getItem(MASTER_KEY_NAME);
          if (!masterKey) {
            console.log('Key expired. Please update key.');
            return;
          }
  
          if (!message.message) {
            setDecryptedMessage('No Message');
            return;
          }
  
          const parsedMessages = JSON.parse(message.message);
          const encryptedData = parsedMessages[user.id]?.encryptedMessage;
          if (!encryptedData) {
            setDecryptedMessage('(No encrypted data for this user)');
            return;
          }
  
          const decryptMessageWithKey = (publicKey) => {
            const sharedKey = box.before(
              decodeBase64(publicKey),
              decodeBase64(masterKey)
            );
            return decrypt(sharedKey, encryptedData);
          };
  
          let decrypted;
          // Distinguish between group vs. direct conversation
          
          if (message.receiver_id) {
            // 1-on-1 message
            decrypted = decryptMessageWithKey(user.public_key);
          } else if (message.group_id) {
            // Group message
            const publicKey =
              message.sender_id === user.id
                ? message.sender.public_key
                : user.public_key;
            decrypted = decryptMessageWithKey(publicKey);
          }
  
          setDecryptedMessage(decrypted?.message || 'Could not decrypt message');
        } catch (err) {
          console.log('Failed to decrypt message:', err);
          setDecryptedMessage('Decryption failed');
        }
      }
  
      decryptMessage();
    }, [message, user.id]);
  
    return decryptedMessage;
  }
  
  /* --------------------------
    2. Helper Component for Rendering the Bubble
  --------------------------- */
  function MessageBubble({
    isUserSender,
    hasExpense,
    decryptedMessage,
    onGestureEvent,
    onHandlerStateChange,
    swipeable,
  }) {
    // Base bubble styles
    const baseStyle = [
      styles.bubble,
      {
        alignSelf: isUserSender ? 'flex-end' : 'flex-start',
        backgroundColor: isUserSender ? 'white' : '#E0E7FF',
        borderColor: isUserSender ? '#D3D3D3' : '#C3DAFE',
      },
    ];
  
    // If this bubble is from the user AND has an expense,
    // let it be swipeable via PanGestureHandler
    if (isUserSender && hasExpense && swipeable) {
      return (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={baseStyle}>
            <Markdown markdownit={MarkdownIt({ typographer: true })}>
              {decryptedMessage}
            </Markdown>
          </Animated.View>
        </PanGestureHandler>
      );
    }
  
    // Otherwise, just a static bubble
    return (
      <View style={baseStyle}>
        <Markdown markdownit={MarkdownIt({ typographer: true })}>
          {decryptedMessage}
        </Markdown>
      </View>
    );
  }
  
  /* --------------------------
    3. Main Component
  --------------------------- */
  export default function MessageItem({ message }) {
    const { user } = useContext(AuthContext);
    const isUserSender = user.id === message.sender_id;
    const [isDeleted, setIsDeleted] = useState(false);
  
    // Decrypt the message
    const decryptedMessage = useDecryptedMessage(message, user);
  
    // Store action
    const deleteMessageFromStore = useStore((state) => state.deleteMessage);
  
    // Animation variables
    const translateX = useRef(new Animated.Value(0)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;
  
    /* --------------------------
      3a. Delete Handler
    --------------------------- */
    const handleDeleteMessage = useCallback(async () => {
      if (message.expense_id) {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this expense?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              onPress: async () => {
                try {
                  await destroyMessage(`/message/${message.id}`);
                  deleteMessageFromStore(message.id);
                  setIsDeleted(true);
                } catch (error) {
                  console.error('Failed to delete message:', error);
                }
              },
            },
          ],
          { cancelable: true }
        );
      }
    }, [message, deleteMessageFromStore]);
  
    /* --------------------------
      3b. Gesture Handlers
    --------------------------- */
    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );
  
    const onHandlerStateChange = ({ nativeEvent }) => {
      if (nativeEvent.state === State.END) {
        if (nativeEvent.translationX < -50) {
          // Swipe left
          Animated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
          Animated.timing(iconOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    };
  
    /* --------------------------
      3c. Reset after deletion
    --------------------------- */
    useEffect(() => {
      if (isDeleted) {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsDeleted(false);
        });
      }
    }, [isDeleted]);
  
    return (
      <View style={{ marginBottom: 12 }}>
        {/* Trash icon that appears on swipe */}
        <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          <FontAwesome
            name="trash"
            size={24}
            color="red"
            style={{ marginHorizontal: 10 }}
            onPress={handleDeleteMessage}
          />
        </Animated.View>
  
        {/* Main message content */}
        <Animated.View
          style={[
            styles.messageRow,
            {
              transform: [{ translateX }],
              justifyContent: isUserSender ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {/* Avatar for non-sender */}
          {!isUserSender && (
            <Image
              source={require('../assets/images/avatar.png')}
              style={styles.avatar}
            />
          )}
  
          <View style={{ width: wp(70) }}>
            {/* Sender name and timestamp */}
            <View
              style={[
                styles.nameTimestampRow,
                isUserSender
                  ? { alignSelf: 'flex-end', justifyContent: 'flex-end' }
                  : { alignSelf: 'flex-start', justifyContent: 'flex-start' },
              ]}
            >
              {!isUserSender && (
                <Text
                  style={{
                    fontSize: hp(1.9),
                    marginRight: 8,
                    color: '#1f2937', // neutral-800
                  }}
                >
                  {message.sender.name}
                </Text>
              )}
              <Text style={{ fontSize: hp(1.4), color: 'gray' }}>
                {formatMessageDateLong(message.created_at)}
              </Text>
            </View>
  
            {/* Actual message bubble (swipeable only if user + expense) */}
            <MessageBubble
              isUserSender={isUserSender}
              hasExpense={!!message.expense_id}
              decryptedMessage={decryptedMessage}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              swipeable
            />
          </View>
        </Animated.View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      paddingHorizontal: 12,
    },
    avatar: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      marginRight: 8,
      marginTop: 3,
    },
    nameTimestampRow: {
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'center',
    },
    bubble: {
      padding: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    iconContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 20,
      width: 100,
    },
  });
  