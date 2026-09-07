(function () {

    console.log(
        "S-LIVE: Home initialized"
    );


    const card =
        document.getElementById(
            "live-event-card"
        );

    const profile =
        document.getElementById(
            "member-profile"
        );

    const name =
        document.getElementById(
            "member-name"
        );

    const username =
        document.getElementById(
            "member-username"
        );


    if (
        !card ||
        !profile ||
        !name ||
        !username
    ) {

        console.error(
            "S-LIVE: Home elements not found"
        );

        return;
    }


    /*
    =========================================
    الاتصال بأحداث TikTok
    =========================================
    */

    const events =
        new EventSource(
            "/api/connection/events"
        );


    /*
    =========================================
    شخص جديد دخل اللايف
    =========================================
    */

    events.addEventListener(
        "member",
        function (event) {

            try {

                const member =
                    JSON.parse(
                        event.data
                    );

                console.log(
                    "S-LIVE: New member",
                    member
                );


                /*
                الاسم
                */

                name.textContent =
                    member.nickname ||
                    member.uniqueId ||
                    "TikTok User";


                /*
                اسم المستخدم
                */

                if (
                    member.uniqueId
                ) {

                    username.textContent =
                        "@" +
                        member.uniqueId;

                } else {

                    username.textContent =
                        "";

                }


                /*
                الصورة
                */

                if (
                    member.profilePictureUrl
                ) {

                    profile.onload =
                        function () {

                            profile.style.opacity =
                                "1";

                        };

                    profile.onerror =
                        function () {

                            profile.style.opacity =
                                "0";

                        };

                    profile.src =
                        member.profilePictureUrl;

                }


                /*
                إعادة تشغيل Animation
                */

                card.classList.remove(
                    "new-member"
                );

                void card.offsetWidth;

                card.classList.add(
                    "new-member"
                );

            } catch (error) {

                console.error(
                    "S-LIVE: Invalid member event",
                    error
                );

            }

        }
    );


    /*
    =========================================
    اتصال SSE
    =========================================
    */

    events.onopen =
        function () {

            console.log(
                "S-LIVE: Live events connected"
            );

        };


    /*
    =========================================
    خطأ في الاتصال
    =========================================
    */

    events.onerror =
        function (error) {

            console.error(
                "S-LIVE: Live events error",
                error
            );

        };


})();
