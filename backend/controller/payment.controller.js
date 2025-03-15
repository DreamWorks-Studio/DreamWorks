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

        const { bookingId, amountPaid, paymentMethod } = req.body;

        
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

        const payment = new Payment({
            bookingId,
            amountPaid,
            paymentMethod,
            paymentStatus,
            paymentType: paymentMethod === 'card' ? paymentType : null
          });

        await payment.save();
        res.status(201).json({ message: 'Payment recorded successfully', payment });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Failed to process payment', error: error.message });
    }
};

exports.processPayment = (req, res) => {
    console.log('Received request body:', req.body);
    const {paymentMethod} = req.body;

    console.log('Received payment method:', paymentMethod);
    console.log('Is payment method equal to "card"?', paymentMethod === 'card');

    if(paymentMethod === 'card') {
        return res.status(200).send({message: 'Payment processed successfully'});
    } else {
        return res.status(400).send({message: 'Payment failed'});
    }
};