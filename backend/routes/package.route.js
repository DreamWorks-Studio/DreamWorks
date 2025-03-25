import express from 'express';
import { test } from '../controllers/package.controller.js';
import { updateUser } from '../controllers/package.controller.js';
const router = express.Router();

router.get('/test', test )
router.put('/update:packageId', updateUser);

export default router;