import axiosLib from "axios";
import { getToken } from "../services/TokenService";
import Constants from "expo-constants";

const uri = `http://${Constants.expoConfig?.hostUri?.split(':').shift()}:80` ?? 'http://yourapi.com';

const axios = axiosLib.create({
    baseURL: `${uri}/api`,
    headers: {
        Accept: "application/json",
    }
});

axios.interceptors.request.use( async (req) => {
    const token = await getToken();

    if(token !== null) {
        req.headers["Authorization"] = `Bearer ${token}`
    }

    return req;
});

export default axios;