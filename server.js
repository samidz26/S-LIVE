const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================
   إعدادات Express
========================================= */

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


/* =========================================
   الملفات العامة
========================================= */

app.use(
    express.static(
        path.join(__dirname)
    )
);


/* =========================================
   الصفحة الرئيسية
========================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/* =========================================
   API - حالة السيرفر
========================================= */

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        project: "S-LIVE",

        server: "online",

        timestamp: Date.now()

    });

});


/* =========================================
   تشغيل السيرفر
========================================= */

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("        S-LIVE SERVER");
    console.log("=================================");
    console.log(`Server running on port ${PORT}`);
    console.log("=================================");
    console.log("");

});
