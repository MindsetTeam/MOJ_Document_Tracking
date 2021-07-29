import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    username: String,
    phoneNumber: String,
    subject: String,
    department: [{ type: String }],
    note: String,
    files: [{ type: String }],
    toDepartment: [{ type: String }],
    outgoingDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model("Document", DocumentSchema);
