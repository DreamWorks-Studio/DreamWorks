import mongoose from "mongoose";
import { response } from "express";
import Payment from "../model/payment.model.js";

export const test = (req,res) => {
    res.json({

        message : 'API  route is Working !!',
    });
};

export const createPayment = async (req, res) => {
    
    try {
        console.log('Payment endpoint hit');
        console.log('Headers:', req.headers);
        console.log('Received request body:', req.body);

        const { 
            bookingId, 
            amountPaid, 
            paymentMethod,
            paymentType,
            cardNumber,
            expiryDate,
            saveCard,
            totalAmount, 
        } = req.body;

        
        if (!bookingId || !amountPaid || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (paymentMethod === 'card') {
            if (!paymentType || !['full', 'partial'].includes(paymentType)) {
              return res.status(400).json({ message: 'Valid payment type (full/partial) is required for card payments' });
            }

            if(paymentType === 'partial' && amountPaid < 3000) {
                return res.status(400).json({ message: 'Partial payments must be at least 3000' });
            }
        }
          
        let paymentStatus;
        if (paymentMethod === 'cash') {
            paymentStatus = 'pending';
        } else if (paymentMethod === 'card') {
            paymentStatus = paymentType === 'partial' ? 'partial' : 'completed';
        }

        //calculate remaining amount for partial payment
        let remainingAmount = 0;
        if (paymentMethod === 'card' && paymentType === 'partial' && totalAmount) {
            remainingAmount = totalAmount - amountPaid;
        }

        // Only store the last 4 digits of the card number for security
        const maskedCardNumber = cardNumber ? 
            '*'.repeat(cardNumber.replace(/\s/g, '').length - 4) + 
            cardNumber.replace(/\s/g, '').slice(-4) : null;

        const existingPayment = await Payment.findOne({ bookingId, paymentStatus: 'pending' });

        if(existingPayment) {
            existingPayment.amountPaid += amountPaid;
            existingPayment.remainingAmount -= amountPaid;

            if (existingPayment.remainingAmount === 0) {
                existingPayment.paymentStatus = 'completed';
            } else {
                existingPayment.paymentStatus = 'partial';
            }

            await existingPayment.save();

            const booking = await mongoose.model('Booking').findById(bookingId);
            if (booking) {
                booking.paymentStatus = existingPayment.paymentStatus;
                if (paymentType === 'partial') {
                    booking.paidAmount = existingPayment.amountPaid;
                }
                await booking.save();
            }

            return res.status(200).json({
                message: 'Payment updated successfully',
                payment: {
                    id: existingPayment._id,
                    amountPaid: existingPayment.amountPaid,
                    paymentStatus: existingPayment.paymentStatus,
                    paymentMethod: existingPayment.paymentMethod,
                    paymentType: existingPayment.paymentType,
                }
            });

        } else {
            const payment = new Payment({
                bookingId,
                amountPaid,
                paymentMethod,
                paymentStatus,
                paymentType: paymentMethod === 'card' ? paymentType : null,
                totalAmount: totalAmount || amountPaid,
                remainingAmount,
                cardNumber: (paymentType === 'partial' && paymentMethod === 'card') ? maskedCardNumber : null,
                expiryDate: (paymentType === 'partial' && paymentMethod === 'card') ? expiryDate : null,
                isCardSaved: (paymentType === 'partial' && paymentMethod === 'card') ? (saveCard || false) : false
            });

            await payment.save();

            const booking = await mongoose.model('Booking').findById(bookingId);
            if (booking) {
                booking.paymentStatus = paymentStatus;
                if (paymentType === 'partial') {
                    booking.paidAmount = amountPaid;
                }
                await booking.save();
            }

            return res.status(201).json({
                message: 'Payment recorded successfully',
                payment: {
                    id: payment._id,
                    amountPaid: payment.amountPaid,
                    paymentStatus: payment.paymentStatus,
                    paymentMethod: payment.paymentMethod,
                    paymentType: payment.paymentType
                }
            });
        }

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Failed to process payment', error: error.message });
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
};