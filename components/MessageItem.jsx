import { View, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { formatMessageDateLong } from '../helpers/date';
import { Image } from 'expo-image';
import AuthContext from '../contexts/AuthContext';
import { MASTER_KEY } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {decode as decodeBase64, encode as encodeBase64} from '@stablelib/base64';
import { box } from "tweetnacl";
import { decrypt } from '../utils/crypto';

export default function MessageItem({ message }) {
    const { user } = useContext(AuthContext);
    const isUserSender = user.id === message.sender_id;
    const [decryptedMessage, setDecryptedMessage] = useState("Decrypting...");

    useEffect(() => {
        async function decryptMessage() {
            try {
                const senderPublicKey = message.sender.public_key;

                if (!senderPublicKey) {
                    console.log("This user needs to log in first.");
                    return;
                }
                
                const masterKey = await AsyncStorage.getItem(MASTER_KEY);
                
                if (!masterKey) {
                    console.log("Key expired. Please update key.");
                    return;
                }
                
                const parsedMessages = JSON.parse(message.message);
                const encryptedMessage = parsedMessages[user.id]?.encryptedMessage;
                
                if (encryptedMessage) {
                    const isReceiver = user.id === message.receiver_id;
                    const publicKey = isReceiver ? senderPublicKey : user.public_key;
                
                    // Decrypt the message using the appropriate public key
                    const sharedKey = box.before(decodeBase64(publicKey), decodeBase64(masterKey));
                    const decrypted = decrypt(sharedKey, encryptedMessage);

                    setDecryptedMessage(decrypted);
                }

            } catch (err) {
                console.log("Failed to decrypt message:", err);
                setDecryptedMessage("Decryption failed");
            }
        }

        if(message.message) {
            decryptMessage();
        } else {
            setDecryptedMessage("No Message");
        }
    }, [message.message, user.id]);
 
    return (
        <View style={[
            { marginBottom: 12, flexDirection: 'row' },
            isUserSender ? { justifyContent: 'flex-end', marginRight: 12 } : { justifyContent: 'flex-start', marginLeft: 12 },
        ]}>

            {/* Display sender's avatar only if it's not the user */}
            {!isUserSender && (
                <Image
                    source={require('../assets/images/avatar.png')}
                    style={{
                        width: wp(10),
                        height: wp(10),
                        borderRadius: wp(5),
                        marginRight: 8,
                        marginTop: 3,
                    }}
                />
            )}

            <View style={{ width: wp(70) }}>

                {/* Message Header (Sender and Date) */}
                <View style={[
                    { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
                    isUserSender ? { alignSelf: 'flex-end', justifyContent: 'flex-end' } : { alignSelf: 'flex-start', justifyContent: 'flex-start' }
                ]}>
                    {!isUserSender && (
                        <Text 
                            className="text-neutral-800"
                            style={{ fontSize: hp(1.9), marginRight: 8 }}>
                            {message.sender.name}
                        </Text>
                    )}
                    <Text style={{ fontSize: hp(1.4), color: 'gray' }}>
                        {formatMessageDateLong(message.created_at)}
                    </Text>
                </View>

                {/* Message Bubble */}
                <View style={[
                    { padding: 12, borderRadius: 20 },
                    isUserSender
                        ? { alignSelf: 'flex-end', backgroundColor: 'white', borderColor: '#D3D3D3', borderWidth: 1 }
                        : { alignSelf: 'flex-start', backgroundColor: '#E0E7FF', borderColor: '#C3DAFE', borderWidth: 1 }
                ]}>
                    <Text style={{ fontSize: hp(1.9) }}>
                        {decryptedMessage?.message}
                    </Text>
                </View>
            </View>
        </View>
    );
}
