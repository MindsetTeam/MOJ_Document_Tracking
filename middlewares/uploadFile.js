import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = `0${currentDate.getMonth() + 1}`.slice(-2);
    const currentFullDate = currentDate
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");
    const uploadDirectory = `./uploads/${currentYear}/${currentMonth}/${currentFullDate}`;
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const uuid = nanoid(5);
    const { ext, name } = path.parse(file.originalname);
    return cb(null, name + "-" + uuid + ext);
  },
});

export default multer({ storage });
