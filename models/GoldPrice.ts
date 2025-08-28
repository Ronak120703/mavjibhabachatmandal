import mongoose from 'mongoose';

const goldPriceSchema = new mongoose.Schema({
  pricePerGram: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

export default mongoose.models.GoldPrice || mongoose.model('GoldPrice', goldPriceSchema);
