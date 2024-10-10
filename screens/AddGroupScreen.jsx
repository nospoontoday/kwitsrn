import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from "@react-native-picker/picker";

export default function AddGroupScreen({ navigation }) {
    const [group, setGroup] = useState({});
    const [currencies, setCurrencies] = useState([]);
    const [data, setData] = useState({
        id: "",
        name: "",
        description: "",
        user_ids: [],
        default_currency: "php", // Default currency set to PHP
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Fetch currencies (simulating API call)
    const fetchCurrencies = async () => {
        try {
            const response = await axios.get('/api/currencies');
            setCurrencies(response.data);
        } catch (error) {
            console.error("Failed to fetch currencies", error);
        }
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const createOrUpdateGroup = async () => {
        setProcessing(true);
        try {
            // If group id exists, update the group, else create a new one
            if (group.id) {
                // Call your update API
                console.log('Updating group', data);
            } else {
                // Call your create API
                console.log('Creating group', data);
            }
            setProcessing(false);
            navigation.goBack();  // Go back to previous screen after success
        } catch (error) {
            console.error('Error saving group:', error);
            setErrors({ general: 'Failed to save group' });
            setProcessing(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>
                {group.id ? `Edit Group "${group.name}"` : "Create New Group"}
            </Text>
            
            {/* Group Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={data.name}
                editable={!group.id} // Disable if it's an existing group
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
                multiline={true}
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
            
            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <Button title="Cancel" onPress={() => navigation.goBack()} />
                <Button title={group.id ? "Update" : "Create"} onPress={createOrUpdateGroup} disabled={processing} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});
