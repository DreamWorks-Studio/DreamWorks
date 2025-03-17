import mongoose from "mongoose";
import { response } from "express";
import Booking from "../model/booking.model.js";

export const test = (req, res) => {
    res.json({
        message: 'API route is Working !!',
    });
};