import express from "express";
import { addChapter , addTopic, deleteChapter, deleteTopic, getAllChapters, getChapterByName, getTopics, updateChapter, updateTopic } from "../controller/chapterController.js";


const router = express.Router();


router.post("/add", addChapter);
router.put("/:id", updateChapter);
router.delete("/:id", deleteChapter);
router.get("/", getAllChapters);

router.get("/topics/:chapterId", getTopics); 
router.post("/topics/:chapterId", addTopic);
router.get("/byName", getChapterByName);
router.put("/topics/:chapterId/:topicId", updateTopic);
router.delete("/topics/:chapterId/:topicId", deleteTopic);

export default router;