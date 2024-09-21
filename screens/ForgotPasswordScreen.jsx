import { Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useContext, useState } from "react";
import { loadUser, login, sendPasswordResetLink } from "../services/AuthService";
import AuthContext from "../contexts/AuthContext";

export default function() {
    const [email, setEmail] = useState("");
    const [resetStatus, setResetStatus] = useState("");
    const [errors, setErrors] = useState({});

    async function handleForgotPassword() {
        setErrors({});
        setResetStatus("");
        try {
            const status = await sendPasswordResetLink(email);
            setResetStatus(status);
        } catch (e) {
            if(e.response?.status === 422) {
                setErrors(e.response.data.errors);
            }
        }
    }

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>
                {resetStatus && <Text style={styles.resetStatus}>{resetStatus}</Text>}
                <FormTextField 
                    label="Email address:" 
                    value={email} 
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    errors={errors.email}
                />
                <Button title="E-mail reset password link" onPress={handleForgotPassword}  />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: "#fff", flex: 1},
    container: { padding: 20, rowGap: 16 },
    resetStatus: { marginBottom: 10, color: "green"}
})