import axios from "../utils/axios";

export async function loadMessages(linkRoute) {
    const { data } = await axios.get(linkRoute);

    return data;
}

export async function sendMessage(route, formData) {
    const { data } = await axios.post(route, formData);

    return data;
}

export async function oweMe(route, formData) {
    const { data } = await axios.post(route, formData);

    return data;
}

export async function oweYou(route, formData) {
    const { data } = await axios.post(route, formData);

    return data;
}

export async function destroyMessage(route) {
    await axios.delete(route)
        .then((res) => {

        })
        .catch((err) => {
            console.error(err);
        });
}