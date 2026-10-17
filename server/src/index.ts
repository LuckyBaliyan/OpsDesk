import "dotenv/config";
import express from "express"
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.routes.js";
import workItemsRouter from "./routes/workItems.routes.js";
import teamRouter from "./routes/teams.routes.js";
import commentRouter from "./routes/comments.routes.js";
import activityRouter from "./routes/activities.routes.js";
import { startOutboxWorker } from "./workers/outbox.worker.js";
import userRouter from "./routes/users.routes.js";


const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
      res.json({
            message: "OK",
            time: new Date()
      })
});

app.use("/api", authRouter);
app.use("/api", workItemsRouter);
app.patch("/api", workItemsRouter);
app.use("/api", teamRouter);
app.use("/api", commentRouter)
app.use("/api", activityRouter);
app.use("/api", userRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Server running on port ${port}`);

      startOutboxWorker();
});

