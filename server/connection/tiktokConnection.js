const EventEmitter = require("events");

const liveEvents = new EventEmitter();

let activeConnection = null;
let activeUsername = null;
let activeRoomId = null;
let activeProfilePicture = null;


/* =========================================
   GET FIRST VALID URL
========================================= */

function getFirstUrl(value) {

    if (!value) {
        return null;
    }

    if (typeof value === "string") {

        return value.startsWith("http")
            ? value
            : null;
    }

    if (Array.isArray(value)) {

        for (const item of value) {

            const url = getFirstUrl(item);

            if (url) {
                return url;
            }
        }

        return null;
    }

    if (typeof value === "object") {

        const possibleFields = [
            "url_list",
            "urlList",
            "url",
            "uri",
            "profilePictureUrl",
            "profile_picture_url",
            "avatar",
            "avatar_thumb",
            "avatarThumb",
            "giftPictureUrl",
            "gift_picture_url"
        ];

        for (const field of possibleFields) {

            if (
                Object.prototype.hasOwnProperty.call(
                    value,
                    field
                )
            ) {

                const url =
                    getFirstUrl(
                        value[field]
                    );

                if (url) {
                    return url;
                }
            }
        }

        for (const key of Object.keys(value)) {

            const lowerKey =
                key.toLowerCase();

            if (
                lowerKey.includes("avatar") ||
                lowerKey.includes("profilepicture") ||
                lowerKey.includes("giftpicture")
            ) {

                const url =
                    getFirstUrl(
                        value[key]
                    );

                if (url) {
                    return url;
                }
            }
        }
    }

    return null;
}


/* =========================================
   FIND BROADCASTER PROFILE PICTURE
========================================= */

function getBroadcasterProfilePicture(connection) {
    try {
        const roomInfo =
            connection?.roomInfo;

        if (!roomInfo) {
            console.log(
                "S-LIVE: roomInfo not found"
            );
            return null;
        }

        const owner =
            roomInfo.owner ||
            roomInfo.room?.owner ||
            roomInfo.anchor ||
            roomInfo.host ||
            roomInfo.room?.anchor ||
            roomInfo.room?.host;

        if (!owner) {
            console.log(
                "S-LIVE: broadcaster owner not found"
            );
            return null;
        }

        const possiblePictures = [
            owner.avatar_thumb,
            owner.avatar_larger,
            owner.avatar_medium,
            owner.avatarThumb,
            owner.avatarLarger,
            owner.avatarMedium,
            owner.profilePictureUrl,
            owner.profile_picture_url,
            owner.avatar,
            owner.profilePicture,
            owner.profile_picture
        ];

        for (const value of possiblePictures) {
            const url = getFirstUrl(value);

            if (url) {
                console.log(
                    "S-LIVE: broadcaster profile found:",
                    url
                );

                return url;
            }
        }

        console.log(
            "S-LIVE: broadcaster avatar fields found, but no URL"
        );

        console.log(
            "S-LIVE owner keys:",
            Object.keys(owner)
        );

        return null;

    } catch (error) {

        console.error(
            "S-LIVE broadcaster image error:",
            error
        );

        return null;
    }
}


/* =========================================
   GET USER DATA
========================================= */

function getUserData(data) {

    const user =
        data?.user ||
        data?.member ||
        data?.author ||
        data?.sender ||
        data;

    if (!user) {

        return {
            uniqueId: "",
            nickname: "مستخدم TikTok",
            profilePictureUrl: ""
        };
    }

    const uniqueId =
        user.uniqueId ||
        user.unique_id ||
        data?.uniqueId ||
        data?.unique_id ||
        "";

    const nickname =
        user.nickname ||
        user.nickName ||
        data?.nickname ||
        data?.nickName ||
        uniqueId ||
        "مستخدم TikTok";

    const profilePictureUrl =
        user.profilePictureUrl ||
        user.profile_picture_url ||
        getFirstUrl(user.avatar_thumb) ||
        getFirstUrl(user.avatarThumb) ||
        getFirstUrl(user.avatar) ||
        getFirstUrl(data?.profilePictureUrl) ||
        "";

    return {
        uniqueId,
        nickname,
        profilePictureUrl
    };
}


/* =========================================
   CONNECT TO TIKTOK
========================================= */

