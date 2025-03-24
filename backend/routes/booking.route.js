import express from 'express';
const router = express.Router();

import { test, createBooking, getBooking, getAllBookings,updateBooking } from '../controller/booking.controller.js';


router.get('/test',test);
router.post('/add',createBooking);
router.get('/display-summary', getAllBookings);
router.get('/display-summary/:id',getBooking);
router.put('/update-booking/:id',updateBooking);

export default router;
