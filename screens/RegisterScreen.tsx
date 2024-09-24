import { Button, Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useContext, useState } from "react";
import { loadUser, login, register } from "../services/AuthService";
import AuthContext from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Loading from "../components/Loading";
import CustomKeyboardView from "../components/CustomKeyboardView";
import { createKeyPair, generateKeyPair } from "../utils/crypto";
import { MASTER_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { savePublicKey } from "../services/KeyService";

export default function({ navigation }) {
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});

    async function handleRegister({ navigation }) {
        setErrors({});
        setLoading(true);
        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                device_name: `${Platform.OS} ${Platform.Version}`,
            })

            const user = await loadUser();
            setUser(user);
            createKeyPair();

            navigation.replace("Home")

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
            <View style={{ paddingTop: hp(5), paddingHorizontal: wp(5) }} className="flex-1 gap-5">
                <View className="items-center">
                    <Image style={{height: hp(20)}} resizeMode="contain" source={require('../assets/images/register.png')} />
                </View>
                <View>
                    <Text style={{ fontSize: hp(4) }} className="font-bold tracking-wider text-center text-neutral-800">Sign Up</Text>
                
                    <View className="mt-10">
                        <FormTextField 
                            icon="person"
                            placeholder="Your name" 
                            value={name} 
                            onChangeText={(text) => setName(text)}
                            errors={errors.name}
                        />

                    <FormTextField 
                        icon="mail"
                        placeholder="Email address" 
                        value={email} 
                        onChangeText={(text) => setEmail(text)}
                        keyboardType="email-address"
                        errors={errors.email}
                    />
                    </View>

                    <FormTextField
                        icon="lock"
                        placeholder="Password" 
                        secureTextEntry={true}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        errors={errors.password}
                    />

                    <FormTextField
                        icon="lock"
                        placeholder="Password confirmation" 
                        secureTextEntry={true}
                        value={passwordConfirmation}
                        onChangeText={(text) => setPasswordConfirmation(text)}
                        errors={errors.password_confirmation}
                    />
                </View>
                
                <View>
                    {
                        loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(8)} />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleRegister} style={{ height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                <Text style={{ fontSize: hp(2.7) }} className="text-white font-bold tracking-wider">Register</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ fontSize: hp(1.8) }} className="font-semibold text-neutral-500">Already have an account? </Text>
                    <Pressable onPress={() => { navigation.navigate("Login") }}>
                        <Text style={{ fontSize: hp(1.8) }} className="font-bold text-indigo-500">Sign In</Text>
                    </Pressable>
                </View>
            </View>


        </CustomKeyboardView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: "#fff", flex: 1},
    container: { padding: 20, rowGap: 16 }
})