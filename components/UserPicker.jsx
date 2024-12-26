import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

export default function UserPicker({ value, options, onSelect, isGroup }) {
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState(value || []);
  const [query, setQuery] = useState('');

  /**
   * If this is a group picker and nothing is selected yet,
   * select all users initially and notify the parent.
   */
  useEffect(() => {
    if (isGroup && options.length > 0 && selected.length === 0) {
      setSelected(options);
      onSelect(options);
    }
  }, [isGroup, options, selected.length, onSelect]);

  /**
   * If this is NOT a group, then whenever the parent passes a
   * new value prop, update our local selected state.
   */
  useEffect(() => {
    if (!isGroup) {
      setSelected(value || []);
    }
  }, [value, isGroup]);

  /**
   * Filter users by name whenever 'query' changes.
   */
  const filteredUsers = useMemo(() => {
    if (!query) return options;
    return options.filter((person) =>
      person.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  /**
   * Toggle a user in our local state, then call 'onSelect'
   * so the parent knows which users are selected.
   */
  const handleToggleUser = useCallback(
    (user) => {
      let newSelected;
      if (selected.includes(user)) {
        newSelected = selected.filter((u) => u !== user);
      } else {
        newSelected = [...selected, user];
      }
      setSelected(newSelected);
      onSelect(newSelected);
    },
    [selected, onSelect]
  );

  return (
    <View style={styles.container}>
      {/* Primary button to open the modal */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={styles.selectButton}
      >
        <Text style={styles.selectButtonText}>
          {selected.length > 0
            ? `${selected.length} users selected`
            : 'Select users...'}
        </Text>
      </TouchableOpacity>

      {/* Modal with search + list of users */}
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Search users..."
              onChangeText={setQuery}
              value={query}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleToggleUser(item)}
                  style={[
                    styles.userItem,
                    selected.includes(item)
                      ? styles.userItemSelected
                      : styles.userItemDefault,
                  ]}
                >
                  <Text style={styles.userItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  selectButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  selectButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  userItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  userItemDefault: {
    backgroundColor: '#f9fafb',
  },
  userItemSelected: {
    backgroundColor: '#d1fae5',
  },
  userItemText: {
    fontSize: 16,
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 5,
  },
  doneButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
