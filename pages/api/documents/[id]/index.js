import nc from "next-connect";
import morgan from "morgan";
import fs from "fs";
import path from "path";

import database from "../../../../middlewares/database";
import Document from "../../../../models/Document";
import uploadFile from "../../../../middlewares/uploadFile";

const handler = nc().use(morgan("dev")).use(database);

handler.put(uploadFile.array("files"), async (req, res) => {
  // const document = await Document.findByIdAndUpdate(req.query.id, req.body, {
  //   new: true,
  // });
  console.log(req.body);
  const document = await Document.findById(req.query.id);
  if (!document) {
    return res.status(404).json({ success: false, msg: "document not found" });
  }
  const saveFileList = [...document.files];
  for (const key in req.body) {
    if (Object.hasOwnProperty.call(req.body, key)) {
      if (key == "files") continue;
      if (key === "outgoingDate" && req.body["outgoingDate"] == "null") {4
        document[key] = "";
        continue;
      }
      document[key] = req.body[key];
    }
  }
  const reqOldFiles = [...(req.body?.fileList || [])];
  saveFileList.forEach((v, i) => {
    if (!reqOldFiles.includes(v)) {
      saveFileList.splice(i, 1);
      fs.unlink(path.join(...v.split("\\")), () => {});
    }
  });
  if (req.files) {
    req.files.forEach((v) => saveFileList.push(v.path));
  }
  document.files = saveFileList;
  await document.save();
  res.status(200).json({ success: true, msg: "updated", data: document });
});

handler.delete(async (req, res) => {
  const document = await Document.findByIdAndDelete(req.query.id);
  document.files.forEach((file) => {
    fs.unlink(path.join(...file.split("\\")), () => {});
  });
  res.status(200).json({ success: true, msg: "deleted", data: {} });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
