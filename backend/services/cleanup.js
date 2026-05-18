const fs = require("fs");
const path = require("path");

const DB_PATH =
    path.join(__dirname, "../database/files.json");

function cleanup() {

    setInterval(() => {

        const db =
            JSON.parse(fs.readFileSync(DB_PATH));

        const filtered = db.filter((file) => {

            const expired =
                Date.now() > file.expiresAt;

            if (expired) {

                const filePath =
                    path.join(
                        __dirname,
                        "../uploads",
                        file.filename
                    );

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            return !expired;
        });

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify(filtered, null, 2)
        );

    }, 60000);
}

module.exports = cleanup;