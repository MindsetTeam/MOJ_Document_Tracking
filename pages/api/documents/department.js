import nc from "next-connect";

import database from "../../../middlewares/database";
import Document from "../../../models/Document";

const handler = nc().use(database);

handler.get(async (req, res) => {
  let reqQuery;
  let reqGroup;
  if (req.query.type === "outgoing") {
    reqQuery = [
      {
        $match: {
          toDepartment: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $project: { _id: 0, toDepartment: 1 } },
      { $unwind: "$toDepartment" },
      { $group: { _id: "$toDepartment" } },
    ];
  }
  if (req.query.type === "income") {
    reqQuery = [
      { $match: { toDepartment: { $exists: true, $size: 0 } } },
      { $project: { _id: 0, department: 1 } },
      { $unwind: "$department" },
      { $group: { _id: "$department" } },
    ];
  }
  const departments = await Document.aggregate([
    ...reqQuery,
    { $project: { _id: 0, department: "$_id" } },
    { $sort: { department: 1 } },
  ]);
  res
    .status(200)
    .json({
      success: true,
      msg: "Documents departments",
      data: departments.map((v) => v.department),
    });
});

export default handler;
