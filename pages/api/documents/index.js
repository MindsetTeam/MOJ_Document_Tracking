import nc from "next-connect";
import multer from "multer";
import morgan from "morgan";
import path from 'path';
import database from "../../../middlewares/database";
import Document from "../../../models/Document";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../../public/file-uploads");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.originalname
      // file.originalname + nanoid(7) + path.parse(file.originalname).ext
    );
  },
});
const upload = multer({ storage });

const handler = nc().use(morgan("dev")).use(database);
handler.get(async (req, res) => {
  console.log(req.query);
  let reqQuery;
  if (req.query.income != "true") {
    reqQuery = { toDepartment: { $exists: true, $not: { $size: 0 } } };
  } else {
    reqQuery = { toDepartment: { $exists: true, $size: 0 } };
  }
  const data = await Document.find(reqQuery);
  res.status(200).json({ success: true, msg: "Query Documents", data });
});
handler.post(upload.array("files"), async (req, res) => {
  console.log(req.files, req.body);
  const files = req.files.map((v) => v.path);
  const saveData = { ...req.body, files };
  const document = await Document.create(saveData);
  res.status(200).json({ success: true, msg: "Created", data: document });
});

export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
