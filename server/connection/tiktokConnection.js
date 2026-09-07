const EventEmitter = require("events");

const liveEvents = new EventEmitter();

let activeConnection = null;
let activeUsername = null;
let activeRoomId = null;


/*
=========================================
CONNECT TO TIKTOK LIVE
=========================================
*/

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


    if (!TikTokLiveConnection) {
        throw new Error(
            "TikTokLiveConnection غير متوفر"
        );
    }


    /*
    =========================================
    إغلاق الاتصال السابق
    =========================================
    */

    if (activeConnection) {

        try {

            await activeConnection.disconnect();

        } catch (error) {

            console.log(
                "S-LIVE: Previous connection closed"
            );

        }

        activeConnection = null;
    }


    console.log("");
    console.log(
        "================================="
    );
    console.log(
        "S-LIVE: TIKTOK CONNECTION"
    );
    console.log(
        "================================="
    );

    console.log(
        `Connecting to @${cleanUsername}`
    );


    /*
    =========================================
    إنشاء الاتصال
    =========================================
    */

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
    MEMBER EVENT
    شخص جديد يدخل اللايف
    =========================================
    */

    connection.on(
        WebcastEvent.MEMBER,
        (data) => {

            /*
            ---------------------------------
            طباعة البيانات الأصلية
            ---------------------------------
            */

            console.log(
                "S-LIVE MEMBER DATA:"
            );

            console.log(
                JSON.stringify(
                    data,
                    null,
                    2
                )
            );


            /*
            ---------------------------------
            بيانات العضو
            ---------------------------------
            
            في الإصدار الحالي:
            
            data.uniqueId
            data.nickname
            data.profilePictureUrl
            
            */

            const uniqueId =
                data?.uniqueId ||
                data?.user?.uniqueId ||
                "";


            const nickname =
                data?.nickname ||
                data?.user?.nickname ||
                uniqueId ||
                "TikTok User";


            /*
            ---------------------------------
            جمع جميع روابط الصور المتاحة
            ---------------------------------
            */

            const profilePictures = [];


            /*
            الصورة الرئيسية
            */

            if (
                data?.profilePictureUrl
            ) {

                profilePictures.push(
                    data.profilePictureUrl
                );

            }


            /*
            الصور الموجودة داخل
            userDetails
            */

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


            /*
            في حال كانت البنية user
            */

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


            /*
            إزالة التكرار
            */

            const uniquePictures =
                [
                    ...new Set(
                        profilePictures
                            .filter(Boolean)
                    )
                ];


            /*
            ---------------------------------
            إنشاء بيانات العضو
            ---------------------------------
            */

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


            /*
            ---------------------------------
            LOG
            ---------------------------------
            */

            console.log(
                "S-LIVE NEW MEMBER:"
            );

            console.log(
                `Name: ${member.nickname}`
            );

            console.log(
                `Username: @${member.uniqueId}`
            );

            console.log(
                `Profile images: ${member.profilePictures.length}`
            );


            if (
                member.profilePictureUrl
            ) {

                console.log(
                    "S-LIVE PROFILE:",
                    member.profilePictureUrl
                );

            } else {

                console.log(
                    "S-LIVE PROFILE: NO IMAGE"
                );

            }


            /*
            ---------------------------------
            إرسال العضو إلى Home
            ---------------------------------
            */

            liveEvents.emit(
                "member",
                member
            );

        }
    );


    /*
    =========================================
    معالجة أخطاء TikTok
    =========================================
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
    =========================================
    الاتصال
    =========================================
    */

    const state =
        await connection.connect();


    /*
    حفظ الاتصال
    */

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

    console.log(
        "================================="
    );

    console.log("");


    return {

        username:
            activeUsername,

        roomId:
            activeRoomId

    };

}


/*
=========================================
DISCONNECT
=========================================
*/

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


/*
=========================================
CONNECTION STATUS
=========================================
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
            activeRoomId

    };

}


/*
=========================================
EXPORTS
=========================================
*/

module.exports = {

    connectToTikTok,

    disconnectFromTikTok,

    getConnectionStatus,

    liveEvents

};
