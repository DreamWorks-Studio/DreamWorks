import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Booking from "../model/booking.model.js";
import User from "../model/user.model.js";
import Payment from '../model/payment.model.js';
import Package from "../model/package.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const test = (req, res) => {
    res.json({

        message: 'API  route is Working !!',
    });
};

export const selectPaymentMethod = async (req, res) => {
    try {
        console.log('Select Payment Method Request:', req.body);

        const { bookingId, paymentMethod, userId, packageId: frontendPackageId, packagePrice: frontendPackagePrice } = req.body;

        // Validate input
        if (!bookingId || !paymentMethod || !userId) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: {
                    bookingId: !!bookingId,
                    paymentMethod: !!paymentMethod,
                    userId: !!userId
                }
            });
        }

        // Find booking with detailed population
        const booking = await Booking.findById(bookingId)
            .populate({
                path: 'userId',
                select: '_id email'
            })
            .populate({
                path: 'packageId',
                select: 'packageType price'
            });

        console.log('Booking Debug:', {
            booking: booking ? {
                _id: booking._id,
                packageType: booking.packageType,
                populatedPackageId: booking.packageId,
                user: booking.userId?._id
            } : 'No booking found',
            frontendPackageId,
            frontendPackagePrice
        });

        // Comprehensive error checking
        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found',
                bookingId: bookingId
            });
        }

        // Verify user matches
        if (!booking.userId || booking.userId._id.toString() !== userId) {
            return res.status(403).json({
                message: 'User does not match booking owner',
                bookingUserId: booking.userId?._id?.toString(),
                requestUserId: userId
            });
        }

        // Determine package price - prioritize frontend value if provided
        let packagePrice;
        let packageType;
        let packageIdToUse;

        // First try the frontend provided value (if valid)
        if (frontendPackagePrice && !isNaN(Number(frontendPackagePrice)) && Number(frontendPackagePrice) > 0) {
            packagePrice = Number(frontendPackagePrice);
            packageIdToUse = frontendPackageId || booking.packageId;
            console.log('Using package price from frontend:', packagePrice);

            // Still need to get the package type
            if (booking.packageId && typeof booking.packageId === 'object') {
                packageType = booking.packageId.packageType;
            } else {
                // Just use the booking's packageType as fallback
                packageType = booking.packageType;
            }
        }
        // Otherwise try to get from populated booking.packageId
        else if (booking.packageId && typeof booking.packageId === 'object' && booking.packageId.price) {
            packagePrice = Number(booking.packageId.price);
            packageType = booking.packageId.packageType;
            packageIdToUse = booking.packageId._id;
            console.log('Using package price from populated packageId:', packagePrice);
        }
        // Last resort: fetch the package directly
        else {
            // Extract the actual ObjectId
            const packageObjId = booking.packageId?._id || booking.packageId;

            if (!packageObjId) {
                return res.status(404).json({
                    message: 'No packageId found in booking',
                    booking: booking
                });
            }

            const selectedPackage = await Package.findById(packageObjId);
            console.log('Fetched package directly:', selectedPackage);

            if (!selectedPackage) {
                return res.status(404).json({
                    message: 'Package not found',
                    packageId: packageObjId
                });
            }

            packagePrice = Number(selectedPackage.price);
            packageType = selectedPackage.packageType;
            packageIdToUse = selectedPackage._id;
            console.log('Using package price from fetched package:', packagePrice);
        }

        if (isNaN(packagePrice) || packagePrice <= 0) {
            return res.status(400).json({
                message: 'Invalid package price',
                packagePrice: packagePrice,
                frontendPrice: frontendPackagePrice,
                rawPackageData: booking.packageId
            });
        }

        console.log('Final valid package price found:', packagePrice);
        console.log('Package type:', packageType);
        console.log('Package ID to use:', packageIdToUse);

        const totalAmount = (packagePrice * 1.05) + 1000;
        console.log('Total amount calculated:', totalAmount);

        if (paymentMethod === 'cash') {
            const newPayment = new Payment({
                bookingId: booking._id,
                userId: userId,
                packageId: packageIdToUse,
                packagePrice: packagePrice,
                amountPaid: totalAmount,
                paymentMethod: 'cash',
                paymentType: 'full',
                paymentStatus: 'paid',
                totalAmount: totalAmount,
                remainingAmount: 0
            });

            console.log('Attempting to save cash payment:', {
                bookingId: newPayment.bookingId,
                packageId: newPayment.packageId,
                packagePrice: newPayment.packagePrice,
                amountPaid: newPayment.amountPaid,
                totalAmount: newPayment.totalAmount
            });

            await newPayment.save();

            booking.paymentStatus = 'paid';
            booking.paidAmount = totalAmount;
            await booking.save();

            return res.status(201).json({
                message: 'Cash payment recorded successfully',
                payment: newPayment
            });
        }

        // Card payment preparation
        return res.status(200).json({
            message: 'Payment method selected successfully',
            paymentDetails: {
                paymentMethod,
                bookingId,
                userId,
                packageDetails: {
                    packageType: packageType,
                    price: packagePrice
                },
                totalAmount
            },
        });

    } catch (error) {
        console.error('Detailed Payment Method Selection Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            message: 'Failed to select payment method',
            errorDetails: error.message
        });
    }
};

