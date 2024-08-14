import express from "express";

import { JWTHeader, JWTPayload, signJWT } from "./jwt";

const app = express();

app.post("/issueIndefiniteAccessToken", (_, res) => {
  const header = {
    alg: "ES256",
    typ: "JWT",
  } satisfies JWTHeader;

  const payload = {} satisfies JWTPayload;

  const indefiniteAccessToken = signJWT(header, payload);

  res.send(indefiniteAccessToken);
});

app.post("/audioRecordingAccessToken", (_, res) => {
  res.send("{}");
});

app.listen(process.env["PORT"] ?? 3000);
