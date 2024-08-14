import express from "express";

const app = express();

app.post("/audioRecordingAccessToken", (_, res) => {
  res.send("{}");
});

app.listen(process.env["PORT"] ?? 3000);
