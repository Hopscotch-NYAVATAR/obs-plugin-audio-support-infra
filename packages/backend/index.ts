import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import { Storage } from '@google-cloud/storage';
import express from 'express';

import { readFromEnv } from './lib/env.js';
import { registerBatchIssueAudioRecordUploadDestination } from './handlers/audioRecord/batchIssueUploadDestination.js';
import { registerExchangeIndefiniteAccessToken } from './handlers/indefiniteAccessToken/exchange.js';
import { registerIssueIndefiniteAccessToken } from './handlers/indefiniteAccessToken/issue.js';

const origin = readFromEnv('CORS_ORIGINS').split(' ');
const BASE_URL = readFromEnv('BASE_URL');
const AR_BUCKET_NAME = readFromEnv('AR_BUCKET_NAME');

const app = express();
const firebaseApp = initializeApp();
const auth = getAuth(firebaseApp);
const storage = new Storage();

registerBatchIssueAudioRecordUploadDestination(app, storage, AR_BUCKET_NAME);
registerExchangeIndefiniteAccessToken(app, auth, BASE_URL);
registerIssueIndefiniteAccessToken(app, BASE_URL, origin);

app.listen(process.env['PORT'] ?? 3000);
