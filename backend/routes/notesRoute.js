import express from "express";
import { addNote, getNotes, updateNote, deleteNote } from "../controller/notesController.js";

const router = express.Router();

router.post("/", addNote);
router.get("/", getNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
