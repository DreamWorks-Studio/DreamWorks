import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'partial'],
        default: 'pending'
    },
    paymentType: {
        type: String,
        enum: ['full', 'partial'],
        required: function() { return this.paymentMethod === 'card'; }
    },
    totalAmount: {
        type: Number,
        required: function() { return this.paymentType === 'partial'; }
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    cardNumber: {
        type: String,
        required: function() { return this.paymentMethod === 'card'; }
    },
    expiryDate: {
        type: String,
        required: function() { return this.paymentMethod === 'card'; }
    },
    isCardSaved: {
        type: Boolean,
        default: false
    }
}, { timestamps:true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
