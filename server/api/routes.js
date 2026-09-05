const express = require("express");

const router = express.Router();


/* =========================================
   S-LIVE API
========================================= */

router.get("/status", (req, res) => {

    res.json({
        success: true,
        project: "S-LIVE",
        server: "online",
        timestamp: Date.now()
    });

});


module.exports = router;
