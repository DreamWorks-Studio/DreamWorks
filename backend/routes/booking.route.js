//booking.route

import express from 'express';
const router = express.Router();

import { test, createBooking,getBooking,getBookedDates, getAllBookings,updateBooking, updateBookingStatus, getUserBookings, getRecentBookings} from '../controller/booking.controller.js';
import { check } from 'express-validator';

router.get('/test',test);
router.post('/add',
    [
        check('fullName').notEmpty().withMessage('Full name is required'),
        check('email').isEmail().withMessage('Valid email is required'),
        check('telephone').isLength({ min: 10 }).withMessage('Telephone number must be at least 10 characters long'),
        check('date').notEmpty().withMessage('Date is required'),
        check('time').isIn(['morning session', 'afternoon session', 'evening session']).withMessage('Time must be one of the allowed values'),
        check('location').notEmpty().withMessage('Location is required'),
        check('packageType').notEmpty().withMessage('Package type is required')
    ],createBooking);
router.get('/booked-dates', getBookedDates);  
router.get('/display-summary', getAllBookings);
router.get('/display-summary/:id', getBooking);
router.put('/update-booking/:id',
 
    [
        check('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
        check('email').optional().isEmail().withMessage('Valid email is required'),
        check('telephone').optional().isLength({ min: 10 }).withMessage('Telephone number must be at least 10 characters long'),
        check('date').optional().notEmpty().withMessage('Date is required'),
        check('location').optional().notEmpty().withMessage('Location is required'),
        check('time').optional().isIn(['morning session', 'afternoon session', 'evening session']).withMessage('Time must be one of the allowed values'),
        check('packageType').optional().notEmpty().withMessage('Package type is required'),
    ],updateBooking);
// In your booking.route.js
// In your booking.route.js
router.patch('/update-booking-status/:bookingId', updateBookingStatus);
router.get('/user-bookings/:userId', getUserBookings);
router.get('/recent-bookings', getRecentBookings);


//router.get('/user/:userId/package', getUserSelectedPackage);

export default router;