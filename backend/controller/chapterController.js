import Std8 from "../model/Std8.js";
import Std9 from "../model/Std9.js";
import Std10 from "../model/Std10.js";
import Std11 from "../model/Std11.js";
import Std12 from "../model/Std12.js";


// Helper to choose model based on standard string
const getModelByStandard = (standard) => {
  if (standard === "Std8") return Std8;
  if (standard === "Std9") return Std9;
  if (standard === "Std10") return Std10;
  if (standard === "Std11") return Std11;
  if (standard === "Std12") return Std12;
  throw new Error("Invalid standard");
};


export const addChapter = async (req, res) => {
  try {
    const { chapterName, standard } = req.body;
    if (!chapterName || !standard) {
      return res.status(400).json({ message: "Chapter name and standard required." });
    }


    const Model = getModelByStandard(standard);


    // Check if chapter already exists
    const existing = await Model.findOne({ chapterName });
    if (existing) {
      return res.status(400).json({ message: "Chapter already exists for this standard." });
    }


    // Create chapter
    const chapterDoc = await Model.create({ chapterName, topics: [] });


    res.status(201).json({ message: "Chapter added", chapter: chapterDoc });
  } catch (err) {
    console.error("Add chapter error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterName, standard } = req.body;


    if (!chapterName || !standard) {
      return res.status(400).json({ message: "Chapter name and standard required." });
    }


    // Function to find chapter by ID across all standards
    const standards = ["Std8", "Std9", "Std10","Std11","Std12"];
    let oldChapter = null;
    let oldStandard = null;


    for (const std of standards) {
      const Model = getModelByStandard(std);
      const found = await Model.findById(id);
      if (found) {
        oldChapter = found;
        oldStandard = std;
        break;
      }
    }


    if (!oldChapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }


    if (oldStandard === standard) {
      // Same standard - just update chapter name
      oldChapter.chapterName = chapterName;
      await oldChapter.save();
      res.json({ message: "Chapter updated", chapter: oldChapter });
    } else {
      // Different standard - move chapter


      // Delete from old standard collection
      const OldModel = getModelByStandard(oldStandard);
      await OldModel.findByIdAndDelete(id);


      // Create new chapter in new standard collection
      const NewModel = getModelByStandard(standard);
      const newChapter = new NewModel({ chapterName, standard });
      await newChapter.save();


      res.json({ message: "Chapter moved and updated", chapter: newChapter });
    }
  } catch (err) {
    console.error("Update chapter error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Delete chapter (by ID)
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    // Check which model contains this chapter id
    const checkInModel = async (Model) => {
      const doc = await Model.findById(id);
      if (doc) {
        await Model.findByIdAndDelete(id);
        return true;
      }
      return false;
    };
    // Check and delete across all standards
    if (
      await checkInModel(Std8) ||
      await checkInModel(Std9) ||
      await checkInModel(Std10) ||
      await checkInModel(Std11) ||
      await checkInModel(Std12)
    ) {
      return res.status(204).send();
    }
    res.status(404).json({ message: "Chapter not found" });
  } catch (err) {
    console.error("Delete chapter error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Endpoint to fetch all chapters for all standards aggregated
export const getAllChapters = async (req, res) => {
  try {
    const std8 = await Std8.find({}, "chapterName").lean();
    const std9 = await Std9.find({}, "chapterName").lean();
    const std10 = await Std10.find({}, "chapterName").lean();
    const std11 = await Std11.find({}, "chapterName").lean();
    const std12 = await Std12.find({}, "chapterName").lean();
    res.json({
      Std8: std8,
      Std9: std9,
      Std10: std10,
      Std11: std11, 
      Std12: std12
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopics = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { standard } = req.query;
    const Model = getModelByStandard(standard);
    const chapter = await Model.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json({ topics: chapter.topics });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addTopic = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { name, videoUrl } = req.body;
    const { standard } = req.query;
    if (!name || !videoUrl) return res.status(400).json({ message: "Missing fields" });
    const Model = getModelByStandard(standard);
    const chapter = await Model.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    chapter.topics.push({ name, videoUrl });
    await chapter.save();
    res.status(201).json({ message: "Topic added", topics: chapter.topics });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getChapterByName = async (req, res) => {
  try {
    const { chapterName, standard } = req.query;
    if (!chapterName || !standard) {
      return res.status(400).json({ message: "Chapter name and standard required." });
    }
    const Model = getModelByStandard(standard);
    const chapter = await Model.findOne({ chapterName });
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.json({ chapter });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadVideo = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  // req.file.path is the Cloudinary public URL
  res.json({ videoUrl: req.file.path });
};

export const updateTopic = async (req, res) => {
  try {
    const { chapterId, topicId } = req.params;
    const { name, videoUrl } = req.body;
    const { standard } = req.query;

    if (!name || !videoUrl) return res.status(400).json({ message: "Missing fields" });

    const Model = getModelByStandard(standard);
    const chapter = await Model.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const topic = chapter.topics.id(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.name = name;
    topic.videoUrl = videoUrl;
    await chapter.save();

    res.json({ message: "Topic updated", topics: chapter.topics });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { chapterId, topicId } = req.params;
    const { standard } = req.query;

    const Model = getModelByStandard(standard);
    const chapter = await Model.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    // Find the subdocument
    const topic = chapter.topics.id(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    // Use deleteOne() on subdocument
    await topic.deleteOne();

    // Save the parent document
    await chapter.save();

    res.status(204).send(); // Success - no content
  } catch (err) {
    console.error("Delete topic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


