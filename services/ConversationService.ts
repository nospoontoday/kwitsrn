import axios from "../utils/axios";

export async function loadConversations() {
    const { data } = await axios.get("/conversations");

    return data?.conversations || data;
}