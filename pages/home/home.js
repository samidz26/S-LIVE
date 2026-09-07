router.get(
    "/proxy-image",
    async (req, res) => {

        const imageUrl =
            req.query.url;

        if (
            !imageUrl ||
            typeof imageUrl !== "string" ||
            !imageUrl.startsWith("https://")
        ) {

            return res.status(400).end();
        }

        try {

            const response =
                await fetch(imageUrl);

            if (!response.ok) {

                return res.status(502).end();
            }

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "image/jpeg";

            res.setHeader(
                "Content-Type",
                contentType
            );

            res.setHeader(
                "Cache-Control",
                "public, max-age=300"
            );

            const buffer =
                Buffer.from(
                    await response.arrayBuffer()
                );

            return res.end(buffer);

        } catch (error) {

            console.error(
                "S-LIVE proxy-image error:",
                error
            );

            return res.status(502).end();
        }
    }
);
