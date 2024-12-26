import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export function FormTextField({ icon, placeholder, errors = [], ...rest }) {
  return (
    <>
      {/* Input Container */}
      <View style={styles.inputContainer}>
        {icon && (
          <Octicons
            name={icon}
            size={hp(2.7)}
            color="gray"
            style={styles.icon}
          />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="gray"
          style={styles.textInput}
          autoCapitalize="none"
          {...rest}
        />
      </View>

      {/* Error Messages */}
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((err, index) => (
            <Text key={index} style={styles.errorText}>
              {err}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: hp(7),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // neutral-100
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: hp(2),
    fontWeight: '600',
    color: '#374151', // text-neutral-700
  },
  errorContainer: {
    marginTop: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'right',
    marginBottom: 8,
  },
});
