import { View, Text, TextInput, Button, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { requestFriend, getFriendRequests, respondToFriendRequest, confirmFriend } from '../services/FriendService';
import AuthContext from '../contexts/AuthContext';

export default function FriendsScreen() {
  const { user: currentUser } = useContext(AuthContext);
  const [email, setEmail] = useState(''); // State to store the email
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [friendRequests, setFriendRequests] = useState([]); // State to store friend requests
  const [loadingRequests, setLoadingRequests] = useState(false); // State for friend requests loading

  // Fetch friend requests on component mount
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await getFriendRequests("/friend/requests");

      const userId = currentUser.id;

      // Filter friend requests to exclude those where the sender is the current user
      const filteredRequests = response.data?.filter(request => request.sender.id !== userId);

      setFriendRequests(filteredRequests);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

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

  const handleConfirm = async (requestId) => {
    try {
      setLoadingRequests(true); // Show loading indicator for requests
      const response = await confirmFriend(`/friend/confirm/${requestId}`);
      if (response.success) {
        Alert.alert('Success', response.message);
        fetchFriendRequests(); // Refresh the list after response
      } else {
        Alert.alert('Error', 'Failed to process the request.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while responding to the request.');
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const renderFriendRequest = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
      <Text>{item.sender.name}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => handleConfirm(item.sender.id)}
          style={{ backgroundColor: 'green', padding: 10, marginRight: 10 }}
        >
          <Text style={{ color: 'white' }}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRespondToRequest(item.sender.id, 'deny')}
          style={{ backgroundColor: 'red', padding: 10 }}
        >
          <Text style={{ color: 'white' }}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      <Text style={{ fontSize: 24, marginVertical: 20 }}>Friend Requests</Text>

      {loadingRequests ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequest}
          keyExtractor={item => item.id.toString()} // Assuming each request has a unique 'id'
          ListEmptyComponent={<Text>No friend requests at the moment.</Text>}
        />
      )}
    </View>
  );
}
