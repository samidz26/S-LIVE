const express = require("express");

const {
connectToTikTok,
disconnectFromTikTok,
getConnectionStatus,
liveEvents
} = require("../connection/tiktokConnection");

const router = express.Router();

/*

CONNECT

*/

router.post(
"/connect",
async (req, res) => {

    try {

        const username =
            String(
                req.body?.username || ""
            ).trim();

        if (!username) {

            return res.status(400).json({
                success: false,
                message:
                    "يرجى إدخال اسم مستخدم TikTok"
            });

        }

        const result =
            await connectToTikTok(
                username
            );

        return res.json({

            success: true,

            connected: true,

            username:
                result.username,

            roomId:
                result.roomId,

            profilePictureUrl:
                result.profilePictureUrl || ""

        });

    } catch (error) {

        console.error(
            "S-LIVE TikTok connection error:",
            error
        );

        return res.status(500).json({

            success: false,

            connected: false,

            message:
                error?.message ||
                "تعذر الاتصال باللايف"

        });

    }

}

);

/*

DISCONNECT

*/

router.post(
"/disconnect",
async (req, res) => {

    try {

        await disconnectFromTikTok();

        return res.json({

            success: true,

            connected: false

        });

    } catch (error) {

        console.error(
            "S-LIVE disconnect error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "تعذر قطع الاتصال"

        });

    }

}

);

/*

STATUS

*/

router.get(
"/status",
(req, res) => {

    return res.json(
        getConnectionStatus()
    );

}

);

/*

LIVE EVENTS - SSE

*/

router.get(
"/events",
(req, res) => {

    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.setHeader(
        "X-Accel-Buffering",
        "no"
    );

    res.flushHeaders();


    /*
    إرسال حالة الاتصال
    عند فتح SSE
    */

    const status =
        getConnectionStatus();

    res.write(
        `event: status\n`
    );

    res.write(
        `data: ${JSON.stringify(status)}\n\n`
    );


    /*
    ---------------------------------
    MEMBER EVENT
    ---------------------------------
    */

    const sendMember =
        (member) => {

            if (res.writableEnded) {
                return;
            }

            res.write(
                `event: member\n`
            );

            res.write(
                `data: ${JSON.stringify(member)}\n\n`
            );

        };


    liveEvents.on(
        "member",
        sendMember
    );


    /*
    ---------------------------------
    CONNECTION EVENT
    ---------------------------------
    */

    const sendConnection =
        (data) => {

            if (res.writableEnded) {
                return;
            }

            res.write(
                `event: connection\n`
            );

            res.write(
                `data: ${JSON.stringify(data)}\n\n`
            );

        };


    liveEvents.on(
        "connection",
        sendConnection
    );


    /*
    ---------------------------------
    DISCONNECT EVENT
    ---------------------------------
    */

    const sendDisconnect =
        (data) => {

            if (res.writableEnded) {
                return;
            }

            res.write(
                `event: disconnect\n`
            );

            res.write(
                `data: ${JSON.stringify(data)}\n\n`
            );

        };


    liveEvents.on(
        "disconnect",
        sendDisconnect
    );


    /*
    ---------------------------------
    HEARTBEAT
    ---------------------------------
    */

    const heartbeat =
        setInterval(
            () => {

                if (
                    !res.writableEnded
                ) {

                    res.write(
                        `: heartbeat\n\n`
                    );

                }

            },
            25000
        );


    /*
    ---------------------------------
    CLIENT DISCONNECTED
    ---------------------------------
    */

    req.on(
        "close",
        () => {

            clearInterval(
                heartbeat
            );

            liveEvents.off(
                "member",
                sendMember
            );

            liveEvents.off(
                "connection",
                sendConnection
            );

            liveEvents.off(
                "disconnect",
                sendDisconnect
            );

            console.log(
                "S-LIVE: SSE client disconnected"
            );

        }
    );

}

);

/*

PROXY IMAGE

نستخدمه عند الحاجة لعرض صورة
TikTok من خلال السيرفر.

*/

router.get(
"/proxy-image",
async (req, res) => {

    const imageUrl =
        req.query.url;

    if (
        !imageUrl ||
        typeof imageUrl !== "string" ||
        !imageUrl.startsWith("https://")
    ) {

        return res.status(400).end();

    }

    try {

        const response =
            await fetch(
                imageUrl
            );

        if (!response.ok) {

            return res.status(502).end();

        }

        const contentType =
            response.headers.get(
                "content-type"
            ) || "image/jpeg";

        res.setHeader(
            "Content-Type",
            contentType
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=300"
        );

        const buffer =
            Buffer.from(
                await response.arrayBuffer()
            );

        return res.end(
            buffer
        );

    } catch (error) {

        console.error(
            "S-LIVE proxy-image error:",
            error
        );

        return res.status(502).end();

    }

}

);

module.exports = router;
