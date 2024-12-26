import React, { useCallback, useContext } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { Menu, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';

import AuthContext from '../contexts/AuthContext';
import { blurhash } from '../utils/common';
import { logout } from '../services/AuthService';
import MenuItem from './CustomMenuItems';

const ios = Platform.OS === 'ios';

export default function HomeHeader({ title }) {
  const { top } = useSafeAreaInsets();
  const { user, setUser } = useContext(AuthContext);

  const handleProfile = useCallback(() => {
    // Navigate to profile screen or handle profile logic
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUser(null);
    } catch (e) {
      console.log(e?.response?.data);
    }
  }, [setUser]);

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: ios ? top : top + 10 }, // Adjust for SafeArea on iOS vs. Android
      ]}
    >
      <View>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      <View>
        <Menu>
          <MenuTrigger>
            <Image
              style={styles.avatar}
              source={user?.avatar_url ?? 'https://picsum.photos/seed/696/3000/2000'}
              placeholder={blurhash}
              transition={500}
            />
          </MenuTrigger>

          <MenuOptions customStyles={{ optionsContainer: styles.menuOptions }}>
            <MenuItem
              text="Profile"
              action={handleProfile}
              value={null}
              icon={<Feather name="user" size={hp(2.5)} color="#737373" />}
            />
            <Divider />
            <MenuItem
              text="Sign out"
              action={handleLogout}
              value={null}
              icon={<SimpleLineIcons name="logout" size={hp(2.5)} color="#737373" />}
            />
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#6366F1', // 'bg-indigo-400'
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  titleText: {
    fontSize: hp(3),
    fontWeight: '500',
    color: '#ffffff',
  },
  avatar: {
    height: hp(4.3),
    aspectRatio: 1,
    borderRadius: 100,
  },
  menuOptions: {
    borderRadius: 10,
    borderCurve: 'continuous',
    marginTop: 40,
    marginLeft: -30,
    backgroundColor: 'white',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    width: 160,
  },
  divider: {
    backgroundColor: '#e5e7eb', // neutral-200
    height: 1,
    width: '100%',
  },
});
