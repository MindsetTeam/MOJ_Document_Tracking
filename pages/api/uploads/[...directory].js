import nc from "next-connect";
import fs from "fs";
import path from "path";

const handler = nc();

handler.get(async (req, res) => {
  const { directory } = req.query;
  let directoryFiles = [...directory];
  if (directory[0] === "download") {
    directoryFiles.shift();
  }

  const lookupDirectoryFile = path.join(
    process.cwd(),
    "uploads",
    directoryFiles.join("/")
  );
  try {
    if (fs.existsSync(lookupDirectoryFile)) {
      const fileBuffer = fs.createReadStream(lookupDirectoryFile);
      if (directory[0] === "download") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${encodeURIComponent(
            path.parse(lookupDirectoryFile).base.replace(/-\w{5}\./, ".")
          )}`
        );
      }
      res.setHeader("Content-Type", "application/pdf");
      return await new Promise(function (resolve) {
        fileBuffer.pipe(res);
        fileBuffer.on("end", resolve);
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.status(404).json({ success: false, msg: "File not found" });
});

export default handler;
