import axios from "../utils/axios";
import { setToken } from "./TokenService";

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
    const { data: user } = await axios.get("/user");

    return user;
}

export async function logout() {
    await axios.post("/logout", {});
    await setToken(null);
}
