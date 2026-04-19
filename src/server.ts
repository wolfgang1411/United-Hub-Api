import { app } from "./app";
import { env } from "./config/env";
import { startKeepAliveCron } from "./utils/keep-alive";

app.listen(env.port, () => {
  console.log(`API server listening at http://localhost:${env.port}`);
  console.log(
    "Ingestion endpoints are open; retrieval endpoints require JWT auth.",
  );

  // Keep the database alive
  startKeepAliveCron();
});
