import mongoose from "mongoose";
import { response } from "express";
import Payment from "../model/payment.model.js";

export const test = (req,res) => {
    res.json({

        message : 'API  route is Working !!',
    });
};

export const selectPaymentMethod = async (req, res) => {
    try {
        console.log('Select Payment Method endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        const { bookingId, paymentMethod, userId } = req.body;

        //Validate required fields
        if (!bookingId || !paymentMethod || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        //Find the booking
        const booking = await Booking.findById(bookingId).populate('user').populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        //Ensure the booking belongs to the correct user
        if (booking.user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Booking does not belong to the current user' });
        }

        //Extract package price
        const packagePrice = booking.packageId.price; // Ensure `price` exists in the Package schema
        const totalAmount = (packagePrice * 1.05) + 1000; // 
        const amountPaid = paymentMethod === 'cash' ? totalAmount : 0; // If cash, full amount is paid

        //If cash payment, complete immediately
        if (paymentMethod === 'cash') {
            const newPayment = new Payment({
                bookingId,
                userId,
                packageId: booking.packageId._id,
                packagePrice,
                amountPaid, 
                paymentMethod: 'cash',
                paymentStatus: 'paid',
                totalAmount, 
                remainingAmount: 0
            });

            await newPayment.save();
            booking.paymentStatus = 'paid';
            booking.paidAmount = totalAmount;
            await booking.save();

            return res.status(201).json({ message: 'Cash payment recorded successfully', payment: newPayment });
        }


        return res.status(200).json({
            message: 'Payment method selected successfully',
            paymentDetails: { paymentMethod, bookingId, userId },
        });

    } catch (error) {
        console.error('Error selecting payment method:', error);
        res.status(500).json({ message: 'Failed to select payment method', error: error.message });
    }
};

export const processCardPayment = async (req, res) => {
    try {
      console.log('Process Card Payment endpoint hit');
      console.log('Headers:', req.headers);
      console.log('Received request body:', req.body);
      
      const { 
        bookingId, 
        userId, 
        paymentType, 
        amountPaid,
        cardNumber,
        expiryDate,
        saveCard
      } = req.body;
      
      // Validate required fields
      if (!bookingId || !userId || !paymentType || !amountPaid || !cardNumber || !expiryDate) {
        return res.status(400).json({ message: 'Missing required payment fields' });
      }
      
      // Find the booking
      const booking = await Booking.findById(bookingId).populate('user').populate('packageId');
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      //  Ensure the booking belongs to the correct user
      if (booking.user._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Booking does not belong to the current user' });
      }
      
      // Extract package price
      const packagePrice = booking.packageId.price;
      const calculatedTotalAmount = packagePrice * 1.05 + 1000;
      
      //  Check for existing payments
      const existingPayments = await Payment.find({ bookingId });
      const totalPaidSoFar = existingPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
      const remainingBeforeThisPayment = calculatedTotalAmount - totalPaidSoFar;
      
      //  Validate payment amount
      if (parseFloat(amountPaid) > remainingBeforeThisPayment) {
        return res.status(400).json({ 
          message: 'Payment amount exceeds the remaining balance',
          remainingAmount: remainingBeforeThisPayment
        });
      }
      
      //  Validate first partial payment minimum
      if (existingPayments.length === 0 && paymentType === 'partial' && parseFloat(amountPaid) < 3000) {
        return res.status(400).json({ 
          message: 'Initial partial payment amount must be at least 3000'
        });
      }
      
      // Calculate remaining amount after this payment
      const remainingAmount = remainingBeforeThisPayment - parseFloat(amountPaid);
      
      // Determine payment status
      const paymentStatus = remainingAmount <= 0 ? 'paid' : 'partial';

      const last4Digits = cardNumber.slice(-4);
      
      // Create new payment record
      const newPayment = new Payment({
        bookingId,
        userId,
        packageId: booking.packageId._id,
        packagePrice,
        amountPaid,
        paymentMethod: 'card',
        paymentType: remainingAmount <= 0 ? 'full' : 'partial',
        paymentStatus,
        totalAmount: calculatedTotalAmount,
        remainingAmount,
        cardNumber: last4Digits,
        expiryDate,
        isCardSaved: saveCard 
      });
      
      await newPayment.save();
      
      // Update booking status
      booking.paymentStatus = paymentStatus;
      booking.paidAmount = totalPaidSoFar + parseFloat(amountPaid);
      await booking.save();
      
      // Save card for future payments if requested
      if (saveCard) {
        // Check if the card already exists
        const existingCard = await Card.findOne({ 
          userId, 
          cardNumber: last4Digits
        });
        
        if (!existingCard) {
          const userCard = new Card({
            userId,
            cardNumber: last4Digits, 
            expiryDate,
            isDefault: true
          });
          
          await userCard.save();
        }
      }
      
      return res.status(201).json({ 
        message: `${paymentStatus === 'paid' ? 'Full' : 'Partial'} card payment processed successfully`, 
        payment: {
          id: newPayment._id,
          bookingId: newPayment.bookingId,
          amountPaid: newPayment.amountPaid,
          paymentType: newPayment.paymentType,
          paymentStatus: newPayment.paymentStatus,
          remainingAmount: newPayment.remainingAmount,
          totalPaid: totalPaidSoFar + parseFloat(amountPaid)
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

        if (!bookingId || !amountPaid || !paymentType || !userId || !cardNumber || !expiryDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!['full', 'partial'].includes(paymentType)) {
            return res.status(400).json({ message: 'Invalid payment type (must be full or partial)' });
        }

        const booking = await Booking.findById(bookingId).populate('user').populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Booking does not belong to the current user' });
        }

        let existingPayment = await Payment.findOne({ bookingId });

        if (existingPayment && existingPayment.paymentStatus === 'completed') {
            return res.status(400).json({ message: 'Full payment already completed for this booking' });
        }

        let paymentStatus;
        let remainingAmount = 0;

        if (paymentType === 'partial') {
            if (amountPaid < 3000) {
                return res.status(400).json({ message: 'Partial payments must be at least 3000' });
            }
            remainingAmount = totalAmount - amountPaid;
            paymentStatus = remainingAmount === 0 ? 'completed' : 'partial';
        } else {
            remainingAmount = 0;
            paymentStatus = 'completed';
        }

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

/*export const processPayment = (req, res) => {
    console.log('Received request body:', req.body);
    const {paymentMethod} = req.body;

    console.log('Received payment method:', paymentMethod);
    console.log('Is payment method equal to "card"?', paymentMethod === 'card');

    if(paymentMethod === 'card') {
        return res.status(200).send({message: 'Payment processed successfully'});
    } else {
        return res.status(400).send({message: 'Payment failed'});
    }
}; */


export const getPayments = async (req, res) => {
    try {
      const payments = await Payment.find()
      //remove comment after bookng model is created
       /* .populate({
          path: 'bookingId',
          select: 'customer package',
          populate: [
            { path: 'customer', select: 'name email' },
            { path: 'package', select: 'title price' }
          ]
        });*/

        console.log("Payments Data: ", payments);

      const formattedPayments = payments.map(payment => ({
        bookingId: payment.bookingId,
        /*bookingId: payment.bookingId._id,
        //customer: payment.bookingId.customer ? payment.bookingId.customer.name : 'N/A',
        //package: payment.bookingId.package ? payment.bookingId.package.title : 'N/A',
        //totalAmount: payment.bookingId.package ? payment.bookingId.package.price : 0,*/
        totalAmount: payment.totalAmount || 0,
        paidAmount: payment.amountPaid || 0,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paymentType: payment.paymentType,
        remainingAmount: payment.remainingAmount,
      }));

      /*const formattedPayments = payments.map(payment => {
        return {
          bookingId: payment.bookingId || '-',
          totalAmount: payment.totalAmount || 0,
          paidAmount: payment.paidAmount || 0, // Make sure field name matches your schema
          paymentMethod: payment.paymentMethod || '-',
          paymentStatus: payment.paymentStatus || 'Pending',
          paymentType: payment.paymentType || '-',
          remainingAmount: payment.remainingAmount || 0,
        };
      });*/
  
      res.status(200).json(formattedPayments);
    } catch (error) {
      console.error('Error loading payment details:', error);
      res.status(500).json({ message: 'Failed to get details', error: error.message });
    }
};

export const generateInvoice = async (req, res) => {
    try {
        const { paymentMethod, bookingId } = req.body;
        
        const booking = await Booking.findById(bookingId)
            .populate('user')
            .populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const filename = `invoice-${bookingId}.pdf`;
        const invoiceDir = path.join(__dirname, '../public/invoices');

        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        const filePath = path.join(invoiceDir, filename);
        console.log('Invoice File Path:', filePath); 
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath); // Fixed variable name
        stream.on('error', (err) => console.error('Stream Error:', err));

        doc.pipe(stream);

        doc.fontSize(24).text('Cash Payment Invoice', { align: 'center' });
        doc.moveDown();

        doc.fillColor('#f3f4f6').roundedRect(50, doc.y, 500, 60, 5).fill();
        doc.fillColor('#000');
        doc.fontSize(12).text(
            'Please download this invoice and present it at the studio for cash payment. ' +
            'Payment terms and partial payment options can be discussed with the owner during your visit.',
            {
                width: 400,
                align: 'left', // Fixed missing string quotes
                indent: 10,
                height: 50,
                ellipsis: true,
                x: 60,
                y: doc.y + 10
            }
        );

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
        doc.text(`${booking.packageId.title}`, 60, rowY + 10); // Fixed field reference
        doc.text(`Date: ${serviceDate}`, 60, rowY + 30);
        doc.text(`Rs.${booking.packageId.price.toFixed(2)}`, 450, rowY + 20);

        const totalY = rowY + 50;
        doc.rect(50, totalY, 500, 25).stroke();
        
        const totalAmount = (booking.packageId.price * 1.05 + 1000).toFixed(2);
        doc.text('Total Amount Due:', 350, totalY + 10);
        doc.text(`Rs.${totalAmount}`, 450, totalY + 10);

        doc.moveDown(3);

        doc.fontSize(12).text('Payment Method: Cash (In-Studio)');
        doc.text('Studio Address: Your Studio Address Here');
        doc.text('Studio Hours: Mon-Sat, 9:00 AM - 6:00 PM');
        doc.text('Contact: (+94)-78-890-5678');

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

        if(!fs.existsSync(invoicePath)) {
            console.error('Invoice not found:', invoicePath);
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        const fileStream = fs.createReadStream(invoicePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error loading invoice:', error);
        res.status(500).json({ message: 'Error serving invoice file'});
    }
};