const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { nanoid } = await import("nanoid");

const bcrypt = require("bcrypt");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

const DB_PATH =
    path.join(__dirname, "../database/files.json");

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

router.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {

        const code = nanoid(6);

        const password =
            req.body.password
                ? await bcrypt.hash(
                    req.body.password,
                    10
                )
                : null;

        const expiresAt =
            Date.now() +
            Number(req.body.expiresHours) * 3600000;

        const fileData = {
            code,
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            password,
            quickDownload:
                req.body.quickDownload === "true",
            expiresAt
        };

        const db = readDB();

        db.push(fileData);

        saveDB(db);

        res.json({
            url: `http://localhost:5173/${code}`
        });
    }
);

router.get("/file/:code", (req, res) => {

    const db = readDB();

    const file =
        db.find((f) => f.code === req.params.code);

    if (!file)
        return res.status(404).json({
            error: "Arquivo não encontrado"
        });

    if (Date.now() > file.expiresAt)
        return res.status(410).json({
            error: "Arquivo expirado"
        });

    res.json({
        originalName: file.originalName,
        sizeFormatted:
            (file.size / 1024 / 1024).toFixed(2) + " MB",
        requiresPassword: !!file.password,
        quickDownload: file.quickDownload,
        mimetype: file.mimetype
    });
});

router.get("/download/:code", async (req, res) => {

    const db = readDB();

    const file =
        db.find((f) => f.code === req.params.code);

    if (!file)
        return res.status(404).send("Não encontrado");

    if (file.password) {

        const valid =
            await bcrypt.compare(
                req.query.password || "",
                file.password
            );

        if (!valid)
            return res.status(401).send("Senha incorreta");
    }

    const filePath =
        path.join(__dirname, "../uploads", file.filename);

    res.download(filePath, file.originalName);
});

module.exports = router;