import express from "express";
import {
  getProjects,
  addProject,
  editProject,
  removeProject,
  getOneProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", getOneProject);
router.post("/", addProject);
router.put("/:id", editProject);
router.delete("/:id", removeProject);

export default router;