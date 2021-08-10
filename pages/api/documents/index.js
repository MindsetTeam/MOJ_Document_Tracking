import nc from "next-connect";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import database from "../../../middlewares/database";
import Document from "../../../models/Document";
import escapeRegExp from "../../../lib/escapeReg";

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
const upload = multer({ storage });

const handler = nc().use(morgan("dev")).use(database);
handler.get(async (req, res) => {
  console.log(req.query);
  try {
    let query;
    let reqQuery = { ...req.query };
    const removeFields = [
      "search",
      "income",
      "select",
      "sort",
      "limit",
      "page",
      "department",
      "date",
      "type",
    ];
    removeFields.forEach((v) => {
      delete reqQuery[v];
    });
    if (req.query.type === "outgoing") {
      reqQuery = {
        toDepartment: { $exists: true, $not: { $size: 0 } },
        ...reqQuery,
      };
    }
    if (req.query.type === "income") {
      reqQuery = { toDepartment: { $exists: true, $size: 0 }, ...reqQuery };
    }

    let queryString = JSON.parse(
      JSON.stringify(reqQuery).replace(
        /\b(in|gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );

    if (req.query.search) {
      const regSearch = new RegExp(
        `${escapeRegExp(req.query.search).trim().split(" ").join("|")}`,
        "i"
      );
      const searchFields = [
        "subject",
        "number",
        "note",
        "username",
        "phoneNumber",
        "files",
      ];
      queryString = {
        $or: [
          ...searchFields.map((v) => ({ [v]: regSearch })),
          // { files: { $in: [regSearch] } },
        ],
        ...queryString,
      };
    }
    if (req.query.department) {
      let queryDepartment;
      if (Array.isArray(req.query.department)) {
        queryDepartment = {
          $in: req.query.department,
        };
      } else {
        queryDepartment = req.query.department;
      }
      queryString = {
        ...queryString,
        ...(req.query.type === "income"
          ? { department: queryDepartment }
          : req.query.type === "outgoing"
          ? { toDepartment: queryDepartment }
          : {}),
      };
    }

    if (req.query.date) {
      let queryCreatedAt;
      if (Array.isArray(req.query.date)) {
        const [startDate, endDate] = req.query.date;
        queryCreatedAt = {
          $gt: startDate,
          $lt: endDate,
        };
        queryString = {
          ...queryString,
          ...(req.query.type === "income"
            ? { createdAt: queryCreatedAt }
            : req.query.type === "outgoing"
            ? { outgoingDate: queryCreatedAt }
            : {}),
        };
      }
    }
    query = Document.find(queryString);

    if (req.query.select) {
      query.select(req.query.select.split(","));
    }
    if (req.query.sort) {
      query.sort(req.query.sort.split(",").join(""));
    } else {
      query.sort("-createdAt");
    }

    let limit = +req.query.limit ||10;
    let page = +req.query.page ||1;
    let startIndex = (page-1)*limit;
    
    const data = await query.skip(startIndex).limit(limit);
    const totalResults = await Document.countDocuments(queryString);
    return res
      .status(200)
      .json({
        success: true,
        msg: "Query Documents",
        data,
        total: totalResults,
      });
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({ success: true, msg: "Query Documents", data });
});
handler.post(upload.array("files"), async (req, res) => {
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
