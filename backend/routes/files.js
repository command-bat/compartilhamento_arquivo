require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
});

const DB_PATH = path.join(__dirname, "../database/files.json");
const UPLOADS_PATH = path.join(__dirname, "../uploads");

// ========================
// DB SAFE READ/WRITE
// ========================

function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) return [];
        return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch {
        return [];
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ========================
// UPLOAD
// ========================

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const code = nanoid(6);

        const password = req.body.password
            ? await bcrypt.hash(req.body.password, 10)
            : null;

        const expiresAt = req.body.expiresAt
            ? new Date(req.body.expiresAt).toISOString()
            : null;

        const fileData = {
            code,
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            password,
            quickDownload: req.body.quickDownload === "true",
            expiresAt,
        };

        const db = readDB();
        db.push(fileData);
        saveDB(db);

        res.json({
            url: process.env.FRONT_URL + `/${code}`,
        });
    } catch (err) {
        res.status(500).json({ error: "Erro no upload" });
    }
});

// ========================
// GET FILE INFO
// ========================

router.get("/file/:code", (req, res) => {
    const db = readDB();

    const file = db.find((f) => f.code === req.params.code);

    if (!file) {
        return res.status(404).json({
            error: "Arquivo não encontrado",
        });
    }

    // expiração segura
    if (
        file.expiresAt &&
        new Date(file.expiresAt).getTime() < Date.now()
    ) {
        return res.status(410).json({
            error: "Arquivo expirado",
        });
    }

    res.json({
        originalName: file.originalName,
        sizeFormatted:
            (file.size / 1024 / 1024).toFixed(2) + " MB",
        requiresPassword: !!file.password,
        quickDownload: file.quickDownload,
        mimetype: file.mimetype,
    });
});

// ========================
// DOWNLOAD
// ========================

router.get("/download/:code", async (req, res) => {
    const db = readDB();

    const file = db.find((f) => f.code === req.params.code);

    if (!file) {
        return res.status(404).send("Não encontrado");
    }

    // expiração também no download (IMPORTANTE)
    if (
        file.expiresAt &&
        new Date(file.expiresAt).getTime() < Date.now()
    ) {
        return res.status(410).send("Arquivo expirado");
    }

    // senha
    if (file.password) {
        const valid = await bcrypt.compare(
            req.query.password || "",
            file.password
        );

        if (!valid) {
            return res.status(401).send("Senha incorreta");
        }
    }

    const filePath = path.join(
        UPLOADS_PATH,
        file.filename
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Arquivo não existe no disco");
    }

    res.setHeader("Content-Length", fs.statSync(filePath).size);
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
    );
    res.setHeader("Content-Type", file.mimetype);

    fs.createReadStream(filePath).pipe(res);
});

module.exports = router;