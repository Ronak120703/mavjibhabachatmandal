import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  memberName: {
    type: String,
    required: true,
    trim: true
  },
  drawId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
