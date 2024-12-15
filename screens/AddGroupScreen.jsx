import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { getCurrencies } from '../services/CurrencyService';
import { getFriends } from '../services/FriendService';

export default function AddGroupScreen({ navigation }) {
    const [currencies, setCurrencies] = useState([]);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]); // Store all users
    const [data, setData] = useState({
        id: "",
        name: "",
        description: "",
        user_ids: [],
        default_currency: "php", // Default currency set to PHP
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Control modal visibility

    useEffect(() => {
        // Fetch currencies (simulating API call)
        const fetchCurrencies = async () => {
            try {
                const response = await getCurrencies('/currencies');
                setCurrencies(response.data || []); // Ensure default to empty array if no data
            } catch (error) {
                setError("Failed to fetch currencies");
                console.error("Failed to fetch currencies", error);
            }
        };
        fetchCurrencies();

        // Fetch users (simulating API call)
        const fetchFriends = async () => {
            try {
                const response = await getFriends('/friends');
                setUsers(response.data || []); // Ensure default to empty array if no data
            } catch (error) {
                setError("Failed to fetch friends");
                console.error("Failed to fetch friends", error);
            }
        };
        fetchFriends();
    }, []);

    const createOrUpdateGroup = async () => {
        setProcessing(true);
        try {
            if (data.id) {
                console.log('Updating group', data);
            } else {
                console.log('Creating group', data);
            }
            setProcessing(false);
            navigation.goBack();
        } catch (error) {
            console.error('Error saving group:', error);
            setErrors({ general: 'Failed to save group' });
            setProcessing(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setData((prevData) => ({
            ...prevData,
            user_ids: prevData.user_ids.includes(userId)
                ? prevData.user_ids.filter(id => id !== userId)
                : [...prevData.user_ids, userId],
        }));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>
                {data.id ? `Edit Group "${data.name}"` : "Create New Group"}
            </Text>
            
            {/* Group Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={data.name}
                editable={!data.id}
                onChangeText={(text) => setData({ ...data, name: text })}
                placeholder="Enter group name"
            />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}
            
            {/* Group Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, { height: 100 }]}
                value={data.description || ""}
                onChangeText={(text) => setData({ ...data, description: text })}
                placeholder="Enter group description"
                multiline
            />
            {errors.description && <Text style={styles.error}>{errors.description}</Text>}

            {/* Default Currency Picker */}
            <Text style={styles.label}>Default Currency</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={data.default_currency}
                    onValueChange={(itemValue) => setData({ ...data, default_currency: itemValue })}
                >
                    {currencies.map((currency) => (
                        <Picker.Item key={currency.code} label={currency.code.toUpperCase()} value={currency.code} />
                    ))}
                </Picker>
            </View>
            {errors.default_currency && <Text style={styles.error}>{errors.default_currency}</Text>}

            {/* User Selection */}
            <Text style={styles.label}>Select Users</Text>
            <Button title="Choose Users" onPress={() => setModalVisible(true)} />
            {data.user_ids.length > 0 && (
                <Text style={styles.selectedUsers}>
                    Selected Users: {users.filter(user => data.user_ids.includes(user.id)).map(user => user.name).join(', ')}
                </Text>
            )}
            {errors.user_ids && <Text style={styles.error}>{errors.user_ids}</Text>}

            {/* User Selection Modal */}
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalHeader}>Select Users</Text>
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.userItem}
                                onPress={() => toggleUserSelection(item.id)}
                            >
                                <Text style={styles.userName}>{item.name}</Text>
                                {data.user_ids.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        )}
                    />
                    <Button title="Done" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button title="Cancel" onPress={() => navigation.goBack()} />
                <Button title={data.id ? "Update" : "Create"} onPress={createOrUpdateGroup} disabled={processing} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, marginBottom: 5 },
    input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 15, backgroundColor: '#f9f9f9' },
    pickerContainer: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 15, backgroundColor: '#f9f9f9' },
    selectedUsers: { fontSize: 14, marginTop: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    error: { color: 'red', marginBottom: 10 },
    modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
    modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    userItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    userName: { fontSize: 16 },
    checkmark: { fontSize: 18, color: 'green' },
});
