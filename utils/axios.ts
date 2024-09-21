import axiosLib from "axios";
import { getToken } from "../services/TokenService";
import { API_URL } from "@env";

const axios = axiosLib.create({
    baseURL: `${API_URL}/api`,
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