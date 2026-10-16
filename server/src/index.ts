import "dotenv/config";
import express from "express"
import cors from "cors";
import {PrismaClient} from "@prisma/client";
import authRouter from "./routes/auth.routes.js";
import workItemsRouter from "./routes/workItems.routes.js";

//dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res)=>{
      res.json({
            message:"OK",
            time: new Date()
      })
});

app.use("/api", authRouter);
app.use("/api", workItemsRouter);
app.patch("/api", workItemsRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Server running on port ${port}`);
});

