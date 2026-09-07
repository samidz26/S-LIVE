const EventEmitter = require("events");

const liveEvents =
new EventEmitter();

let activeConnection = null;

let activeUsername = null;

let activeRoomId = null;

let activeProfilePictureUrl = "";

/*

HELPERS

*/

function cleanUsername(username) {

return String(username || "")
    .trim()
    .replace(/^@+/, "");

}

/*

البحث عن أول رابط صورة داخل object

*/

function findImageUrl(
object,
depth = 0
) {

if (
    !object ||
    depth > 8
) {

    return "";

}


if (
    typeof object === "string"
) {

    if (
        object.startsWith(
            "https://"
        ) &&
        (
            object.includes(
                "tiktokcdn"
            ) ||
            object.includes(
                "muscdn"
            )
        )
    ) {

        return object;

    }

    return "";

}


if (
    Array.isArray(object)
) {

    for (
        const item of object
    ) {

        const result =
            findImageUrl(
                item,
                depth + 1
            );

        if (result) {
            return result;
        }

    }

    return "";

}


if (
    typeof object === "object"
) {

    /*
    نعطي الأولوية للحقول
    المعروفة للصور
    */

    const priorityKeys = [

        "profilePictureUrl",

        "avatarUrl",

        "avatar",

        "avatar_thumb",

        "avatarThumb",

        "profilePictureUrls",

        "url_list",

        "urlList"

    ];


    for (
        const key of priorityKeys
    ) {

        if (
            object[key]
        ) {

            const result =
                findImageUrl(
                    object[key],
                    depth + 1
                );

            if (result) {
                return result;
            }

        }

    }


    /*
    البحث العام
    */

    for (
        const key of Object.keys(object)
    ) {

        const value =
            object[key];

        const result =
            findImageUrl(
                value,
                depth + 1
            );

        if (result) {
            return result;
        }

    }

}


return "";

}

/*

استخراج صورة صاحب اللايف

*/

function extractOwnerProfilePicture(
roomInfo
) {

if (!roomInfo) {
    return "";
}


/*
بعض الإصدارات:

roomInfo.owner
roomInfo.liveRoom.owner
roomInfo.owner.avatar_thumb
*/


const possibleOwners = [

    roomInfo?.owner,

    roomInfo?.liveRoom?.owner,

    roomInfo?.roomInfo?.owner,

    roomInfo?.live_room?.owner,

    roomInfo?.data?.owner,

    roomInfo?.data?.liveRoom?.owner

];


for (
    const owner
    of possibleOwners
) {

    const image =
        findImageUrl(
            owner
        );

    if (image) {
        return image;
    }

}


/*
البحث داخل roomInfo بالكامل
*/

return findImageUrl(
    roomInfo
);

}

/*

CONNECT TO TIKTOK LIVE

*/

