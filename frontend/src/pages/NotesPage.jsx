import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFilePdf,
  FaDownload,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBook,
} from "react-icons/fa";

const STANDARDS = ["Std8", "Std9", "Std10", "Std11", "Std12"];
const API_URL = import.meta.env.VITE_API_URL;

export default function NotesPage() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const userStandard = user?.standard || STANDARDS[0];

  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ noteName: "", pdfUrl: "" });
  const [standard, setStandard] = useState(isAdmin ? STANDARDS[0] : userStandard);

  useEffect(() => {
    if (!standard) return;
    axios
      .get(`${API_URL}/api/notes`, {
        params: { standard, role: isAdmin ? "admin" : "user" },
      })
      .then((res) => setNotes(res.data.notes))
      .catch(console.error);
  }, [standard, isAdmin]);

  const openModal = (note = null) => {
    setEditingNote(note);
    setForm(note ? { noteName: note.noteName, pdfUrl: note.pdfUrl } : { noteName: "", pdfUrl: "" });
    setShowModal(true);
  };

  const formChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await axios.put(`${API_URL}/api/notes/${editingNote._id}`, form);
      } else {
        await axios.post(`${API_URL}/api/notes`, { ...form, standard });
      }
      const res = await axios.get(`${API_URL}/api/notes`, { params: { standard } });
      setNotes(res.data.notes);
      setShowModal(false);
      setEditingNote(null);
    } catch {
      alert("Failed to save note");
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto  min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-800 flex items-center justify-center gap-2">
        <FaBook /> Notes
      </h2>

      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between mb-6 max-w-4xl mx-auto px-2 gap-3">
          <div className="flex flex-wrap gap-2">
            {STANDARDS.map((std) => (
              <button
                key={std}
                className={`px-5 py-2 rounded-lg font-semibold border transition-shadow duration-200 shadow-sm ${
                  standard === std
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-400"
                    : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700"
                }`}
                onClick={() => setStandard(std)}
                aria-label={`Select standard ${std}`}
              >
                {std}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-transform active:scale-95"
            onClick={() => openModal()}
            aria-label="Add Note"
          >
            <FaPlus /> Add Note
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="border rounded-xl p-5 bg-white shadow hover:shadow-lg transition flex flex-col justify-between h-full"
          >
            <div>
              <h3 className="font-semibold text-lg mb-1 break-words flex items-center gap-2">
                <FaFilePdf className="text-indigo-600 text-2xl" />
                {note.noteName}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Standard: {note.standard}
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <a
                href={note.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                <FaFilePdf className="text-indigo-600 text-lg md:text-xl" />
                View
              </a>

              <a
                href={note.pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition"
              >
                <FaDownload className="text-green-700 text-lg md:text-xl" />
                Download
              </a>

              {isAdmin && (
                <>
                  <button
                    onClick={() => openModal(note)}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                  >
                    <FaEdit className="text-blue-700 text-lg md:text-xl" />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteNote(note._id)}
                    className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition"
                  >
                    <FaTrash className="text-red-700 text-lg md:text-xl" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-2">
          <form onSubmit={submitNote} className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingNote ? "Edit Note" : "Add Note"}
            </h3>
            <input
              name="noteName"
              value={form.noteName}
              onChange={formChange}
              required
              placeholder="Note Name"
              className="border rounded p-2 w-full mb-3 focus:ring-2 focus:ring-indigo-300 outline-none"
            />
            <input
              name="pdfUrl"
              value={form.pdfUrl}
              onChange={formChange}
              required
              placeholder="PDF Link (Google Drive or Public URL)"
              className="border rounded p-2 w-full mb-3 focus:ring-2 focus:ring-indigo-300 outline-none"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
