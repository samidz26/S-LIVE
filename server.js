const express = require("express");
const path = require("path");

const apiRoutes =
    require("./server/api/routes");

const connectionRoutes =
    require("./server/api/connection");


const app = express();

const PORT =
    process.env.PORT || 3000;


/*
=========================================
MIDDLEWARE
=========================================
*/

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
=========================================
STATIC FILES
=========================================
*/

app.use(
    express.static(__dirname)
);


/*
=========================================
API ROUTES
=========================================
*/

app.use(
    "/api",
    apiRoutes
);

app.use(
    "/api/connection",
    connectionRoutes
);


/*
=========================================
MAIN PAGE
=========================================
*/

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


/*
=========================================
404 API
=========================================
*/

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


/*
=========================================
SERVER ERROR
=========================================
*/

app.use(
    (err, req, res, next) => {

        console.error(
            "S-LIVE SERVER ERROR:",
            err
        );

        if (res.headersSent) {
            return next(err);
        }

        res.status(500).json({

            success: false,

            message:
                "حدث خطأ داخل السيرفر"

        });

    }
);


/*
=========================================
START SERVER
=========================================
*/

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================="
        );
        console.log(
            "          S-LIVE SERVER"
        );
        console.log(
            "================================="
        );
        console.log(
            `Server running on port ${PORT}`
        );
        console.log(
            `http://localhost:${PORT}`
        );
        console.log(
            "================================="
        );
        console.log("");

    }
);
