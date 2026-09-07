const express = require("express");
const path = require("path");

const apiRoutes =
    require("./server/api/routes");

const connectionRoutes =
    require("./server/api/connection");


const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================
   إعدادات Express
========================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   الملفات العامة
========================================= */

app.use(
    express.static(
        __dirname
    )
);


/* =========================================
   API
========================================= */

app.use(
    "/api",
    apiRoutes
);


app.use(
    "/api/connection",
    connectionRoutes
);


/* =========================================
   الصفحة الرئيسية
========================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* =========================================
   تشغيل السيرفر
========================================= */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "        S-LIVE SERVER"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            "================================="
        );

        console.log("");

    }
);
