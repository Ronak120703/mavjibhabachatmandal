import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  winnerName: {
    type: String,
    required: true,
    trim: true
  },
  goldPricePerGram: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPerMember: {
    type: Number,
    required: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Draw || mongoose.model('Draw', drawSchema);
