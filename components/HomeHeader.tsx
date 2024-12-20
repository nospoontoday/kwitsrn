import { View, Text, Platform } from 'react-native'
import React, { useContext } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Image } from 'expo-image';
import { blurhash } from '../utils/common';
import AuthContext from '../contexts/AuthContext';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';
import MenuItem from './CustomMenuItems';
import { logout } from "../services/AuthService";

const ios = Platform.OS == 'ios';
export default function HomeHeader({ title }) {
    const { top } = useSafeAreaInsets();
    const { user, setUser } = useContext(AuthContext);

    const handleProfile = () => {

    }

    async function handleLogout() {
        try {
            await logout();
        } catch (e) {
            console.log(e.response.data);
        }

        setUser(null);
    }

    return (
        <View style={{ paddingTop: ios? top:top+10 }} className="flex-row justify-between px-5 bg-indigo-400 pb-6 rounded-b-3xl shadow">
            <View>
                <Text style={{ fontSize: hp(3) }} className="font-medium text-white">{title}</Text>
            </View>

            <View>
                <Menu>
                    <MenuTrigger customStyles={{
                        triggerWrapper: {

                        }
                    }}>
                        <Image 
                            style={{ height: hp(4.3), aspectRatio: 1, borderRadius: 100}}
                            source={user?.avatar_url ?? "https://picsum.photos/seed/696/3000/2000"}
                            placeholder={blurhash}
                            transition={500}
                        />
                    </MenuTrigger>
                    <MenuOptions
                        customStyles={{
                            optionsContainer: {
                                borderRadius: 10,
                                borderCurve: "continuous",
                                marginTop: 40,
                                marginLeft: -30,
                                backgroundColor: "white",
                                shadowOpacity: 0.2,
                                shadowOffset: {width: 0, height: 0},
                                width: 160
                            }
                        }}
                    >
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
    )
}

const Divider = () => {
    return (
        <View className="p-[1px] w-full bg-neutral-200" />
    )
}