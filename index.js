import express from "express";
// import dbConnect from './utils/dbConnect.js';
import userRouter from "./routes/users.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import adminRouter from "./routes/admin.route.js";
import driverRouter from "./routes/driver.route.js";
// console.log('index.js loaded');
// dbConnect();
dotenv.config({});
var corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend's URL
  credentials: true,
};
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/driver", driverRouter);

app.get("/", (req, resp) => {
  resp.send("this is LKC app backend");
});

app.listen(3000, () => {
  console.log("app running on 3000");
});
