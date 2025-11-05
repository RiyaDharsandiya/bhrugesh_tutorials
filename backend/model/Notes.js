// Model example: models/Notes.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  noteName: { type: String, required: true },
  standard: { type: String, required: true },
  pdfUrl: { type: String, required: true }, // Drive link or any PDF URL
}, { timestamps: true });

const Notes = mongoose.model("Notes", noteSchema);
export default Notes;
