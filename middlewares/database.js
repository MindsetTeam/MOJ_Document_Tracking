import mongoose from "mongoose";

let connectionStatus = 0;
const database = async (req, res, next) => {
  console.log("hit database middleware");
  if (connectionStatus) return next();
  const conn = await mongoose.connect(
    // `mongodb+srv://admin:admin@cluster0.mztev.mongodb.net/MOJ_Documents_System?retryWrites=true&w=majority`,
    `mongodb://127.0.0.1:27017/MOJ_Documents_System`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  );
  connectionStatus = conn.connection.readyState;
  next();
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default database;
