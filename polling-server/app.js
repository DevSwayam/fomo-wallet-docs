import express from "express";
import cors from "cors";
import { startPolling } from "./controllers/eventsController.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Start polling when the server starts
startPolling();

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
