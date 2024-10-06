import React, { useState, useEffect } from "react";
import { View, Text, Modal, FlatList, TouchableOpacity, TextInput } from "react-native";

export default function UserPicker({ value, options, onSelect, isGroup }) {
    const [isVisible, setIsVisible] = useState(false);
    const [selected, setSelected] = useState(value);
    const [query, setQuery] = useState("");

    // Set default selected users if it's a group
    useEffect(() => {
        if (isGroup && options.length > 0) {
            // Only set selected if it hasn't been set before
            if (selected.length === 0) {
                setSelected(options);
                onSelect(options); // Call onSelect with all users
            }
        } else {
            setSelected(value); // Set to the provided value if not a group
        }
    }, [isGroup, options, value, onSelect, selected.length]); // Add selected.length to dependencies

    const filteredUsers =
        query === ""
            ? options
            : options.filter((person) =>
                person.name.toLowerCase().includes(query.toLowerCase())
            );

    const toggleUser = (user) => {
        const newSelected = selected.includes(user)
            ? selected.filter((u) => u !== user)
            : [...selected, user];

        setSelected(newSelected);
        onSelect(newSelected);
    };

    return (
        <View style={{ marginVertical: 10 }}>
            <TouchableOpacity onPress={() => setIsVisible(true)} style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}>
                <Text style={{ fontSize: 16 }}>
                    {selected.length > 0 ? `${selected.length} users selected` : "Select users..."}
                </Text>
            </TouchableOpacity>

            <Modal visible={isVisible} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", padding: 20 }}>
                    <View style={{ backgroundColor: "white", borderRadius: 10, padding: 20 }}>
                        <TextInput
                            placeholder="Search users..."
                            onChangeText={setQuery}
                            style={{ borderWidth: 1, borderColor: "gray", padding: 10, borderRadius: 5, marginBottom: 10 }}
                        />
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => toggleUser(item)}
                                    style={{
                                        padding: 10,
                                        backgroundColor: selected.includes(item) ? "#d1fae5" : "#f9fafb",
                                        marginVertical: 5,
                                        borderRadius: 5,
                                    }}
                                >
                                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setIsVisible(false)} style={{ marginTop: 10, backgroundColor: "#3b82f6", padding: 10, borderRadius: 5 }}>
                            <Text style={{ color: "white", textAlign: "center" }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
