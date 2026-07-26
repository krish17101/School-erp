import { extname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from './env.js';
import { AppError } from '../utils/app-error.js';

const uploadDirectory = resolve(env.UPLOAD_PATH);
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

mkdirSync(uploadDirectory, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadDirectory),
    filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(400, 'Unsupported upload type.', 'VAL_001'));
      return;
    }

    callback(null, true);
  },
});
