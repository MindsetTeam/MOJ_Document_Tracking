import nc from "next-connect";
import morgan from "morgan";

import database from "../../../middlewares/database";
import Document from "../../../models/Document";

const handler = nc().use(morgan("dev")).use(database);

handler.put(async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
  });
  console.log(document);
  res.status(200).json({ success: true, msg: "updated", data: document });
});

export default handler;
