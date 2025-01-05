import axios from "../utils/axios";
import { setToken } from "./TokenService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_KEY_NAME } from '@env';

interface LoginCredentials {
    email: string;
    password: string;
    device_name: string;
}

interface RegisterInfo {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    device_name: string;
}

export async function login(credentials: LoginCredentials) {
    const { data } = await axios.post("/login", credentials);
    await setToken(data.token);
}

export async function register(registerInfo: RegisterInfo) {
    const {data} = await axios.post("/register", registerInfo);
    await setToken(data.token);
}

export async function sendPasswordResetLink(email) {
    const {data} = await axios.post("/forgot-password", { email });
    return data.status;
}

export async function loadUser() {
    const { data } = await axios.get("/user");

    return data.user || data;
}

export async function logout() {
    await axios.post("/logout", {});

    try {
        await AsyncStorage.removeItem(MASTER_KEY_NAME);
        console.log(`${MASTER_KEY_NAME} has been removed from AsyncStorage.`);
    } catch (error) {
        console.error(`Failed to remove ${MASTER_KEY_NAME}:`, error);
    }

    await setToken(null);
}
