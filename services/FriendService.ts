import axios from "../utils/axios";

export async function requestFriend(route, formData) {
    try {

        const { data } = await axios.post(route, formData);

        return data;
    } catch (error) {
        console.error("Error occurred while storing expense:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);

            return error.response.data;

        } else if (error.request) {
            console.error("Request data:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        throw error;
    }
}