export const processCardPayment = async (req, res) => {
    try {
        console.log('Process Card Payment endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Request body:', JSON.stringify(req.body, null, 2)); // Pretty print the full request

        const {
            bookingId,
            userId,
            packageId, // Accept packageId directly
            packagePrice, // Accept packagePrice directly
            paymentType,
            amountPaid,
            cardNumber,
            expiryDate,
            cvc,
            saveCard,
            totalAmount,
            isRemainingPayment
        } = req.body;

        // Validate required fields
        if (!bookingId || !userId || !paymentType || !amountPaid || !cardNumber || !expiryDate) {
            return res.status(400).json({ message: 'Missing required payment fields' });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId).populate('userId').populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure the booking belongs to the correct user
        if (booking.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Booking does not belong to the current user' });
        }

        // Use the package ID from the request if provided, otherwise from the booking
        const effectivePackageId = packageId || booking.packageId?._id;
        if (!effectivePackageId) {
            console.error('Missing packageId:', {
                packageIdFromRequest: packageId,
                packageIdFromBooking: booking.packageId?._id,
                rawBooking: booking
            });
            return res.status(400).json({ message: 'Missing package ID' });
        }

        // Use the package price from the request if provided, otherwise from the booking
        let effectivePackagePrice;

        if (packagePrice && !isNaN(Number(packagePrice))) {
            // Use the price from the request
            effectivePackagePrice = Number(packagePrice);
            console.log('Using package price from request:', effectivePackagePrice);
        } else if (booking.packageId && booking.packageId.price && !isNaN(Number(booking.packageId.price))) {
            // Use the price from the populated package
            effectivePackagePrice = Number(booking.packageId.price);
            console.log('Using package price from booking.packageId:', effectivePackagePrice);
        } else {
            console.error('Cannot determine package price:', {
                requestPackagePrice: packagePrice,
                bookingPackageIdPrice: booking.packageId?.price
            });

            return res.status(400).json({
                message: 'Invalid package price',
                details: {
                    requestPackagePrice: packagePrice,
                    bookingPackageIdPrice: booking.packageId?.price
                }
            });
        }

        let calculatedTotalAmount;
        if (totalAmount && !isNaN(Number(totalAmount))) {
            calculatedTotalAmount = Number(totalAmount);
            console.log('Using total amount from request:', calculatedTotalAmount);
        } else {
            calculatedTotalAmount = effectivePackagePrice * 1.05 + 1000;
            console.log('Calculated total amount from package price:', calculatedTotalAmount);
        }

        // Check for existing payments
        const existingPayments = await Payment.find({ bookingId });
        const totalPaidSoFar = existingPayments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);
        const remainingBeforeThisPayment = calculatedTotalAmount - totalPaidSoFar;

        // Parse amountPaid as number
        const amountPaidNumber = Number(amountPaid);

        console.log('Payment validation details:', {
            calculatedTotalAmount,
            totalPaidSoFar,
            remainingBeforeThisPayment,
            amountPaidNumber,
            isRemainingPayment: isRemainingPayment || false
        });

        if (isRemainingPayment && existingPayments.length > 0) {
            // Get the original payment
            const originalPayment = existingPayments[0]; // Assuming we update the first payment

            console.log('Updating existing payment instead of creating new one:', {
                originalPaymentId: originalPayment._id,
                originalPaidAmount: originalPayment.amountPaid,
                additionalAmount: amountPaidNumber
            });

            // Update the existing payment record
            const updatedAmountPaid = Number(originalPayment.amountPaid) + amountPaidNumber;

            // Update the payment record
            originalPayment.amountPaid = updatedAmountPaid;
            originalPayment.paymentStatus = 'paid';
            originalPayment.paymentType = 'full';
            originalPayment.remainingAmount = 0;
            originalPayment.updatedAt = new Date();

            await originalPayment.save();

            // Update booking status
            booking.paymentStatus = 'paid';
            booking.paidAmount = updatedAmountPaid;
            await booking.save();

            return res.status(200).json({
                message: 'Payment updated successfully',
                payment: {
                    id: originalPayment._id,
                    bookingId: originalPayment.bookingId,
                    amountPaid: originalPayment.amountPaid,
                    paymentType: originalPayment.paymentType,
                    paymentStatus: originalPayment.paymentStatus,
                    remainingAmount: originalPayment.remainingAmount,
                    totalPaid: updatedAmountPaid
                }
            });
        }

        if (isRemainingPayment) {
            const clientProvidedRemaining = amountPaidNumber;

            if (Math.abs(clientProvidedRemaining - remainingBeforeThisPayment > 1000)) {
                console.log('Large discrepancy in remaining amount calculation:', {
                    serverCalculated: remainingBeforeThisPayment,
                    clientProvided: clientProvidedRemaining
                });

                console.log('All payment data for booking:', existingPayments);
                console.log('Package price used:', effectivePackagePrice);
            }
        } else {
            if (amountPaidNumber > remainingBeforeThisPayment) {
                return res.status(400).json({
                    message: 'Payment amount exceeds the remaining balance',
                    remainingAmount: remainingBeforeThisPayment
                });
            }

            // Validate first partial payment minimum
            if (existingPayments.length === 0 && paymentType === 'partial' && amountPaidNumber < 3000) {
                return res.status(400).json({
                    message: 'Initial partial payment amount must be at least 3000'
                });
            }
        }


        // Calculate remaining amount after this payment
        const remainingAmount = isRemainingPayment ? 0 : (calculatedTotalAmount - totalPaidSoFar - amountPaidNumber);

        // Determine payment status
        const paymentStatus = remainingAmount <= 0 ? 'paid' : 'partial';

        const last4Digits = cardNumber.slice(-4);

        // Create new payment record with all number fields explicitly converted to numbers
        const newPayment = new Payment({
            bookingId,
            userId,
            packageId: effectivePackageId,
            packagePrice: effectivePackagePrice,
            amountPaid: amountPaidNumber,
            paymentMethod: 'card',
            paymentType: remainingAmount <= 0 ? 'full' : 'partial',
            paymentStatus,
            totalAmount: Number(calculatedTotalAmount),
            remainingAmount: Number(remainingAmount),
            cardNumber: last4Digits,
            expiryDate,
            isCardSaved: saveCard || false
        });

        // Add debug logs to check values before saving
        console.log('Payment to be saved:', {
            packageId: newPayment.packageId,
            packagePrice: newPayment.packagePrice,
            totalAmount: newPayment.totalAmount,
            remainingAmount: newPayment.remainingAmount
        });

        await newPayment.save();

        // Update booking status
        booking.paymentStatus = paymentStatus;
        booking.paidAmount = totalPaidSoFar + amountPaidNumber;
        await booking.save();

        // Return success response
        return res.status(201).json({
            message: `${paymentStatus === 'paid' ? 'Full' : 'Partial'} card payment processed successfully`,
            payment: {
                id: newPayment._id,
                bookingId: newPayment.bookingId,
                amountPaid: newPayment.amountPaid,
                paymentType: newPayment.paymentType,
                paymentStatus: newPayment.paymentStatus,
                remainingAmount: newPayment.remainingAmount,
                totalPaid: totalPaidSoFar + amountPaidNumber
            }
        });

    } catch (error) {
        console.error('Error processing card payment:', error);
        res.status(500).json({
            message: 'Failed to process card payment',
            error: error.message
        });
    }
};