async function connectToTikTok(username) {

    if (!username) {

        throw new Error(
            "اسم المستخدم مطلوب"
        );
    }

    const cleanUsername =
        String(username)
            .trim()
            .replace(/^@/, "");

    if (!cleanUsername) {

        throw new Error(
            "اسم المستخدم غير صالح"
        );
    }


    /* =========================================
       DISCONNECT PREVIOUS CONNECTION
    ========================================= */

    if (activeConnection) {

        try {

            await activeConnection.disconnect();

        } catch (error) {

            console.warn(
                "S-LIVE previous disconnect:",
                error?.message
            );
        }

        activeConnection = null;
    }


    activeUsername = null;
    activeRoomId = null;
    activeProfilePicture = null;


    /* =========================================
       LOAD TIKTOK LIVE CONNECTOR
    ========================================= */

    const module =
        await import(
            "tiktok-live-connector"
        );


    /*
     * دعم أكثر من اسم حسب إصدار المكتبة
     */

    const TikTokLiveConnection =
        module.TikTokLiveConnection ||
        module.WebcastPushConnection ||
        module.default;

    const WebcastEvent =
        module.WebcastEvent ||
        {};


    if (
        typeof TikTokLiveConnection !==
        "function"
    ) {

        throw new Error(
            "تعذر تحميل TikTok Live Connector"
        );
    }


    /* =========================================
       CREATE CONNECTION
    ========================================= */

    const connection =
        new TikTokLiveConnection(
            cleanUsername,
            {
                processInitialData: false,
                fetchRoomInfoOnConnect: true
            }
        );


    /* =========================================
       EVENT NAMES
    ========================================= */

    const memberEvent =
        WebcastEvent.MEMBER ||
        "member";

    const chatEvent =
        WebcastEvent.CHAT ||
        "chat";

    const giftEvent =
        WebcastEvent.GIFT ||
        "gift";

    const likeEvent =
        WebcastEvent.LIKE ||
        "like";

    const followEvent =
        WebcastEvent.FOLLOW ||
        "follow";

    const subscribeEvent =
        WebcastEvent.SUBSCRIBE ||
        "subscribe";

    const shareEvent =
        WebcastEvent.SHARE ||
        "share";


    /* =========================================
       👤 MEMBER
    ========================================= */

    connection.on(
        memberEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);

                const member = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl
                };

                console.log(
                    "MEMBER:",
                    `@${member.uniqueId || "unknown"}`,
                    member.nickname
                );

                liveEvents.emit(
                    "member",
                    member
                );

            } catch (error) {

                console.error(
                    "S-LIVE member processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       💬 CHAT / COMMENT
    ========================================= */

    connection.on(
        chatEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);

                const comment =
                    data?.comment ||
                    data?.text ||
                    data?.message ||
                    "";

                const chat = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl,

                    comment:
                        String(comment)
                };


                console.log(
                    "CHAT:",
                    `@${chat.uniqueId || "unknown"}`,
                    "→",
                    chat.comment
                );


                liveEvents.emit(
                    "chat",
                    chat
                );

            } catch (error) {

                console.error(
                    "S-LIVE chat processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       🎁 GIFT / SUPPORT
    ========================================= */

    connection.on(
        giftEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);


                const giftDetails =
                    data?.giftDetails ||
                    data?.gift ||
                    {};


                const giftName =
                    giftDetails.giftName ||
                    data?.giftName ||
                    "هدية";


                const giftId =
                    giftDetails.giftId ||
                    data?.giftId ||
                    null;


                const diamondCount =
                    Number(
                        giftDetails.diamondCount ??
                        data?.diamondCount ??
                        0
                    );


                const repeatCount =
                    Number(
                        data?.repeatCount ??
                        giftDetails.repeatCount ??
                        1
                    );


                const repeatEnd =
                    data?.repeatEnd ??
                    giftDetails.repeatEnd ??
                    true;


                const giftType =
                    Number(
                        giftDetails.giftType ??
                        data?.giftType ??
                        0
                    );


                const giftPictureUrl =
                    getFirstUrl(
                        giftDetails.giftPictureUrl
                    ) ||
                    getFirstUrl(
                        giftDetails.giftPicture
                    ) ||
                    getFirstUrl(
                        data?.giftPictureUrl
                    ) ||
                    "";


                /*
                 * هدايا الـ Streak
                 *
                 * لا نرسل الأحداث الوسيطة.
                 * ننتظر الحدث النهائي.
                 */

                if (
                    giftType === 1 &&
                    repeatEnd === false
                ) {

                    return;
                }


                const totalValue =
                    diamondCount *
                    repeatCount;


                const gift = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl,

                    giftId,

                    giftName,

                    giftPictureUrl,

                    diamondCount,

                    repeatCount,

                    repeatEnd,

                    giftType,

                    totalValue
                };


                console.log(
                    "GIFT:",
                    `@${gift.uniqueId || "unknown"}`,
                    "→",
                    gift.giftName,
                    "x",
                    gift.repeatCount,
                    "| diamonds:",
                    gift.totalValue
                );


                liveEvents.emit(
                    "gift",
                    gift
                );

            } catch (error) {

                console.error(
                    "S-LIVE gift processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       ❤️ LIKE / TAP
    ========================================= */

    connection.on(
        likeEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);


                const likeCount =
                    Number(
                        data?.likeCount ??
                        data?.count ??
                        1
                    );


                const totalLikeCount =
                    Number(
                        data?.totalLikeCount ??
                        0
                    );


                const like = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl,

                    likeCount,

                    totalLikeCount
                };


                console.log(
                    "LIKE:",
                    `@${like.uniqueId || "unknown"}`,
                    "→",
                    like.likeCount
                );


                liveEvents.emit(
                    "like",
                    like
                );

            } catch (error) {

                console.error(
                    "S-LIVE like processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       ➕ FOLLOW
    ========================================= */

    connection.on(
        followEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);


                const follow = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl
                };


                console.log(
                    "FOLLOW:",
                    `@${follow.uniqueId || "unknown"}`,
                    follow.nickname
                );


                liveEvents.emit(
                    "follow",
                    follow
                );

            } catch (error) {

                console.error(
                    "S-LIVE follow processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       🔔 SUBSCRIBE
    ========================================= */

    connection.on(
        subscribeEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);


                const subscribe = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl,

                    message:
                        data?.message ||
                        "",

                    subMonth:
                        Number(
                            data?.subMonth ??
                            data?.months ??
                            1
                        )
                };


                console.log(
                    "SUBSCRIBE:",
                    `@${subscribe.uniqueId || "unknown"}`,
                    subscribe.nickname
                );


                liveEvents.emit(
                    "subscribe",
                    subscribe
                );

            } catch (error) {

                console.error(
                    "S-LIVE subscribe processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       🔄 SHARE
    ========================================= */

    connection.on(
        shareEvent,
        (data) => {

            try {

                const user =
                    getUserData(data);


                const share = {

                    uniqueId:
                        user.uniqueId,

                    nickname:
                        user.nickname,

                    profilePictureUrl:
                        user.profilePictureUrl
                };


                console.log(
                    "SHARE:",
                    `@${share.uniqueId || "unknown"}`,
                    share.nickname
                );


                liveEvents.emit(
                    "share",
                    share
                );

            } catch (error) {

                console.error(
                    "S-LIVE share processing error:",
                    error
                );
            }
        }
    );


    /* =========================================
       ❌ ERROR
    ========================================= */

    connection.on(
        "error",
        (error) => {

            console.error(
                "S-LIVE TikTok error:",
                error
            );

            liveEvents.emit(
                "error",
                {
                    message:
                        error?.message ||
                        "TikTok connection error"
                }
            );
        }
    );


    /* =========================================
       🔌 CONNECT
    ========================================= */

    const roomId =
        await connection.connect();


    /* =========================================
       SAVE CONNECTION
    ========================================= */

    activeConnection =
        connection;

    activeUsername =
        cleanUsername;

    activeRoomId =
        roomId || null;


    /* =========================================
       BROADCASTER PROFILE
    ========================================= */

    activeProfilePicture =
    getBroadcasterProfilePicture(connection);

console.log(
    "S-LIVE broadcaster profile URL:",
    activeProfilePicture
);


    console.log(
        "S-LIVE connected:",
        `@${cleanUsername}`,
        "room:",
        activeRoomId,
        "profile:",
        activeProfilePicture
            ? "found"
            : "not found"
    );


    /* =========================================
       CONNECTED EVENT
    ========================================= */

    liveEvents.emit(
        "connected",
        {
            username:
                activeUsername,

            roomId:
                activeRoomId,

            profilePicture:
                activeProfilePicture
        }
    );


    return {

        username:
            activeUsername,

        roomId:
            activeRoomId,

        profilePicture:
            activeProfilePicture
    };
}


/* =========================================
   DISCONNECT
========================================= */

async function disconnectFromTikTok() {

    if (activeConnection) {

        try {

            await activeConnection.disconnect();

        } catch (error) {

            console.warn(
                "S-LIVE disconnect warning:",
                error?.message
            );
        }
    }


    activeConnection =
        null;

    activeUsername =
        null;

    activeRoomId =
        null;

    activeProfilePicture =
        null;


    liveEvents.emit(
        "disconnected"
    );


    console.log(
        "S-LIVE TikTok disconnected"
    );


    return true;
}


/* =========================================
   STATUS
========================================= */

function getConnectionStatus() {

    return {

        connected:
            !!activeConnection,

        username:
            activeUsername,

        roomId:
            activeRoomId,

        profilePicture:
            activeProfilePicture
    };
}


/* =========================================
   EXPORT
========================================= */

module.exports = {

    connectToTikTok,

    disconnectFromTikTok,

    getConnectionStatus,

    liveEvents
};
