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

    const connectButton = document.querySelector("#connect-button");
const usernameInput = document.querySelector("#username");
const statusElement = document.querySelector("#connection-status");

connectButton.addEventListener("click", async () => {

    const username = usernameInput.value.trim();

    if (!username) {
        statusElement.textContent = "أدخل اسم مستخدم TikTok";
        return;
    }

    connectButton.disabled = true;
    statusElement.textContent = "جاري الاتصال...";

    try {

        const response = await fetch("/api/connection/connect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "فشل الاتصال"
            );
        }

        console.log("TikTok connected:", data);

        statusElement.textContent = "تم الاتصال بنجاح";

        // الانتقال إلى الصفحة الرئيسية
        if (window.loadPage) {
            window.loadPage("home");
        }

    } catch (error) {

        console.error(error);

        statusElement.textContent =
            error.message || "حدث خطأ أثناء الاتصال";

        connectButton.disabled = false;
    }
});


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