export const enterCardDetails = async (req, res) => {
    try {
        console.log('Enter Card Details endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        const {
            bookingId,
            amountPaid,
            paymentType,
            cardNumber,
            expiryDate,
            saveCard,
            totalAmount,
            userId
        } = req.body;

        // ✅ Validate required fields
        if (!bookingId || !amountPaid || !paymentType || !userId || !cardNumber || !expiryDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!['full', 'partial'].includes(paymentType)) {
            return res.status(400).json({ message: 'Invalid payment type (must be full or partial)' });
        }

        // ✅ Find the booking
        const booking = await Booking.findById(bookingId).populate('userId').populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // ✅ Ensure the booking belongs to the correct user
        if (booking.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Booking does not belong to the current user' });
        }

        // ✅ Check for an existing partial payment
        let existingPayment = await Payment.findOne({ bookingId });

        if (existingPayment && existingPayment.paymentStatus === 'completed') {
            return res.status(400).json({ message: 'Full payment already completed for this booking' });
        }

        let paymentStatus;
        let remainingAmount = 0;

        // ✅ Handle Partial Payment
        if (paymentType === 'partial') {
            if (amountPaid < 3000) {
                return res.status(400).json({ message: 'Partial payments must be at least 3000' });
            }
            remainingAmount = totalAmount - amountPaid;
            paymentStatus = remainingAmount === 0 ? 'completed' : 'partial';
        } else {
            // ✅ Handle Full Payment
            remainingAmount = 0;
            paymentStatus = 'completed';
        }

        // ✅ Create a new payment record with card details
        const newPayment = new Payment({
            bookingId,
            userId,
            packageId: booking.packageId._id,
            amountPaid,
            paymentMethod: 'card',
            paymentStatus,
            paymentType,
            totalAmount,
            remainingAmount,
            cardNumber,
            expiryDate,
            isCardSaved: saveCard || false,
        });

        await newPayment.save();

        // ✅ Update booking payment status
        booking.paymentStatus = paymentStatus;
        booking.paidAmount = (existingPayment ? existingPayment.amountPaid : 0) + amountPaid;
        await booking.save();

        return res.status(201).json({
            message: 'Card payment recorded successfully',
            payment: newPayment,
        });

    } catch (error) {
        console.error('Error processing card payment:', error);
        res.status(500).json({ message: 'Failed to process card payment', error: error.message });
    }
};

