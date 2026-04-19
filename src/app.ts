import express from "express";
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { ingestRouter } from "./routes/ingest.routes";
import { retrievalRouter } from "./routes/retrieval.routes";
import { errorHandler } from "./middlewares/error";

export const app = express();

app.use(express.json({ limit: "2mb" }));
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api", retrievalRouter);
app.use("/", ingestRouter);

app.use(errorHandler);
