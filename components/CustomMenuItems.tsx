import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function MenuItem({ text, action, value, icon }) {
  const handleSelect = () => {
    action?.(value);
  };

  return (
    <MenuOption onSelect={handleSelect}>
      <View style={styles.optionContainer}>
        {/* Conditionally render the Text component if text is provided */}
        {text && (
          <Text style={styles.optionText}>
            {text}
          </Text>
        )}
        {icon}
      </View>
    </MenuOption>
  );
}

const styles = StyleSheet.create({
  optionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: hp(1.7),
    fontWeight: '600',
    color: '#4B5563', // neutral-600
    marginRight: 8,   // optional spacing before the icon
  },
});
