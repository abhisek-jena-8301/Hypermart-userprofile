import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors";
import session from "express-session";
import userRoutes from "./src/controller/user.controller.js";
import empRoutes from "./src/controller/employee.controller.js";

dotenv.config();

const app = express();
const corsOptions = {
  origin: ["http://localhost:3001"],
  credentials: true,
};

//Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(urlencoded({ extended: true, limit: "100mb" }));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 1000, // 60 minutes
    },
  })
);

//Routes
app.use("/user", userRoutes);
app.use("/emp", empRoutes);

//Listener
const PORT = process.env.PORT || 7712;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
