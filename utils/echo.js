import Echo from 'laravel-echo';
import io from 'socket.io-client';
import Constants from "expo-constants";

let echoInstance; // Variable to hold the Echo instance

// Function to create and return an Echo instance
const setEchoInstance = (token) => {
    echoInstance = new Echo({
        broadcaster: 'socket.io',
        host: `http://${Constants.expoConfig?.hostUri?.split(':').shift()}:6001` ?? 'http://yourapi.com',
        authEndpoint: '/api/broadcasting/auth',
        client: io,
        auth: {
            headers: {
                Authorization: `Bearer ${token}` // Use the token passed
            }
        }
    });

    return echoInstance; // Return the instance
};

// Function to get the existing Echo instance
const getEchoInstance = () => {
    return echoInstance; // Return the existing instance if it exists
};

export { setEchoInstance, getEchoInstance };
