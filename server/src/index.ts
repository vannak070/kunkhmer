import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fighterRoutes from "./routes/fighterRoutes";
import userRoutes from "./routes/userRoutes";
import clubRoutes from "./routes/clubRoutes";
import eventRoutes from "./routes/eventRoutes";
import matchRoutes from "./routes/matchRoutes";
import championRoutes from "./routes/championRoutes";
import settingRoutes from "./routes/settingRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/fighters", fighterRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/champions", championRoutes);
app.use("/api/settings", settingRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
