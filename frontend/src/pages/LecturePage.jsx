import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaBook, FaTimes, FaSchool } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

export default function LecturePage() {
  const navigate = useNavigate();

  const [chapters, setChapters] = useState({ Std8: [], Std9: [], Std10: [], Std11: [], Std12: [] });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editChapter, setEditChapter] = useState(null);
  const [chapterData, setChapterData] = useState({ chapterName: "", standard: "Std8" });
  const [message, setMessage] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const [selectedStd, setSelectedStd] = useState("Std8");

  useEffect(() => {
    axios.get(`${API_URL}/api/chapters`).then((res) => setChapters(res.data));
  }, []);

  const handleChange = (e) => setChapterData({ ...chapterData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isEditing && editChapter) {
        await axios.put(`${API_URL}/api/chapters/${editChapter._id}`, chapterData);
        setMessage("Chapter updated successfully");
      } else {
        await axios.post(`${API_URL}/api/chapters/add`, chapterData);
        setMessage("Chapter added successfully");
      }
      setShowForm(false);
      setIsEditing(false);
      setEditChapter(null);
      setChapterData({ chapterName: "", standard: "Std8" });
      const res = await axios.get(`${API_URL}/api/chapters`);
      setChapters(res.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (chapter, std) => {
    setShowForm(true);
    setIsEditing(true);
    setEditChapter(chapter);
    setChapterData({ chapterName: chapter.chapterName, standard: std });
    setMessage("");
  };

  const handleDelete = async (chapterId) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await axios.delete(`${API_URL}/api/chapters/${chapterId}`);
      setMessage("Chapter deleted");
      const res = await axios.get(`${API_URL}/api/chapters`);
      setChapters(res.data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-4 md:p-8  mx-auto min-h-screen ">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800 flex items-center justify-center gap-3">
        <FaSchool className="text-indigo-600" /> Course Lectures
      </h2>

      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between mb-8 max-w-4xl mx-auto px-2 gap-3">
          <div className="flex flex-wrap gap-2">
            {["Std8", "Std9", "Std10", "Std11", "Std12"].map((std) => (
              <button
                key={std}
                className={`px-5 py-2 rounded-lg font-semibold border transition-shadow duration-200 shadow-sm ${
                  selectedStd === std
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-400"
                    : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700"
                }`}
                onClick={() => setSelectedStd(std)}
                aria-label={`Select standard ${std}`}
              >
                {std}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-transform active:scale-95"
            onClick={() => {
              setShowForm(true);
              setIsEditing(false);
              setChapterData({ chapterName: "", standard: "Std8" });
              setMessage("");
            }}
            aria-label="Add Chapter"
          >
            <FaPlus /> Add Chapter
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm bg-opacity-30  p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-7 relative"
            aria-label={isEditing ? "Edit Chapter Form" : "Add Chapter Form"}
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close form"
            >
              <FaTimes />
            </button>
            <h3 className="text-indigo-700 text-xl font-bold mb-6 flex items-center gap-2">
              {isEditing ? <FaEdit /> : <FaPlus />} {isEditing ? "Edit Chapter" : "New Chapter"}
            </h3>
            <label className="block mb-1 font-semibold text-gray-700">Chapter Name</label>
            <input
              type="text"
              name="chapterName"
              value={chapterData.chapterName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none mb-5"
              placeholder="Enter chapter name"
            />
            <label className="block mb-1 font-semibold text-gray-700">Standard</label>
            <select
              name="standard"
              value={chapterData.standard}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none mb-6"
            >
              <option value="Std8">Std8</option>
              <option value="Std9">Std9</option>
              <option value="Std10">Std10</option>
              <option value="Std11">Std11</option>
              <option value="Std12">Std12</option>
            </select>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-transform active:scale-95 shadow-md"
            >
              {isEditing ? "Update Chapter" : "Add Chapter"}
            </button>
            {message && <p className="mt-4 text-center text-green-600 font-medium">{message}</p>}
          </form>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {Object.entries(chapters).map(([std, stdChapters]) => {
          if ((isAdmin && std === selectedStd) || (!isAdmin && user?.standard === std)) {
            return stdChapters.map((chapter) => (
              <div
                key={std + chapter._id}
                className="flex flex-col sm:flex-row items-center bg-white rounded-3xl shadow-lg px-6 py-5 hover:shadow-xl transition-shadow"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2 text-indigo-700 font-bold text-lg">
                    <FaBook /> {chapter.chapterName}
                  </div>
                  <div className="text-sm text-gray-500">Standard: {std}</div>
                  <div className="flex space-x-3 mt-4 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => navigate(`/lecture/${chapter.chapterName}?standard=${std}`)}
                      className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition"
                      aria-label={`Start course ${chapter.chapterName}`}
                    >
                      Start Course
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(chapter, std)}
                          className="px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition-shadow shadow"
                          aria-label={`Edit chapter ${chapter.chapterName}`}
                        >
                          <FaEdit className="inline-block mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(chapter._id)}
                          className="px-5 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-shadow shadow"
                          aria-label={`Delete chapter ${chapter.chapterName}`}
                        >
                          <FaTrash className="inline-block mr-2" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ));
          }
          return null;
        })}
      </div>
    </div>
  );
}
