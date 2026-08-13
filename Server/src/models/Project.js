import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    budget: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["Active", "Completed", "Paused", "Cancelled"], default: "Active" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

projectSchema.index({ user: 1 });

export default mongoose.model("Project", projectSchema);
