const express = require("express");
const cors = require("cors");

const fileRoutes = require("./routes/files");

const cleanup = require("./services/cleanup");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", fileRoutes);

cleanup();

app.listen(3000, () => {
    console.log("Servidor rodando");
});