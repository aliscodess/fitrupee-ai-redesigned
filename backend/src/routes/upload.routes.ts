import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { AppError } from '../middleware/errorHandler';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

const router = Router();
router.use(authenticate);

router.post('/avatar', upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'fitrupee/avatars', transformation: [{ width: 300, height: 300, crop: 'fill' }] },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(req.file!.buffer);
  });

  const User = (await import('../models/User')).default;
  await User.findByIdAndUpdate(req.userId, { avatar: result.secure_url });

  res.json({ success: true, data: { url: result.secure_url } });
});

export default router;
