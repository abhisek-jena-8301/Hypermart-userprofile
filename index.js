import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import userRoutes from "./src/controller/user.controller.js";
import empRoutes from "./src/controller/employee.controller.js";
import payrollRoutes from "./src/controller/payroll.controller.js";
import { createTopics, PRODUCER } from "./src/config/kafka.config.js";

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
app.use(cookieParser());
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
app.use("/payroll", payrollRoutes);

const startServer = async () => {
  try {
    await createTopics();
    await PRODUCER.connect();
    console.log("Kafka ready ✅");

    const PORT = process.env.PORT || 7711;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  try {
    await PRODUCER.disconnect();
    console.log("Kafka Producer disconnected 🔌");
  } catch (err) {
    console.error("Error during Kafka shutdown:", err);
  } finally {
    process.exit(0); // Exit cleanly
  }
});