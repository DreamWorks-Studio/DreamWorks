import express from 'express';
import upload from '../middleware/multer.middleware.js';
import { uploadImage, getPortfolioImages, deleteImage, updateImage } from '../controller/portfolio.controller.js';

const router = express.Router();

router.post('/upload', upload.single('image'), uploadImage);
router.get('/images', getPortfolioImages);
router.delete('/delete/:id', deleteImage);
router.put('/update/:id', updateImage);

export default router;


/*import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { uploadImage, getAllImages, test } from "../controller/portfolio.controller.js";

const router = express.Router();

// Fix for "__dirname" in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/"), // Adjust path if needed
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.get("/test", test);
router.post("/upload", upload.single("image"), uploadImage);
router.get("/images", getAllImages);

import express from "express";
import multer from "multer";
import { uploadImage,updateImage,deleteImage } from "../controller/portfolio.controller.js";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route for uploading an image
router.post("/upload", upload.single("image"), uploadImage);

// Route for updating an image by ID
router.put("/:id", updateImage);

// Route for deleting an image by ID
router.delete("/:id", deleteImage);





export default router; */