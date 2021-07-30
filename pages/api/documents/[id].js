import nc from "next-connect";
import morgan from "morgan";
import fs from "fs";
import path from "path";

import database from "../../../middlewares/database";
import Document from "../../../models/Document";

const handler = nc().use(morgan("dev")).use(database);

handler.put(async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
  });
  res.status(200).json({ success: true, msg: "updated", data: document });
});

handler.delete(async (req, res) => {
  const document = await Document.findByIdAndDelete(req.query.id);
  document.files.forEach((file) => {
    fs.unlink(path.join(...file.split("\\")), () => {});
  });
  res.status(200).json({ success: true, msg: "deleted", data: {} });
});

export default handler;
