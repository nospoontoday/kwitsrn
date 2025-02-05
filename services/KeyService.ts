import axios from "../utils/axios";

export async function savePublicKey(public_key: string) {
    await axios.post("/save_public_key", { public_key: public_key });
}

export async function saveSecretKey(secret_key: string) {
    await axios.post("/save_secret_key", { secret_key: secret_key });
}