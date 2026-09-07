const express = require("express");

const {
    connectToTikTok,
    disconnectFromTikTok,
    getConnectionStatus
} = require("../connection/tiktokConnection");

const router = express.Router();


/* =========================================
   الاتصال
========================================= */

router.post("/connect", async (req, res) => {

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

});


/* =========================================
   قطع الاتصال
========================================= */

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


/* =========================================
   حالة الاتصال
========================================= */

router.get(
    "/status",
    (req, res) => {

        return res.json(
            getConnectionStatus()
        );

    }
);


module.exports = router;
