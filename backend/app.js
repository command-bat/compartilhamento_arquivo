require("dotenv").config();

const express = require("express");
const cors = require("cors");

const fileRoutes = require("./routes/files");
const cleanup = require("./services/cleanup");

const app = express();

const PORTA = process.env.PORTA;

app.use(
    cors({
        origin: function (origin, callback) {
            const allowed = [process.env.FRONT_URL];

            if (!origin) return callback(null, true);
            if (allowed.includes(origin)) return callback(null, true);

            return callback(new Error("CORS blocked"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.use(express.json());

app.use("/", fileRoutes);

cleanup();

app.listen(PORTA, () => {
    console.log("Servidor rodando\nPorta: " + PORTA);
});