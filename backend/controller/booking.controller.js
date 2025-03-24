import mongoose from "mongoose";
import { response } from "express";
import Booking from "../model/booking.model.js";
//import User from "../model/user.model.js";
//import Package from "../model/package.model.js";

export const test = (req, res) => {
    res.json({
        message: 'API route is Working !!',
    });
};


export const createBooking = async (req, res) => {
    try {
        console.log('Booking endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        const { fullName, email, telephone, packageType, date, time, location, addson } = req.body;

        if (!fullName || !email || !telephone || !packageType || !date || !time || !location) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }


        /*const { userId, packageId, telephone, date, time, location, addson } = req.body;

        // Validate that user and package exist
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User not found' });
        }

        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return res.status(400).json({ message: 'Package not found' });
        }

        const newBooking = new Booking({
            userId,
            packageId,
            telephone,
            date,
            time,
            location,
            addson
        });*/

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

        await newBooking.save();

        return res.status(201).json({
            message: 'Booking recorded successfully',
            booking: newBooking
        });

    } catch (error) {
        console.error('Error recording booking', error);
        res.status(500).json({ message: 'Failed to record booking', error: error.message });
    }
};


export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;  // Extract booking ID from URL
        if (!id) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }

        const booking = await Booking.findById(id);  // Fetch booking from DB

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        console.log('Booking details:', booking);
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

export const updateBooking = async (req,res)=>{
    try {
    const bookingId = req.params.id;
    const { fullName, email,telephone,service,packageType,date,location,addson }= req.body;

    if (!fullName && !email && !telephone && !service && !packageType && !date && !location && !addson) {
        return res.status(400).json({ message: 'At least one field must be provided for update' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { fullName, email, telephone, service, packageType, date, location, addson },
        { new: true, runValidators: true } // Return updated booking and validate input
    ); 
    
    if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    console.log(`Booking updated successfully:`, JSON.stringify(updatedBooking, null, 2));

        return res.status(200).json({
            message: 'Booking updated successfully',
            booking: updatedBooking
        });

    /*const update = await Booking.findByIdAndUpdate(userId, updateBooking)

    return res.status(201).json({
        message: 'Booking updated successfully',
        booking: updateBooking
    });*/

    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ message: 'Failed to retrieve booking', error: error.message });
    }
}