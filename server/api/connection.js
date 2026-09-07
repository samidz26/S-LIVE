const express = require("express");

const router = express.Router();

const {
    connectToTikTok,
    disconnectFromTikTok,
    getConnectionStatus,
    liveEvents
} = require("../connection/tiktokConnection");


/* =========================================
   CONNECT
========================================= */

router.post("/connect", async (req, res) => {

    try {

        const username =
            req.body?.username;

        if (
            !username ||
            typeof username !== "string"
        ) {

            return res.status(400).json({
                success: false,
                message: "اسم المستخدم مطلوب"
            });
        }


        const cleanUsername =
            username
                .trim()
                .replace(/^@/, "");


        if (!cleanUsername) {

            return res.status(400).json({
                success: false,
                message: "اسم المستخدم غير صالح"
            });
        }


        const result =
            await connectToTikTok(
                cleanUsername
            );


        return res.json({
            success: true,
            ...result
        });

    } catch (error) {

        console.error(
            "S-LIVE connect API error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "فشل الاتصال باللايف"
        });
    }
});


/* =========================================
   DISCONNECT
========================================= */

router.post("/disconnect", async (req, res) => {

    try {

        await disconnectFromTikTok();


        return res.json({
            success: true,
            message: "تم قطع الاتصال"
        });

    } catch (error) {

        console.error(
            "S-LIVE disconnect API error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "تعذر قطع الاتصال"
        });
    }
});


/* =========================================
   STATUS
========================================= */

router.get("/status", (req, res) => {

    try {

        const status =
            getConnectionStatus();


        return res.json({
            success: true,
            ...status
        });

    } catch (error) {

        console.error(
            "S-LIVE status API error:",
            error
        );

        return res.status(500).json({
            success: false,
            connected: false
        });
    }
});


/* =========================================
   LIVE EVENTS - SSE
========================================= */

router.get("/events", (req, res) => {

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


    /* =========================================
       SSE CONNECTED
    ========================================= */

    res.write(
        ": connected\n\n"
    );


    /* =========================================
       GENERIC EVENT SENDER
    ========================================= */

    const sendEvent =
        (eventName) =>
        (data) => {

            try {

                res.write(
                    `event: ${eventName}\n` +
                    `data: ${JSON.stringify(data)}\n\n`
                );

            } catch (error) {

                console.error(
                    `S-LIVE SSE ${eventName} error:`,
                    error
                );
            }
        };


    /* =========================================
       CREATE EVENT HANDLERS
    ========================================= */

    const sendMember =
        sendEvent("member");

    const sendChat =
        sendEvent("chat");

    const sendGift =
        sendEvent("gift");

    const sendLike =
        sendEvent("like");

    const sendFollow =
        sendEvent("follow");

    const sendSubscribe =
        sendEvent("subscribe");

    const sendShare =
        sendEvent("share");

    const sendConnected =
        sendEvent("connected");

    const sendDisconnected =
        sendEvent("disconnected");

    const sendError =
        sendEvent("error");


    /* =========================================
       REGISTER EVENTS
    ========================================= */

    liveEvents.on(
        "member",
        sendMember
    );

    liveEvents.on(
        "chat",
        sendChat
    );

    liveEvents.on(
        "gift",
        sendGift
    );

    liveEvents.on(
        "like",
        sendLike
    );

    liveEvents.on(
        "follow",
        sendFollow
    );

    liveEvents.on(
        "subscribe",
        sendSubscribe
    );

    liveEvents.on(
        "share",
        sendShare
    );

    liveEvents.on(
        "connected",
        sendConnected
    );

    liveEvents.on(
        "disconnected",
        sendDisconnected
    );

    liveEvents.on(
        "error",
        sendError
    );


    /* =========================================
       KEEP ALIVE
    ========================================= */

    const keepAlive =
        setInterval(() => {

            try {

                res.write(
                    ": ping\n\n"
                );

            } catch (error) {

                clearInterval(
                    keepAlive
                );
            }

        }, 20000);


    /* =========================================
       CLEANUP
    ========================================= */

    req.on(
        "close",
        () => {

            clearInterval(
                keepAlive
            );


            liveEvents.off(
                "member",
                sendMember
            );

            liveEvents.off(
                "chat",
                sendChat
            );

            liveEvents.off(
                "gift",
                sendGift
            );

            liveEvents.off(
                "like",
                sendLike
            );

            liveEvents.off(
                "follow",
                sendFollow
            );

            liveEvents.off(
                "subscribe",
                sendSubscribe
            );

            liveEvents.off(
                "share",
                sendShare
            );

            liveEvents.off(
                "connected",
                sendConnected
            );

            liveEvents.off(
                "disconnected",
                sendDisconnected
            );

            liveEvents.off(
                "error",
                sendError
            );


            try {
                res.end();
            } catch (error) {
                // الاتصال مغلق بالفعل
            }
        }
    );
});


/* =========================================
   PROXY IMAGE
========================================= */

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
                await fetch(imageUrl);


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


            return res.end(buffer);

        } catch (error) {

            console.error(
                "S-LIVE proxy-image error:",
                error
            );

            return res.status(502).end();
        }
    }
);


/* =========================================
   EXPORT
========================================= */

module.exports = router;
