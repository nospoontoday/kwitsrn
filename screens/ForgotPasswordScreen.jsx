import { Button, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useState } from "react";
import { sendPasswordResetLink } from "../services/AuthService";
import { StatusBar } from "expo-status-bar";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Loading from "../components/Loading";

export default function() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [resetStatus, setResetStatus] = useState("");
    const [errors, setErrors] = useState({});

    async function handleForgotPassword() {
        setErrors({});
        setResetStatus("");
        setLoading(true);
        try {
            const status = await sendPasswordResetLink(email);
            setResetStatus(status);
        } catch (e) {
            if(e.response?.status === 422) {
                setErrors(e.response.data.errors);
            }
        }
        setLoading(false);
    }

    return (
        <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            <View style={{ paddingTop: hp(3), paddingHorizontal: wp(5) }} className="flex-1 gap-5">
                <View>
                    {resetStatus && <Text style={styles.resetStatus}>{resetStatus}</Text>}
                    <FormTextField
                        icon="mail"
                        placeholder="Email address" 
                        value={email} 
                        onChangeText={(text) => setEmail(text)}
                        keyboardType="email-address"
                        errors={errors.email}
                    />
                    {
                        loading? (
                            <View className="flex-row justify-center">
                                <Loading size={hp(8)} />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleForgotPassword} style={{ height: hp(6.5)}} className="bg-indigo-500 rounded-xl justify-center items-center">
                                <Text style={{ fontSize: hp(2.3) }} className="text-white font-bold tracking-wider">E-mail reset password link</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: "#fff", flex: 1},
    container: { padding: 20, rowGap: 16 },
    resetStatus: { marginBottom: 10, color: "green"}
})