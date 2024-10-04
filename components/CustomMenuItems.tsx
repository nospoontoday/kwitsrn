import { View, Text } from 'react-native';
import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function MenuItem({ text, action, value, icon }) {
    return (
        <MenuOption onSelect={() => action(value)}>
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Conditionally render the Text component only if text is not null or empty */}
                {text ? (
                    <Text
                        style={{ fontSize: hp(1.7), fontWeight: '600', color: '#4B5563' }} // neutral-600
                    >
                        {text}
                    </Text>
                ) : null}
                {icon}
            </View>
        </MenuOption>
    );
}