// Get payments only for the logged-in user
export const getPayments = async (req, res) => {
    try {
        console.log('GetPayments endpoint hit with query:', req.query);
        const { userId, bookingId } = req.query;

        // Create query based on provided parameters
        const query = {};
        if (userId) query.userId = userId;
        if (bookingId) query.bookingId = bookingId;

        if (Object.keys(query).length === 0) {
            return res.status(400).json({
                message: 'Either User ID or Booking ID is required',
                receivedParams: req.query
            });
        }

        console.log('Fetching payments with query:', query);

        // Remove the problematic populate options
        const payments = await Payment.find(query);

        console.log(`Found ${payments.length} payments`);

        // Return empty array instead of 404 for no results
        if (payments.length === 0) {
            return res.status(200).json([]);
        }

        // If booking ID is specified, return the raw payments
        if (bookingId) {
            return res.status(200).json(payments);
        }

        // For user ID requests, format the response
        const formattedPayments = payments.map(payment => ({
            bookingId: payment.bookingId,
            totalAmount: payment.totalAmount || 0,
            paidAmount: payment.amountPaid || 0,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            paymentType: payment.paymentType,
            remainingAmount: payment.remainingAmount,
        }));

        res.status(200).json(formattedPayments);
    } catch (error) {
        console.error('Error loading payment details:', error);
        res.status(500).json({
            message: 'Failed to get payment details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const generateInvoice = async (req, res) => {
    try {
        const { paymentMethod, bookingId } = req.body;

        // Find the booking with populated references
        const booking = await Booking.findById(bookingId)
            .populate('userId')
            .populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        console.log('Booking for invoice:', JSON.stringify(booking, null, 2));

        // Verify that packageId exists and has necessary properties
        if (!booking.packageId || !booking.packageId.price) {
            // Get package price from recent payment if available
            const recentPayment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });

            if (!recentPayment || !recentPayment.packagePrice) {
                return res.status(400).json({
                    message: 'Package price information not available',
                    booking: booking._id
                });
            }

            // Use the payment data to complete the invoice
            const filename = `invoice-${bookingId}.pdf`;
            const invoiceDir = path.join(__dirname, '../public/invoices');

            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            const filePath = path.join(invoiceDir, filename);
            console.log('Invoice File Path:', filePath);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            stream.on('error', (err) => console.error('Stream Error:', err));

            doc.pipe(stream);

            doc.fontSize(24).text('Cash Payment Invoice', { align: 'center' });
            doc.moveDown();
            // More space and better styling for the notice box
            doc.fillColor('#f3f4f6').roundedRect(50, doc.y, 500, 70, 5).fill();
            doc.fillColor('#000');
            doc.fontSize(12).text(
                'Please download this invoice and present it at the studio for cash payment. ' +
                'Payment terms and partial payment options can be discussed with the owner during your visit.',
                {
                    width: 480,
                    align: 'center',
                    height: 60,
                    x: 60,
                    y: doc.y + 15
                }
            );
            doc.moveDown(2);
            // Right align the date and booking ID with proper spacing
            doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
            doc.fontSize(12).text(`Booking ID: ${booking._id}`, { align: 'right' });
            doc.moveDown();
            // Better column headers with proper alignment
            doc.rect(50, doc.y, 500, 30).stroke();
            doc.fontSize(14).font('Helvetica-Bold').text('Description', 60, doc.y + 10);
            doc.text('Amount', 450, doc.y, { align: 'right', width: 90 });
            doc.font('Helvetica');
            // More space for item row and better alignment
            const rowY = doc.y + 30;
            doc.rect(50, rowY, 500, 60).stroke();
            const serviceDate = new Date(booking.date).toLocaleDateString();
            doc.fontSize(12);
            doc.text(`${booking.packageType || 'Photography Service'}`, 60, rowY + 15, { width: 350 });
            doc.text(`Date: ${serviceDate}`, 60, rowY + 35);
            // Right-aligned price with proper formatting - with safe access
            const packagePrice = recentPayment && recentPayment.packagePrice ? 
                recentPayment.packagePrice.toFixed(2) : '0.00';
            doc.text(`Rs.${packagePrice}`, 450, rowY + 25, { align: 'right', width: 90 });
            // Improved total row with better alignment
            const totalY = rowY + 60;
            doc.rect(50, totalY, 500, 40).stroke();
            doc.font('Helvetica-Bold');
            doc.fontSize(14);
            // Safe calculation of total amount
            const basePrice = recentPayment && recentPayment.packagePrice ? 
                recentPayment.packagePrice : 0;
            const totalAmount = (basePrice * 1.05 + 1000).toFixed(2);
            doc.text('Total Amount Due:', 60, totalY + 15, { align: 'right', width: 340 });
            doc.text(`Rs.${totalAmount}`, 450, totalY + 15, { align: 'right', width: 90 });
            doc.font('Helvetica');
            doc.moveDown(4);
            // Better alignment for footer information
            doc.fontSize(12);
            doc.text('Payment Method: Cash (In-Studio)', 50);
            doc.moveDown(0.5);
            doc.text('Studio Address: Your Studio Address Here', 50);
            doc.moveDown(0.5);
            doc.text('Studio Hours: Mon-Sat, 9:00 AM - 6:00 PM', 50);
            doc.moveDown(0.5);
            doc.text('Contact: (+94)-7-8-890-5678', 50);

            doc.end();

            stream.on('finish', () => {
                const invoiceUrl = `api/payments/invoices/${filename}`;
                res.json({
                    success: true,
                    filename,
                    invoiceUrl
                });
            });

            return;
        }

        // If we get here, we have valid package data in the booking
        const filename = `invoice-${bookingId}.pdf`;
        const invoiceDir = path.join(__dirname, '../public/invoices');

        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const filePath = path.join(invoiceDir, filename);
        console.log('Invoice File Path:', filePath);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        stream.on('error', (err) => console.error('Stream Error:', err));

        doc.pipe(stream);

        // Better layout for the header section
        doc.fontSize(24).text('Cash Payment Invoice', { align: 'center' });
        doc.moveDown();

        // More space and better styling for the notice box
        doc.fillColor('#f3f4f6').roundedRect(50, doc.y, 500, 70, 5).fill();
        doc.fillColor('#000');
        doc.fontSize(12).text(
            'Please download this invoice and present it at the studio for cash payment. ' +
            'Payment terms and partial payment options can be discussed with the owner during your visit.',
            {
                width: 480,
                align: 'center',
                height: 60,
                x: 60,
                y: doc.y + 15
            }
        );

        doc.moveDown(2);

        // Right align the date and booking ID with proper spacing
        doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.fontSize(12).text(`Booking ID: ${booking._id}`, { align: 'right' });

        doc.moveDown();

        // Better column headers with proper alignment
        doc.rect(50, doc.y, 500, 30).stroke();
        doc.fontSize(14).font('Helvetica-Bold').text('Description', 60, doc.y + 10);
        doc.text('Amount', 450, doc.y, { align: 'right', width: 90 });
        doc.font('Helvetica');

        // More space for item row and better alignment
        const rowY = doc.y + 30;
        doc.rect(50, rowY, 500, 60).stroke();

        const serviceDate = new Date(booking.date).toLocaleDateString();
        doc.fontSize(12);
        doc.text(`${booking.packageId && booking.packageId.packageType || 'Photography Service'}`, 60, rowY + 15, { width: 350 });
        doc.text(`Date: ${serviceDate}`, 60, rowY + 35);

        // Right-aligned price with proper formatting - with safe access
        const packagePrice = booking.packageId && booking.packageId.price ? 
            booking.packageId.price.toFixed(2) : '0.00';
        doc.text(`Rs.${packagePrice}`, 450, rowY + 25, { align: 'right', width: 90 });

        // Improved total row with better alignment
        const totalY = rowY + 60;
        doc.rect(50, totalY, 500, 40).stroke();
        doc.font('Helvetica-Bold');
        doc.fontSize(14);
        
        // Safe calculation of total amount
        const basePrice = booking.packageId && booking.packageId.price ? 
            booking.packageId.price : 0;
        const totalAmount = (basePrice * 1.05 + 1000).toFixed(2);
        
        doc.text('Total Amount Due:', 60, totalY + 15, { align: 'right', width: 340 });
        doc.text(`Rs.${totalAmount}`, 450, totalY + 15, { align: 'right', width: 90 });
        doc.font('Helvetica');

        doc.moveDown(4);

        // Better alignment for footer information
        doc.fontSize(12);
        doc.text('Payment Method: Cash (In-Studio)', 50);
        doc.moveDown(0.5);
        doc.text('Studio Address: Your Studio Address Here', 50);
        doc.moveDown(0.5);
        doc.text('Studio Hours: Mon-Sat, 9:00 AM - 6:00 PM', 50);
        doc.moveDown(0.5);
        doc.text('Contact: (+94)-7-8-890-5678', 50);

        doc.end();

        stream.on('finish', () => {
            const invoiceUrl = `api/payments/invoices/${filename}`;
            res.json({
                success: true,
                filename,
                invoiceUrl
            });
        });

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
    }
};

export const getInvoice = (req, res) => {
    try {
        const { filename } = req.params;
        const invoicePath = path.join(__dirname, '../public/invoices', filename);

        if (!fs.existsSync(invoicePath)) {
            console.error('Invoice not found:', invoicePath);
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        const fileStream = fs.createReadStream(invoicePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error loading invoice:', error);
        res.status(500).json({ message: 'Error serving invoice file' });
    }
};

export const onSubmit = (req, res) => {
    // In the onSubmit function, replace this part:
    if (data.saveCard) {
        // Get the current user ID from the authentication system
        // This could be from a context, state, or cookie
        const currentUser = auth.currentUser; // Adjust based on your auth system

        axios.post('http://localhost:5004/api/saveCard', {
            userId: currentUser?.id, // Use optional chaining to prevent errors
            cardDetails: {
                cardNumber: data.cardNumber,
                expiry: data.expiry,
                cvc: data.cvc,
            },
        })
            .then(response => {
                console.log('Card saved successfully:', response);
            })
            .catch(error => {
                console.error('Error saving card:', error);
            });
    }
};

export const processPayment = (req, res) => {
    console.log('Received request body:', req.body);
    const { paymentMethod } = req.body;

    console.log('Received payment method:', paymentMethod);
    console.log('Is payment method equal to "card"?', paymentMethod === 'card');

    if (paymentMethod === 'card') {
        return res.status(200).send({ message: 'Payment processed successfully' });
    } else {
        return res.status(400).send({ message: 'Payment failed' });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('bookingId')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        consoler.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Failed to get payments', error: error.message });
    }
    /* try {
         const payments = await Payment.find().populate({
             path: 'bookingId',
             select: 'fullName packageType' // Selecting only the required fields
         });
 
         if (!payments.length) {
             return res.status(404).json({ message: 'No payments found' });
         }
 
         return res.status(200).json(payments);
     } catch (error) {
         console.error('Error loading payments:', error);
         res.status(500).json({ message: 'Failed to get payments', error: error.message });
     } */
};


/*export const getAllPayments = async (req, res) => {
    try {
      const payments = await Payment.find()
      //remove comment after bookng model is created
       .populate({
          path: 'bookingId',
          select: 'customer package',
          populate: [
            { path: 'customer', select: 'name email' },
            { path: 'package', select: 'title price' }
          ]
        });

        console.log("Payments Data: ", payments);

      const formattedPayments = payments.map(payment => ({
        bookingId: payment.bookingId,
        bookingId: payment.bookingId._id,
        customer: payment.bookingId.customer ? payment.bookingId.customer.name : 'N/A',
        package: payment.bookingId.package ? payment.bookingId.package.title : 'N/A',
        totalAmount: payment.bookingId.package ? payment.bookingId.package.price : 0,
        totalAmount: payment.totalAmount || 0,
        paidAmount: payment.amountPaid || 0,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paymentType: payment.paymentType,
        remainingAmount: payment.remainingAmount,
      }));

      const formattedPayments = payments.map(payment => {
        return {
          bookingId: payment.bookingId || '-',
          totalAmount: payment.totalAmount || 0,
          paidAmount: payment.paidAmount || 0, // Make sure field name matches your schema
          paymentMethod: payment.paymentMethod || '-',
          paymentStatus: payment.paymentStatus || 'Pending',
          paymentType: payment.paymentType || '-',
          remainingAmount: payment.remainingAmount || 0,
        };
      });
  
      res.status(200).json(formattedPayments);
    } catch (error) {
      console.error('Error loading payment details:', error);
      res.status(500).json({ message: 'Failed to get details', error: error.message });
    }
};*?

/*export const generateInvoice = async (req, res) => {
    try {
       const { paymentMethod, bookingId } = req.body;
       const booking = await Booking.findById(bookingId)
           .populate('user')
           .populate('package'); 

       if(!booking) {
        return res.status(404).json({ message: 'Booking not found' });
       }

       const filename = `invoice-${bookingId}.pdf`;

       const invoiceDir = path.join(__dirname, '../public/invoices');
       if(!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive:true });
       }

       const filePath = path.join(invoiceDir, filename);

       const doc = new PDFDocument();
       const stream = fs.createWriteStream(filepath);

       doc.pipe(stream);

       doc.fontSize(24).text('Cash Payment Invoice', { align: 'center' });
       doc.moveDown();

       doc.fillColor('#f3f4f6').roundedRect(50, doc.y, 500, 60, 5).fill();
       doc.fillColor('#000');
       doc.fontSize(12).text('Please download this invoice and present it at the studio for cash payment. Payment terms and partial payment options can be discussed with the owner during your visit.', {
        width: 400,
        align: left,
        indent: 10,
        height: 50,
        ellipsis: true,
        x: 60,
        y: doc.y + 10
       });

       doc.moveDown(2);

       doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
       doc.fontSize(12).text(`Booking ID: ${booking._id}`, { align: 'right' });

       doc.moveDown();

       doc.rect(50, doc.y, 500, 25).stroke();
       doc.fontSize(12).text('Description', 60, doc.y + 10);
       doc.text('Amount', 450, doc.y - 2);

       const rowY = doc.y + 25;
        doc.rect(50, rowY, 500, 50).stroke();
        
        const serviceDate = new Date(booking.date).toLocaleDateString();
        doc.text(`${booking.package.name}`, 60, rowY + 10);
        doc.text(`Date: ${serviceDate}`, 60, rowY + 30);
        doc.text(`Rs.${booking.package.price.toFixed(2)}`, 450, rowY + 20);

        const totalY = rowY + 50;
        doc.rect(50, totalY, 500, 25).stroke();
        
        const totalAmount = (booking.package.price * 1.05 + 1000).toFixed(2);
        doc.text('Total Amount Due:', 350, totalY + 10);
        doc.text(`Rs.${totalAmount}`, 450, totalY + 10);

        doc.moveDown(3);

        doc.fontSize(12).text('Payment Method: Cash (In-Studio)');
        doc.text('Studio Address: Your Studio Address Here');
        doc.text('Studio Hours: Mon-Sat, 9:00 AM - 6:00 PM');
        doc.text('Contact: (+94)-78-890-5678');

        doc.end();

        stream.on('finish', () => {
            const invoiceUrl = `/invoices/${filename}`;
            res.json({ invoiceUrl });
        });

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
    }
}; */