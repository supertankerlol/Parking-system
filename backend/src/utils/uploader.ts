import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'avatars');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload file to MinIO (stub function)
 * @param file - The file object from multer
 * @returns Promise<string> - The URL or path of the uploaded file
 */
export async function uploadToMinio(file: Express.Multer.File): Promise<string> {
  // TODO: Implement MinIO upload logic
  // This is a stub that returns the local file path for now
  const filePath = path.join(UPLOADS_DIR, file.filename);
  
  // Stub implementation - replace with actual MinIO client code
  // Example:
  // const minioClient = new Minio.Client({...});
  // await minioClient.fPutObject('avatars', file.filename, filePath);
  // return `https://your-minio-endpoint/avatars/${file.filename}`;
  
  return filePath;
}
