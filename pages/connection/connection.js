/* =========================================
   S-LIVE
   CONNECTION PAGE
========================================= */

(function () {

    const usernameInput =
        document.getElementById("username");

    const connectButton =
        document.getElementById("connect-btn");

    const connectionStatus =
        document.getElementById("connection-status");


    if (!usernameInput ||
        !connectButton ||
        !connectionStatus) {

        console.error(
            "S-LIVE: Connection elements not found"
        );

        return;
    }


    /* =========================================
       زر الاتصال
    ========================================= */

    connectButton.addEventListener(
        "click",
        startConnection
    );


    /* =========================================
       الضغط على Enter
    ========================================= */

    usernameInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                startConnection();
            }

        }
    );


    /* =========================================
       بدء الاتصال
    ========================================= */

    function startConnection() {

        let username =
            usernameInput.value.trim();


        /* منع الإدخال الفارغ */

        if (!username) {

            setStatus(
                "يرجى إدخال اسم مستخدم TikTok",
                "error"
            );

            usernameInput.focus();

            return;
        }


        /* إزالة @ إذا كتبها المستخدم */

        username =
            username.replace(/^@+/, "");


        /* تنظيف اسم المستخدم */

        username =
            username.replace(/\s+/g, "");


        if (!username) {

            setStatus(
                "اسم المستخدم غير صالح",
                "error"
            );

            return;
        }


        /* إعادة كتابة الاسم بشكل موحد */

        usernameInput.value =
            "@" + username;


        /* تعطيل الزر أثناء الاتصال */

        connectButton.disabled = true;

        connectButton.textContent =
            "جاري الاتصال...";


        setStatus(
            "جاري الاتصال باللايف...",
            "connecting"
        );


        /*
         * =====================================
         * الاتصال الحقيقي بـ TikTok
         * سيتم إضافته لاحقًا.
         * =====================================
         */

        console.log(
            "S-LIVE: Connecting to TikTok LIVE:",
            username
        );


        /*
         * مؤقت للتجربة فقط
         */

        setTimeout(function () {

            connectButton.disabled = false;

            connectButton.textContent =
                "اتصال باللايف";

            setStatus(
                "جاهز للاتصال الحقيقي",
                "connecting"
            );

        }, 1500);

    }


    /* =========================================
       تغيير حالة الاتصال
    ========================================= */

    function setStatus(message, state) {

        const statusText =
            connectionStatus.querySelector(
                "span:last-child"
            );

        const statusDot =
            connectionStatus.querySelector(
                ".status-dot"
            );


        if (statusText) {
            statusText.textContent =
                message;
        }


        if (statusDot) {

            statusDot.className =
                "status-dot";

            if (state) {
                statusDot.classList.add(state);
            }

        }

    }

})();
