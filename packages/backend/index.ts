import { getAuth } from 'firebase-admin/auth';
import { Storage } from '@google-cloud/storage';
import express from 'express';

import { readFromEnv } from './lib/env.js';
import { registerAudioRecordUploadDestinationBatchIssue } from './handlers/audioRecord/uploadDestinationBatchIssue.js';
import { registerIndefiniteAccessTokenExchange } from './handlers/indefiniteAccessToken/exchange.js';
import { registerIndefiniteAccessTokenIssue } from './handlers/indefiniteAccessToken/issue.js';

const origin = readFromEnv('CORS_ORIGINS').split(' ');
const BASE_URL = readFromEnv('BASE_URL');
const AR_BUCKET_NAME = readFromEnv('AR_BUCKET_NAME');

const app = express();
const auth = getAuth();
const storage = new Storage();

registerIndefiniteAccessTokenIssue(app, BASE_URL, origin);
registerIndefiniteAccessTokenExchange(app, auth);
registerAudioRecordUploadDestinationBatchIssue(app, storage, AR_BUCKET_NAME);

app.listen(process.env['PORT'] ?? 3000);
