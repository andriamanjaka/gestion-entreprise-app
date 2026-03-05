import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import employeRoutes from "./routes/employeRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/employes', employeRoutes);

app.use("/api/projects", projectRoutes);
app.get("/", (req, res) => {
  res.send("API Backend OK");
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server lancé sur http://localhost:${process.env.PORT}`);
});