async function connectToTikTok(
username
) {

const clean =
    cleanUsername(
        username
    );


if (!clean) {

    throw new Error(
        "اسم المستخدم غير صالح"
    );

}


/*
تحميل مكتبة TikTok
*/

const module =
    await import(
        "tiktok-live-connector"
    );


const {
    TikTokLiveConnection,
    WebcastEvent
} = module;


if (
    !TikTokLiveConnection
) {

    throw new Error(
        "TikTokLiveConnection غير متوفر"
    );

}


/*
إغلاق الاتصال السابق
*/

if (
    activeConnection
) {

    try {

        await activeConnection
            .disconnect();

    } catch (error) {

        console.log(
            "S-LIVE: Previous connection closed"
        );

    }

}


activeConnection = null;

activeUsername = null;

activeRoomId = null;

activeProfilePictureUrl = "";


console.log("");

console.log(
    "================================="
);

console.log(
    "S-LIVE: TIKTOK CONNECTION"
);

console.log(
    `Connecting to @${clean}`
);

console.log(
    "================================="
);


/*
إنشاء الاتصال
*/

const connection =
    new TikTokLiveConnection(
        clean,
        {

            processInitialData:
                false,

            fetchRoomInfoOnConnect:
                true

        }
    );


/*
=====================================
MEMBER
=====================================
*/

connection.on(
    WebcastEvent.MEMBER,
    (data) => {

        const uniqueId =
            data?.uniqueId ||
            data?.user?.uniqueId ||
            "";

        const nickname =
            data?.nickname ||
            data?.user?.nickname ||
            uniqueId ||
            "TikTok User";


        const profilePictures = [];


        if (
            data?.profilePictureUrl
        ) {

            profilePictures.push(
                data.profilePictureUrl
            );

        }


        if (
            Array.isArray(
                data?.userDetails
                    ?.profilePictureUrls
            )
        ) {

            profilePictures.push(
                ...data.userDetails
                    .profilePictureUrls
            );

        }


        if (
            data?.user
                ?.profilePictureUrl
        ) {

            profilePictures.push(
                data.user.profilePictureUrl
            );

        }


        if (
            Array.isArray(
                data?.user
                    ?.userDetails
                    ?.profilePictureUrls
            )
        ) {

            profilePictures.push(
                ...data.user
                    .userDetails
                    .profilePictureUrls
            );

        }


        const uniquePictures =
            [
                ...new Set(
                    profilePictures
                        .filter(Boolean)
                )
            ];


        const member = {

            uniqueId,

            nickname,

            profilePictureUrl:
                uniquePictures[0] || "",

            profilePictures:
                uniquePictures,

            joinedAt:
                Date.now()

        };


        console.log(
            `S-LIVE: Member @${uniqueId}`
        );


        liveEvents.emit(
            "member",
            member
        );

    }
);


/*
=====================================
ERROR
=====================================
*/

connection.on(
    "error",
    (error) => {

        console.error(
            "S-LIVE TikTok ERROR:",
            error
        );

    }
);


/*
=====================================
CONNECT
=====================================
*/

const state =
    await connection.connect();


/*
=====================================
SAVE CONNECTION
=====================================
*/

activeConnection =
    connection;

activeUsername =
    clean;

activeRoomId =
    state?.roomId ||
    connection.roomId ||
    null;


/*
=====================================
OWNER PROFILE
=====================================
*/

let roomInfo =
    connection.roomInfo;


/*
في بعض الإصدارات قد يكون roomInfo
موجودًا داخل state
*/

if (!roomInfo) {

    roomInfo =
        state?.roomInfo;

}


activeProfilePictureUrl =
    extractOwnerProfilePicture(
        roomInfo
    );


console.log(
    `S-LIVE: Connected to @${clean}`
);

console.log(
    `S-LIVE: Room ID: ${activeRoomId}`
);

console.log(
    "S-LIVE: Owner profile:",
    activeProfilePictureUrl ||
    "NO IMAGE"
);


/*
إرسال حالة الاتصال
*/

liveEvents.emit(
    "connection",
    {

        connected: true,

        username:
            activeUsername,

        roomId:
            activeRoomId,

        profilePictureUrl:
            activeProfilePictureUrl

    }
);


return {

    username:
        activeUsername,

    roomId:
        activeRoomId,

    profilePictureUrl:
        activeProfilePictureUrl

};

}

/*

DISCONNECT

*/

async function disconnectFromTikTok() {

if (
    activeConnection
) {

    try {

        await activeConnection
            .disconnect();

    } catch (error) {

        console.error(
            "S-LIVE disconnect error:",
            error
        );

    }

}


activeConnection = null;

activeUsername = null;

activeRoomId = null;

activeProfilePictureUrl = "";


liveEvents.emit(
    "disconnect",
    {

        connected: false

    }
);


console.log(
    "S-LIVE: TikTok disconnected"
);

}

/*

STATUS

*/

function getConnectionStatus() {

return {

    success: true,

    connected:
        Boolean(
            activeConnection
        ),

    username:
        activeUsername,

    roomId:
        activeRoomId,

    profilePictureUrl:
        activeProfilePictureUrl

};

}

/*

EXPORTS

*/

module.exports = {

connectToTikTok,

disconnectFromTikTok,

getConnectionStatus,

liveEvents

}; 
