const express = require("express");

const config =
    require("../config/config");

const router =
    express.Router();


/* =========================================
   حالة S-LIVE
========================================= */

router.get(
    "/status",
    (req, res) => {

        res.json({

            success: true,

            project:
                config.projectName,

            server:
                "online",

            timestamp:
                Date.now()

        });

    }
);


module.exports = router;
