const EventEmitter = require("events");

const liveEvents = new EventEmitter();

let activeConnection = null;
let activeUsername = null;
let activeRoomId = null;

async function connectToTikTok(username) {

    const cleanUsername =
        String(username)
            .trim()
            .replace(/^@+/, "");

    if (!cleanUsername) {
        throw new Error("اسم المستخدم غير صالح");
    }

    const module =
        await import("tiktok-live-connector");

    const { TikTokLiveConnection, WebcastEvent } = module;

    if (!TikTokLiveConnection) {
        throw new Error("TikTokLiveConnection غير متوفر");
    }

    if (activeConnection) {
        try {
            await activeConnection.disconnect();
        } catch (error) {
            console.log("Previous TikTok connection closed.");
        }

        activeConnection = null;
    }

    console.log(`S-LIVE: Connecting to @${cleanUsername}`);

    const connection =
        new TikTokLiveConnection(
            cleanUsername,
            {
                processInitialData: false,
                fetchRoomInfoOnConnect: true
            }
        );

    /*
    =========================================
    حدث دخول شخص جديد
    =========================================
    */

    connection.on(
    WebcastEvent.MEMBER,
    (data) => {

        console.log(
            "S-LIVE MEMBER DATA:",
            JSON.stringify(data, null, 2)
        );

        const user =
            data?.user || data;

        if (!user) {
            console.log(
                "S-LIVE: MEMBER event without user"
            );
            return;
        }

        console.log(
            "S-LIVE USER DATA:",
            JSON.stringify(user, null, 2)
        );

        const member = {

            uniqueId:
                user.uniqueId || "",

            nickname:
                user.nickname ||
                user.uniqueId ||
                "TikTok User",

            profilePictureUrl:
                user.profilePictureUrl ||
                user.userDetails?.profilePictureUrls?.[0] ||
                "",

            profilePictures:
                user.userDetails?.profilePictureUrls || [],

            joinedAt:
                Date.now()
        };

        console.log(
            "S-LIVE FINAL MEMBER:",
            JSON.stringify(member, null, 2)
        );

        liveEvents.emit(
            "member",
            member
        );
    }
); 
    

    const state =
        await connection.connect();

    activeConnection = connection;
    activeUsername = cleanUsername;
    activeRoomId = state.roomId;

    console.log(
        `S-LIVE: Connected to @${cleanUsername}`
    );

    console.log(
        `S-LIVE: Room ID: ${state.roomId}`
    );

    return {
        username: activeUsername,
        roomId: activeRoomId
    };
}


async function disconnectFromTikTok() {

    if (!activeConnection) {
        return;
    }

    try {
        await activeConnection.disconnect();
    } catch (error) {
        console.error(
            "S-LIVE disconnect error:",
            error
        );
    }

    activeConnection = null;
    activeUsername = null;
    activeRoomId = null;

    console.log(
        "S-LIVE: TikTok disconnected"
    );
}


function getConnectionStatus() {

    return {
        success: true,
        connected: Boolean(activeConnection),
        username: activeUsername,
        roomId: activeRoomId
    };
}


module.exports = {

    connectToTikTok,
    disconnectFromTikTok,
    getConnectionStatus,
    liveEvents

}; 
