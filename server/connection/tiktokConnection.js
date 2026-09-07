let activeConnection = null;

let activeUsername = null;

let activeRoomId = null;


/* =========================================
   الاتصال بـ TikTok
========================================= */

async function connectToTikTok(username) {

    const cleanUsername =
        String(username)
            .trim()
            .replace(/^@+/, "");


    if (!cleanUsername) {

        throw new Error(
            "اسم المستخدم غير صالح"
        );
    }


    /*
     * استيراد المكتبة ديناميكيًا.
     *
     * هذا يسمح لنا بالاحتفاظ بـ
     * server.js بصيغة CommonJS.
     */

    const module =
        await import(
            "tiktok-live-connector"
        );


    const {
        TikTokLiveConnection
    } = module;


    if (!TikTokLiveConnection) {

        throw new Error(
            "TikTokLiveConnection غير متوفر"
        );
    }


    /*
     * قطع الاتصال السابق
     */

    if (activeConnection) {

        try {

            await activeConnection
                .disconnect();

        } catch (error) {

            console.log(
                "Previous TikTok connection closed."
            );

        }

        activeConnection = null;
    }


    console.log(
        `S-LIVE: Connecting to @${cleanUsername}`
    );


    const connection =
        new TikTokLiveConnection(
            cleanUsername
        );


    /*
     * محاولة الاتصال
     */

    const state =
        await connection.connect();


    activeConnection =
        connection;

    activeUsername =
        cleanUsername;

    activeRoomId =
        state.roomId;


    console.log(
        `S-LIVE: Connected to @${cleanUsername}`
    );

    console.log(
        `S-LIVE: Room ID: ${state.roomId}`
    );


    return {

        username:
            activeUsername,

        roomId:
            activeRoomId

    };

}


/* =========================================
   قطع الاتصال
========================================= */

async function disconnectFromTikTok() {

    if (!activeConnection) {
        return;
    }


    try {

        await activeConnection
            .disconnect();

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


/* =========================================
   حالة الاتصال
========================================= */

function getConnectionStatus() {

    return {

        success: true,

        connected:
            Boolean(activeConnection),

        username:
            activeUsername,

        roomId:
            activeRoomId

    };

}


module.exports = {

    connectToTikTok,

    disconnectFromTikTok,

    getConnectionStatus

};
