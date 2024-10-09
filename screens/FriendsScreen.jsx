import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { requestFriend } from '../services/FriendService';

export default function FriendsScreen() {
  const [email, setEmail] = useState(''); // State to store the email
  const [loading, setLoading] = useState(false); // State for loading indicator

  const handleAddFriend = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true); // Show loading indicator
      const formData = { email: email };
      const response = await requestFriend("/friend/request", formData);

      if (response.success) {
        setEmail(''); // Clear the input field after submission
        console.log(`Friend request sent to "${email}"`);
        Alert.alert('Success', response.message);
      } else {
        Alert.alert('Error', response.message || 'Failed to send friend request.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while sending the request.');
      console.error(err);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Add a Friend</Text>

      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          paddingHorizontal: 10,
          marginBottom: 20,
        }}
        placeholder="Enter friend's email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Add Friend" onPress={handleAddFriend} />
      )}
    </View>
  );
}
