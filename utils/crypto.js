import { getRandomBytes } from "expo-crypto";
import { box, setPRNG } from "tweetnacl";
import {decode as decodeUTF8, encode as encodeUTF8} from '@stablelib/utf8';
import {decode as decodeBase64, encode as encodeBase64} from '@stablelib/base64';
import { savePublicKey, saveSecretKey } from "../services/KeyService";
import { MASTER_KEY_NAME, MASTER_KEY_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function PRNG(x, n) {
    const randomBytes = getRandomBytes(n);
    for (let index = 0; index < n; index++) {
        x[index] = randomBytes[index];
    }
}

setPRNG(PRNG);

const newNonce = () => getRandomBytes(box.nonceLength);

export const generateKeyPair = () => box.keyPair();

export const encrypt = ( message, recipientPublicKey, senderPrivateKey ) => {

    try {
        const nonce = newNonce();

        if (!nonce) {
            throw new Error('nonce not generated.');
        }

        const recipientPublicKeyUint8 = decodeBase64(recipientPublicKey);
        const senderPrivateKeyUint8 = decodeBase64(senderPrivateKey);

        // Create a shared key using the sender's private key and recipient's public key
        const sharedKey = box.before(recipientPublicKeyUint8, senderPrivateKeyUint8);

        const messageUint8 = encodeUTF8(JSON.stringify(message));
        const encryptedMessage = box.after(messageUint8, nonce, sharedKey);

        if (!encryptedMessage) {
            throw new Error('no encrypted message generated.');
        }
    
        const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
        fullMessage.set(nonce);
        fullMessage.set(encryptedMessage, nonce.length);
    
        return encodeBase64(fullMessage);
    } catch (error) {
        console.error("ERROR when encrypting message: ", error);
        throw error;
    }
}

// Create key pair and store as Base64
export async function createKeyPair() {
    const { publicKey, secretKey } = generateKeyPair();

    try {
        await savePublicKey(encodeBase64(publicKey));
        await saveSecretKey(encodeBase64(secretKey));
    } catch (error) {
        console.log("Error saving keys", e);
    }
}

/**
 * Decrypt a message for a user.
 * @param {string} encryptedMessage - Base64-encoded encrypted message.
 * @param {string} recipientPrivateKey - Base64-encoded private key of the recipient.
 * @param {string} senderPublicKey - Base64-encoded public key of the sender.
 * @returns {string} - The decrypted plain-text message.
 */
export const decrypt = (messageWithNonce, recipientPrivateKey, senderPublicKey) => {
    const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
  
    // Extract nonce and encrypted data
    const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
    
    const message = messageWithNonceAsUint8Array.slice(
        box.nonceLength,
        messageWithNonce?.length
    );
  
    const recipientPrivateKeyUint8 = decodeBase64(recipientPrivateKey);
    const senderPublicKeyUint8 = decodeBase64(senderPublicKey);
  
    // Generate the shared key
    const sharedKey = box.before(senderPublicKeyUint8, recipientPrivateKeyUint8);
  
    // Decrypt the message
    const decrypted = box.open.after(message, nonce, sharedKey);
  
    if (!decrypted) {
      throw new Error("Decryption failed.");
    }

    const base64DecryptedMessage = decodeUTF8(decrypted);
  
    return JSON.parse(base64DecryptedMessage);
  };