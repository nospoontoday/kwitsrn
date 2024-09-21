import { Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { FormTextField } from "../components/FormTextField";
import { useContext, useState } from "react";
import { loadUser, login, register } from "../services/AuthService";
import AuthContext from "../contexts/AuthContext";

export default function() {
    const { setUser } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});

    async function handleRegister({ navigation }) {
        setErrors({});
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
            navigation.replace("Home")

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
                    label="Your name:" 
                    value={name} 
                    onChangeText={(text) => setName(text)}
                    errors={errors.name}
                />
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
                <FormTextField 
                    label="Password confirmation:" 
                    secureTextEntry={true}
                    value={passwordConfirmation}
                    onChangeText={(text) => setPasswordConfirmation(text)}
                    errors={errors.password_confirmation}
                />
                <Button title="Register" onPress={handleRegister}  />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { backgroundColor: "#fff", flex: 1},
    container: { padding: 20, rowGap: 16 }
})