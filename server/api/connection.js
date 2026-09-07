const express = require("express");

const {
    connectToTikTok,
    disconnectFromTikTok,
    getConnectionStatus,
    liveEvents
} = require("../connection/tiktokConnection");

const router = express.Router();


/*
=========================================
CONNECT
=========================================
*/

router.post(
    "/connect",
    async (req, res) => {

        try {

            const username =
                String(
                    req.body.username || ""
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

                username:
                    result.username,

                roomId:
                    result.roomId

            });

        } catch (error) {

            console.error(
                "S-LIVE TikTok connection error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "تعذر الاتصال باللايف"

            });
        }
    }
);


/*
=========================================
DISCONNECT
=========================================
*/

router.post(
    "/disconnect",
    async (req, res) => {

        try {

            await disconnectFromTikTok();

            return res.json({
                success: true
            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "تعذر قطع الاتصال"

            });
        }
    }
);


/*
=========================================
STATUS
=========================================
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
=========================================
LIVE EVENTS - SSE

Home تفتح هذا الاتصال
وتنتظر الأحداث القادمة من TikTok
=========================================
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
            "no-cache"
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
        ---------------------------------
        إرسال حدث دخول شخص
        ---------------------------------
        */

        const sendMember = (member) => {

            res.write(
                `event: member\n`
            );

            res.write(
                `data: ${JSON.stringify(member)}\n\n`
            );
        };


        /*
        الاستماع لأحداث دخول الأشخاص
        */

        liveEvents.on(
            "member",
            sendMember
        );


        /*
        نبض كل 25 ثانية
        حتى يبقى الاتصال مفتوحًا
        */

        const heartbeat =
            setInterval(() => {

                res.write(
                    `: heartbeat\n\n`
                );

            }, 25000);


        /*
        ---------------------------------
        إغلاق الصفحة
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

                console.log(
                    "S-LIVE: Home events disconnected"
                );

            }
        );

    }
);


module.exports = router;
