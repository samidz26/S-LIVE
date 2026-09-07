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
        document.getElementById(
            "connection-status"
        );


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
       زر الاتصال
    ========================================= */

    connectButton.addEventListener(
        "click",
        startConnection
    );


    /* =========================================
       Enter
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

    async function startConnection() {

        let username =
            usernameInput.value.trim();


        if (!username) {

            setStatus(
                "يرجى إدخال اسم مستخدم TikTok",
                "error"
            );

            usernameInput.focus();

            return;
        }


        // إزالة @
        username =
            username.replace(/^@+/, "");


        // إزالة المسافات
        username =
            username.replace(/\s+/g, "");


        if (!username) {

            setStatus(
                "اسم المستخدم غير صالح",
                "error"
            );

            return;
        }


        usernameInput.value =
            "@" + username;


        connectButton.disabled = true;

        connectButton.textContent =
            "جاري الاتصال...";


        setStatus(
            "جاري الاتصال باللايف...",
            "connecting"
        );


        try {

            const response =
                await fetch(
                    "/api/connection/connect",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username
                        })
                    }
                );


            const data =
                await response.json();


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


            setStatus(
                "تم الاتصال بنجاح",
                "connected"
            );


            /*
             * ننتظر قليلًا حتى تظهر
             * حالة الاتصال للمستخدم
             */

            setTimeout(() => {

                if (
                    window.SLive &&
                    typeof
                    window.SLive.loadPage ===
                    "function"
                ) {

                    window.SLive.loadPage(
                        "home"
                    );

                }

            }, 300);


        } catch (error) {

            console.error(
                "S-LIVE connection error:",
                error
            );


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
       تغيير حالة الاتصال
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
