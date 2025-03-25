import express from 'express';
import { test } from '../controller/package.controller.js';
import { promo, updateUser, getPackages, updatePackage, deletePackage, getPackage } from '../controller/package.controller.js';
const router = express.Router();

router.get('/test', test )
router.post('/addPackage', promo);
router.put('/update:packageId', updateUser);
router.get('/viewPackages', getPackages);
router.put('/updatePackage/:id', updatePackage);
router.delete('/deletePackage/:id', deletePackage);
router.get('/getPackage/:id', getPackage);


export default router;