import { Image, Platform, Pressable, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useContext, useState } from "react";
import { loadUser, login } from "../services/AuthService";
import AuthContext from "../contexts/AuthContext";

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import Loading from "../components/Loading";
import CustomKeyboardView from "../components/CustomKeyboardView";
import { createKeyPair } from "../utils/crypto";

export default function({ navigation }) {
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    async function handleLogin() {
        setErrors({});
        setLoading(true);
        try {
            await login({
                email,
                password,
                device_name: `${Platform.OS} ${Platform.Version}`,
            })

            const user = await loadUser();
            setUser(user);

            if(!user.public_key) {
                createKeyPair();
            }
        } catch (e) {
            if(e.response?.status === 422) {
                setErrors(e.response.data.errors);
            }
        }
        setLoading(false);
    }

    return (
        <CustomKeyboardView>
            <StatusBar style="dark" />
            <View style={{ paddingTop: hp(8), paddingHorizontal: wp(5) }} className="flex-1 gap-5">
                <View className="items-center">
                    <Image style={{height: hp(25)}} resizeMode="contain" source={require('../assets/images/login.png')} />
                </View>

                <View>
                    <Text style={{ fontSize: hp(4) }} className="font-bold tracking-wider text-center text-neutral-800">Sign In</Text>
                    
                    <View className="mt-10">
                        <FormTextField 
                            icon="mail"
                            placeholder="Email address" 
                            value={email} 
                            onChangeText={(text) => setEmail(text)}
                            keyboardType="email-address"
                            errors={errors.email}
                        />

                        <FormTextField 
                            icon="lock"
                            placeholder="Password" 
                            secureTextEntry={true}
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            errors={errors.password}
                        />
                    </View>


                    <Pressable onPress={() => { navigation.navigate("Forgot password") }} className="mt-2">
                        <Text 
                            style={{ fontSize: hp(1.8) }} 
                            className="font-semibold text-right text-indigo-500" 
                        >
                            Forgot password?
                        </Text>
                    </Pressable>

                </View>

                <View>
                    {
                        loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(8)} />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleLogin} style={{ height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">Sign In</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">Don't have an account? </Text>
                    <Pressable onPress={() => { navigation.navigate("Create account") }}>
                        <Text style={{ fontSize: hp(1.8) }} className="font-bold text-indigo-500">Sign Up</Text>
                    </Pressable>
                </View>
            </View>
        </CustomKeyboardView>
    );
}