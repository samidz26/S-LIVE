import { TikTokLiveConnection } from "tiktok-live-connector";

let connection = null;
let currentUsername = null;

export async function connectToTikTok(username) {

    username = username
        .trim()
        .replace(/^@/, "");

    if (!username) {
        throw new Error("TikTok username is required");
    }

    // إذا كان هناك اتصال سابق
    if (connection) {
        try {
            await connection.disconnect();
        } catch (error) {
            console.log("Previous connection already closed.");
        }

        connection = null;
        currentUsername = null;
    }

    console.log(`Connecting to TikTok LIVE: @${username}`);

    const newConnection = new TikTokLiveConnection(username, {
        processInitialData: false
    });

    const state = await newConnection.connect();

    connection = newConnection;
    currentUsername = username;

    console.log(`Connected to TikTok LIVE: @${username}`);
    console.log(`Room ID: ${state.roomId}`);

    return {
        username,
        roomId: state.roomId
    };
}

export function getTikTokConnection() {
    return connection;
}

export function getCurrentTikTokUsername() {
    return currentUsername;
}

export async function disconnectTikTok() {

    if (!connection) {
        return;
    }

    try {
        await connection.disconnect();
    } catch (error) {
        console.error("Disconnect error:", error);
    }

    connection = null;
    currentUsername = null;

    console.log("TikTok LIVE disconnected.");
        }
