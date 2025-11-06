import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus, FaVideo, FaTimes } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChapterPage() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", videoUrl: "" });
  const [chapterId, setChapterId] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.role === "admin";
  const [editingTopic, setEditingTopic] = useState(null);

  const { chapterName } = useParams();
  const [searchParams] = useSearchParams();
  const userStandard = user?.standard;
  const [selectedStd, setSelectedStd] = useState(searchParams.get("standard") || "Std8");

  const standard = isAdmin ? selectedStd : userStandard;

  useEffect(() => {
    if (!chapterName || !standard) return;
    const fetchChapterId = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chapters/byName`, {
          params: { chapterName, standard },
        });
        setChapterId(res.data.chapter._id);
      } catch (err) {
        console.error("Failed to load chapter id:", err);
      }
    };
    fetchChapterId();
  }, [chapterName, standard]);

  useEffect(() => {
    if (!chapterId || !standard) return;
    axios
      .get(`${API_URL}/api/chapters/topics/${chapterId}`, { params: { standard } })
      .then((res) => {
        setTopics(res.data.topics);
        if (res.data.topics.length) setSelectedTopic(res.data.topics[0]);
      })
      .catch(console.error);
  }, [chapterId, standard]);

  const formChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openModalForEdit = (topic) => {
    setEditingTopic(topic);
    setForm({ name: topic.name, videoUrl: topic.videoUrl });
    setShowModal(true);
  };

  const deleteTopic = async (topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await axios.delete(`${API_URL}/api/chapters/topics/${chapterId}/${topicId}`, { params: { standard } });
      const resp = await axios.get(`${API_URL}/api/chapters/topics/${chapterId}`, { params: { standard } });
      setTopics(resp.data.topics);
      if (selectedTopic && selectedTopic._id === topicId) setSelectedTopic(null);
    } catch (err) {
      alert("Failed to delete topic");
      console.error(err);
    }
  };

  const submitTopic = async (e) => {
    e.preventDefault();
    if (!chapterId || !standard) {
      alert("Chapter or standard not set yet.");
      return;
    }
    let videoUrl = form.videoUrl;

    const driveMatch = form.videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (driveMatch) {
      const fileId = driveMatch[1];
      videoUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
      const ytMatch = form.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        const videoId = ytMatch[1];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    try {
      if (editingTopic) {
        await axios.put(`${API_URL}/api/chapters/topics/${chapterId}/${editingTopic._id}`, {
          name: form.name,
          videoUrl,
        }, { params: { standard } });
      } else {
        await axios.post(`${API_URL}/api/chapters/topics/${chapterId}`, {
          name: form.name,
          videoUrl,
        }, { params: { standard } });
      }

      setShowModal(false);
      setForm({ name: "", videoUrl: "" });
      setEditingTopic(null);
      const resp = await axios.get(`${API_URL}/api/chapters/topics/${chapterId}`, { params: { standard } });
      setTopics(resp.data.topics);
      if (!editingTopic && resp.data.topics.length) setSelectedTopic(resp.data.topics[0]);
    } catch (err) {
      alert("Failed to save topic");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen ">
      <aside className="md:w-1/4 w-full bg-white rounded-lg shadow-lg p-5 flex flex-col space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-semibold text-xl text-indigo-700 flex items-center gap-2">
            <FaVideo className="text-indigo-600" /> Topics
          </h2>
          {isAdmin && (
            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 active:scale-95 shadow-sm"
              onClick={() => {
                setEditingTopic(null);
                setForm({ name: "", videoUrl: "" });
                setShowModal(true);
              }}
            >
              <FaPlus /> Add
            </button>
          )}
        </div>

        <ul className="overflow-y-auto flex-1">
          {topics.map((t) => (
            <li key={t._id} className="mb-2">
              <button
                onClick={() => setSelectedTopic(t)}
                className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                  selectedTopic?._id === t._id
                    ? "bg-indigo-100 border-indigo-400 text-indigo-700 font-semibold"
                    : "bg-gray-50 hover:bg-indigo-50 border-transparent"
                }`}
              >
                {t.name}
              </button>
              {isAdmin && selectedTopic?._id === t._id && (
                <div className="flex justify-end mt-2 px-3 space-x-4">
                  <button
                    onClick={() => openModalForEdit(t)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteTopic(t._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        {selectedTopic && selectedTopic.videoUrl ? (
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border p-6 flex flex-col items-center transition-all hover:shadow-2xl">
            <h2 className="font-bold text-2xl text-indigo-700 mb-5 text-center">{selectedTopic.name}</h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-5 bg-black">
              <iframe
                src={selectedTopic.videoUrl}
                title={selectedTopic.name}
                allow="autoplay"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
              />
            </div>
            <a
              href={selectedTopic.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 font-medium hover:underline flex items-center gap-1"
            >
              Open video in new tab <FaVideo />
            </a>
          </div>
        ) : (
          <span className="text-gray-500 italic">Select a topic to start watching</span>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <form
            onSubmit={submitTopic}
            className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative"
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              {editingTopic ? <FaEdit /> : <FaPlus />} {editingTopic ? "Edit Topic" : "New Topic"}
            </h3>
            <input
              required
              name="name"
              value={form.name}
              onChange={formChange}
              placeholder="Topic Name"
              className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <input
              required
              name="videoUrl"
              value={form.videoUrl}
              onChange={formChange}
              placeholder="Paste video share link"
              className="border rounded-lg p-2 w-full mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95"
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
