const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../database/files.json");
const UPLOADS_PATH = path.join(__dirname, "../uploads");

function safeReadDB() {
    try {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        return JSON.parse(raw || "[]");
    } catch {
        return [];
    }
}

function safeWriteDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function cleanup() {
    setInterval(() => {
        try {
            const db = safeReadDB();
            const now = Date.now();

            const validFiles = [];

            for (const file of db) {
                const expiresAt = new Date(file.expiresAt).getTime();
                const expired = Number.isNaN(expiresAt) || expiresAt < now;

                if (expired) {
                    const filePath = path.join(UPLOADS_PATH, file.filename);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Arquivo removido: ${file.filename}`);
                    }

                    continue;
                }

                validFiles.push(file);
            }

            safeWriteDB(validFiles);
            console.log("cleanup executado");
        } catch (err) {
            console.error("Erro no cleanup:", err);
        }
    }, 60 * 1000);
}

module.exports = cleanup;