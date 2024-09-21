import { useContext } from "react";
import { Button, SafeAreaView, Text } from "react-native";
import AuthContext from "../contexts/AuthContext";
import { logout } from "../services/AuthService";

export default function() {
    const { user, setUser } = useContext(AuthContext);

    async function handleLogout() {
        try {
            await logout();
        } catch (e) {
            console.log(e.response.data);
        }

        setUser(null);
    }

    return (
        <SafeAreaView>
            <Text>Welcome home, {user.name}</Text>
            <Button title="Logout" onPress={handleLogout} />
        </SafeAreaView>
    );

}