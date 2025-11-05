import Notes from "../model/Notes.js";

// Add note
export const addNote = async (req, res) => {
  try {
    const { noteName, standard, pdfUrl } = req.body;
    if (!noteName || !standard || !pdfUrl) {
      return res.status(400).json({ message: "All fields required" });
    }
    const note = await Notes.create({ noteName, standard, pdfUrl });
    res.status(201).json({ message: "Note added", note });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get notes by standard
export const getNotes = async (req, res) => {
  try {
    const { standard, role } = req.query;

    if (!standard) {
      return res.status(400).json({ message: "Standard required" });
    }

    let notes;
    if (role === "admin") {
      notes = await Notes.find({ standard }).lean();
    } else {
      notes = await Notes.find({ standard }).lean();
    }

    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Update note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteName, pdfUrl } = req.body;
    if (!noteName || !pdfUrl) return res.status(400).json({ message: "Missing fields" });
    const note = await Notes.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.noteName = noteName;
    note.pdfUrl = pdfUrl;
    await note.save();
    res.json({ message: "Note updated", note });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notes.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    await note.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
