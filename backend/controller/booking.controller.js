
import mongoose from "mongoose";
import { response } from "express";
import Booking from "../model/booking.model.js";
import { validationResult } from 'express-validator';
//import User from "../model/user.model.js";
//import Package from "../model/package.model.js";

export const test = (req, res) => {
    res.json({
        message: 'API route is Working !!',
    });
};

export const createBooking = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('Booking endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        const { fullName, email, telephone, date, time, location, addsOn, packageType } = req.body;

        // ✅ Check if all required fields are provided (except fullName and email which will be auto-filled)
        if (!fullName || !email || !telephone || !date || !time || !location || !packageType) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // ✅ Validate that the user exists and fetch fullName and email
        /*const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }*/

        //const { fullName, email } = userExists; // Auto-fill these fields

        // ✅ Validate that the package exists
        /*const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }:*/
       // ✅ Validate that the 'time' value is correct
       const allowedTimeValues = ['morning session', 'afternoon session', 'evening session'];
       if (!allowedTimeValues.includes(time)) {
           return res.status(400).json({ message: `Invalid time. Allowed values are ${allowedTimeValues.join(', ')}` });
       }

       // ✅ Create a new booking without `userId`
       const newBooking = new Booking({
           fullName,
           email,
           telephone,
           packageType,
           date,
           time,
           location,
           addson: addsOn, // Fix field name mismatch
       });

       await newBooking.save();

       return res.status(201).json({
           message: 'Booking recorded successfully',
           booking: newBooking
       });

   } catch (error) {
       console.error('Error recording booking:', error);
       res.status(500).json({ message: 'Failed to record booking', error: error.message });
   }
};



/*export const createBooking = async (req, res) => {
    try {
        console.log('Booking endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        // Extract data from request body with proper field mapping
        const {
            fullName,
            email,
            telephone,
            location,
            service, // Not in your model but in your form
            date,
            time,
            packageType, // Map 'package' from form to 'packageType' in model
            addson // Map 'addsOn' from form to 'addson' in model
        } = req.body;

        console.log('Processed data:', {
            fullName,
            email,
            telephone,
            packageType,
            date,
            time,
            location,
            addson
        });

        // Validate required fields
        if (!fullName || !email || !telephone || !packageType || !date || !time || !location) {
            return res.status(400).json({ 
                message: 'All required fields must be provided',
                missingFields: {
                    fullName: !fullName,
                    email: !email,
                    telephone: !telephone,
                    packageType: !packageType,
                    date: !date,
                    time: !time,
                    location: !location
                }
            });
        }

        // Create new booking with correctly mapped fields
        const newBooking = new Booking({
            fullName,
            email,
            telephone,
            packageType,
            date,
            time,
            location,
            addson
        });

        console.log('Attempting to save booking...');
        const savedBooking = await newBooking.save();

        return res.status(201).json({
            message: 'Booking recorded successfully',
            booking: savedBooking
        });

    } catch (error) {
        console.error('Error recording booking', error);
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ 
                message: 'Validation error', 
                validationErrors: error.errors 
            });
        }
        res.status(500).json({ message: 'Failed to record booking', error: error.message });
    }
};*/


export const getBooking = async (req, res) => {
    try {
        const { id } = req.params; // Extract booking ID from URL
        if (!id) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }

        const booking = await Booking.findById(id); // Fetch booking from DB
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        return res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Failed to retrieve booking', error: error.message });
    }
};


export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find(); // Fetch all bookings
        if (!bookings.length) {
            return res.status(404).json({ message: 'No bookings found' });
        }
        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Failed to retrieve bookings', error: error.message });
    }
};

export const updateBooking = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const bookingId = req.params.id;
        console.log("Attempting to update booking with ID:", bookingId); // Add logging

        const { fullName, email, telephone, packageType, date, location, addson, time } = req.body;

        if (!fullName && !email && !telephone && !packageType && !date && !location && !addson) {
            return res.status(400).json({ message: 'At least one field must be provided for update' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { fullName, email, telephone, packageType, date, location, addson, time },
            { new: true, runValidators: true } // Return updated booking and validate input
        );

        if (!updatedBooking) {
            console.log("No booking found with ID:", bookingId);
            return res.status(404).json({ message: 'Booking not found' });
        }

        console.log(`Booking updated successfully:`, JSON.stringify(updatedBooking, null, 2));

        return res.status(200).json({
            message: 'Booking updated successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        return res.status(500).json({ message: 'Error updating booking', error: error.message });
    }
};

// In your booking.controller.js

// Update booking status
// In your booking.controller.js
export const updateBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        // Store the previous status before updating
        const previousStatus = booking.status;

        // Update the booking with the new status and store the previous status
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status, previousStatus }, 
            { new: true }  // Return the updated booking
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking status updated", booking: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating booking status", error });
    }
};

export const undoBookingStatus = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);

        // If there is no previous status, do not update
        if (!booking.previousStatus) {
            return res.status(400).json({ message: "No previous status to undo." });
        }

        // Revert to the previous status
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: booking.previousStatus, previousStatus: null }, 
            { new: true }  // Return the updated booking
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking status reverted", booking: updatedBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error undoing booking status", error });
    }
};

export const getBookedDates = async (req, res) => {
    try {
        const bookings = await Booking.find({}, "date"); // Fetch only the 'date' field
        const bookedDates = bookings.map(booking => booking.date);
        res.status(200).json(bookedDates);
    } catch (error) {
        console.error("Error fetching booked dates:", error);
        res.status(500).json({ message: "Failed to retrieve booked dates", error: error.message });
    }
};


    /*const update = await Booking.findByIdAndUpdate(userId, updateBooking)

    return res.status(201).json({
        message: 'Booking updated successfully',
        booking: updateBooking
    });*/

