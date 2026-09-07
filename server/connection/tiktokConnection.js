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

        /*
         * أشهر صيغ TikTok
         */

        const possibleFields = [
            "url_list",
            "urlList",
            "url",
            "uri",
            "profilePictureUrl",
            "profile_picture_url",
            "avatar",
            "avatar_thumb",
            "avatarThumb"
        ];


        for (
            const field
            of possibleFields
        ) {

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


        /*
         * بحث محدود داخل الكائن
         * في حال تغيرت بنية TikTok
         */

        for (
            const key
            of Object.keys(value)
        ) {

            const lowerKey =
                key.toLowerCase();


            if (
                lowerKey.includes("avatar") ||
                lowerKey.includes("profilepicture")
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

function getBroadcasterProfilePicture(
    connection
) {

    try {

        const roomInfo =
            connection?.roomInfo;


        if (!roomInfo) {
            return null;
        }


        /*
         * صاحب الغرفة غالباً موجود
         * في roomInfo.owner
         */

        const owner =
            roomInfo.owner ||
            roomInfo.room?.owner ||
            roomInfo.anchor ||
            roomInfo.host;


        if (!owner) {

            return null;
        }


        return (
            getFirstUrl(
                owner.avatar_thumb
            ) ||

            getFirstUrl(
                owner.avatarThumb
            ) ||

            getFirstUrl(
                owner.profilePictureUrl
            ) ||

            getFirstUrl(
                owner.profile_picture_url
            ) ||

            getFirstUrl(
                owner.avatar
            )
        );

    } catch (error) {

        console.error(
            "S-LIVE broadcaster image error:",
            error
        );

        return null;
    }
}


/* =========================================
   CONNECT TO TIKTOK
========================================= */

async function connectToTikTok(
    username
) {

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


    /*
     * إذا كان هناك اتصال سابق
     * نفصله أولاً.
     */

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


    activeUsername =
        null;

    activeRoomId =
        null;

    activeProfilePicture =
        null;


    /*
     * تحميل المكتبة ديناميكياً
     */

    const module =
        await import(
            "tiktok-live-connector"
        );


    /*
     * الإصدارات الحديثة تستخدم
     * WebcastPushConnection
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


    /*
     * إنشاء الاتصال
     */

    const connection =
        new TikTokLiveConnection(
            cleanUsername,
            {
                processInitialData: false,
                fetchRoomInfoOnConnect: true
            }
        );


    /* =========================================
       MEMBER EVENT
    ========================================= */

    const memberEvent =
        WebcastEvent.MEMBER ||
        "member";


    connection.on(
        memberEvent,
        (data) => {

            try {

                const user =
                    data?.user ||
                    data?.member ||
                    data;


                if (!user) {
                    return;
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
                    getFirstUrl(
                        user.avatar_thumb
                    ) ||
                    getFirstUrl(
                        user.avatarThumb
                    ) ||
                    getFirstUrl(
                        user.avatar
                    ) ||
                    data?.profilePictureUrl ||
                    "";


                const member = {

                    uniqueId,

                    nickname,

                    profilePictureUrl
                };


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
       ERROR EVENT
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
       CONNECT
    ========================================= */

    const roomId =
        await connection.connect();


    /*
     * حفظ الاتصال
     */

    activeConnection =
        connection;

    activeUsername =
        cleanUsername;

    activeRoomId =
        roomId || null;


    /*
     * استخراج صورة صاحب اللايف
     */

    activeProfilePicture =
        getBroadcasterProfilePicture(
            connection
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


    /*
     * إرسال معلومات الاتصال
     */

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
