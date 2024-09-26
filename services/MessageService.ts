import axios from "../utils/axios";

export async function loadMessages(linkRoute) {
    const { data } = await axios.get(linkRoute);

    return data;
}