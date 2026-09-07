(function () {

    console.log(
        "S-LIVE: Connection page initialized"
    );


    /* =========================================
       ELEMENTS
    ========================================= */

    const usernameInput =
        document.getElementById(
            "username"
        );

    const connectButton =
        document.getElementById(
            "connect-btn"
        );

    const connectionStatus =
        document.getElementById(
            "connection-status"
        );


    /*
        التأكد من وجود العناصر
    */

    if (
        !usernameInput ||
        !connectButton ||
        !connectionStatus
    ) {

        console.error(
            "S-LIVE: Connection elements not found"
        );

        return;
    }


    /* =========================================
       EVENTS
    ========================================= */

    connectButton.addEventListener(
        "click",
        startConnection
    );


    usernameInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                startConnection();
            }
        }
    );


    /* =========================================
       START CONNECTION
    ========================================= */

    async function startConnection() {

        let username =
            usernameInput.value.trim();


        /*
            التحقق من الإدخال
        */

        if (!username) {

            setStatus(
                "يرجى إدخال اسم مستخدم TikTok",
                "error"
            );

            usernameInput.focus();

            return;
        }


        /*
            إزالة @
        */

        username =
            username.replace(
                /^@+/,
                ""
            );


        /*
            إزالة المسافات
        */

        username =
            username.replace(
                /\s+/g,
                ""
            );


        /*
            التحقق مرة أخرى
        */

        if (!username) {

            setStatus(
                "اسم المستخدم غير صالح",
                "error"
            );

            return;
        }


        /*
            عرض الاسم بالشكل الصحيح
        */

        usernameInput.value =
            "@" + username;


        /* =====================================
           UI - CONNECTING
        ===================================== */

        connectButton.disabled =
            true;

        connectButton.textContent =
            "جاري الاتصال...";


        setStatus(
            "جاري الاتصال باللايف...",
            "connecting"
        );


        /* =====================================
           SERVER REQUEST
        ===================================== */

        try {

            console.log(
                `S-LIVE: Connecting to @${username}`
            );


            const response =
                await fetch(
                    "/api/connection/connect",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username:
                                    username
                            })
                    }
                );


            /*
                محاولة قراءة JSON
            */

            let data;

            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "السيرفر لم يُرجع استجابة صحيحة"
                );
            }


            /*
                فشل الاتصال
            */

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "فشل الاتصال باللايف"
                );
            }


            console.log(
                "S-LIVE: TikTok connected",
                data
            );


            /* =====================================
               SAVE CONNECTION
            ===================================== */

            const connectedUsername =
                data.username ||
                username;


            localStorage.setItem(
                "s_live_username",
                connectedUsername
            );


            localStorage.setItem(
                "s_live_connected",
                "true"
            );


            /*
                حفظ Room ID إن توفر
            */

            if (data.roomId) {

                localStorage.setItem(
                    "s_live_room_id",
                    String(data.roomId)
                );

            } else {

                localStorage.removeItem(
                    "s_live_room_id"
                );
            }


            /* =====================================
               SUCCESS
            ===================================== */

            setStatus(
                "تم الاتصال بنجاح",
                "connected"
            );


            connectButton.textContent =
                "تم الاتصال";


            /*
                الانتقال إلى Home
            */

            setTimeout(
                function () {

                    if (
                        window.SLive &&
                        typeof
                            window.SLive.loadPage ===
                            "function"
                    ) {

                        window.SLive.loadPage(
                            "home"
                        );

                    } else {

                        console.error(
                            "S-LIVE: loadPage not available"
                        );
                    }

                },
                300
            );


        } catch (error) {

            console.error(
                "S-LIVE connection error:",
                error
            );


            /* =====================================
               ERROR
            ===================================== */

            setStatus(
                error.message ||
                "تعذر الاتصال باللايف",
                "error"
            );


            connectButton.disabled =
                false;

            connectButton.textContent =
                "اتصال باللايف";
        }
    }


    /* =========================================
       SET STATUS
    ========================================= */

    function setStatus(
        message,
        state
    ) {

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

                statusDot.classList.add(
                    state
                );
            }
        }
    }

})();
