import axios from "../utils/axios";

export async function storeExpense(route, formData) {
    try {
        // Format the date
        const formattedDate = new Date(formData.expense_date).toISOString().slice(0, 19).replace('T', ' ');

        // Parse user_ids if it's being sent as a string
        const userIdsArray = Array.isArray(formData.user_ids) ? formData.user_ids : JSON.parse(formData.user_ids);

        // Create a new payload
        const payload = {
            ...formData,
            expense_date: formattedDate, // Use the formatted date
            user_ids: userIdsArray // Ensure user_ids is an array
        };

        console.log("Sending data to", route, "with payload:", payload);
        const { data } = await axios.post(route, payload);
        return data;
    } catch (error) {
        console.error("Error occurred while storing expense:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        } else if (error.request) {
            console.error("Request data:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        throw error;
    }
}
