import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`API server listening at http://localhost:${env.port}`);
  console.log(
    "Ingestion endpoints are open; retrieval endpoints require JWT auth.",
  );
});
