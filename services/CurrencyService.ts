import axios from "../utils/axios";

export async function getCurrencies(linkRoute) {
    return await axios.get(linkRoute);
}