import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  name: String,
  videoUrl: String,
});

const chapterSchema = new mongoose.Schema({
  chapterName: String,
  topics: [topicSchema],
});

export default mongoose.model("Std9", chapterSchema);
