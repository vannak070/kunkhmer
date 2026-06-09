"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fighterRoutes_1 = __importDefault(require("./routes/fighterRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const clubRoutes_1 = __importDefault(require("./routes/clubRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const matchRoutes_1 = __importDefault(require("./routes/matchRoutes"));
const championRoutes_1 = __importDefault(require("./routes/championRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/fighters", fighterRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/clubs", clubRoutes_1.default);
app.use("/api/events", eventRoutes_1.default);
app.use("/api/matches", matchRoutes_1.default);
app.use("/api/champions", championRoutes_1.default);
app.use("/api/settings", settingRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || "Something went wrong!" });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
