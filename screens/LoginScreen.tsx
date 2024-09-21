import { Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useContext, useState } from "react";
import { loadUser, login } from "../services/AuthService";
import AuthContext from "../contexts/AuthContext";

export default function({ navigation }) {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    async function handleLogin() {
        setErrors({});
        try {
            await login({
                email,
                password,
                device_name: `${Platform.OS} ${Platform.Version}`,
            })

            const user = await loadUser();
            setUser(user);
            

        } catch (e) {
            if(e.response?.status === 422) {
                setErrors(e.response.data.errors);
            }
        }
    }

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.container}>
                <FormTextField 
                    label="Email address:" 
                    value={email} 
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    errors={errors.email}
                />
                <FormTextField 
                    label="Password:" 
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    errors={errors.password}
                />
                <Button title="Login" onPress={handleLogin}  />
                <Button title="Create an account" onPress={() => {
                    navigation.navigate("Create account")
                }} />
                <Button title="Forgot password" onPress={() => {
                    navigation.navigate("Forgot password")
                }}  />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: "#fff", flex: 1},
    container: { padding: 20, rowGap: 16 }
})