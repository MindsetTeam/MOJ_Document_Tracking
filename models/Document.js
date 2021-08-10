import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    username: String,
    phoneNumber: String,
    subject: String,
    number: String,
    department: [{ type: String }],
    incomeDate: Date,
    note: String,
    files: [{ type: String }],
    toDepartment: [{ type: String }],
    outgoingDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model("Document", DocumentSchema);
