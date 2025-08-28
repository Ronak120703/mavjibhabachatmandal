import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GoldPrice from '@/models/GoldPrice';

export async function GET() {
  try {
    await connectDB();
    const goldPrice = await GoldPrice.findOne({}).sort({ createdAt: -1 });
    if (!goldPrice) {
      // Create default gold price if none exists
      const defaultPrice = await GoldPrice.create({
        pricePerGram: 6000,
        currency: 'INR'
      });
      
      // Convert _id to id for frontend compatibility
      const goldPriceWithId = {
        ...defaultPrice.toObject(),
        id: defaultPrice._id.toString(),
        _id: undefined
      };
      
      return NextResponse.json(goldPriceWithId);
    }
    
    // Convert _id to id for frontend compatibility
    const goldPriceWithId = {
      ...goldPrice.toObject(),
      id: goldPrice._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(goldPriceWithId);
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return NextResponse.json({ error: 'Failed to fetch gold price' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Delete existing gold price records
    await GoldPrice.deleteMany({});
    
    // Create new gold price record
    const goldPrice = await GoldPrice.create(body);
    
    // Convert _id to id for frontend compatibility
    const goldPriceWithId = {
      ...goldPrice.toObject(),
      id: goldPrice._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(goldPriceWithId, { status: 201 });
  } catch (error) {
    console.error('Error updating gold price:', error);
    return NextResponse.json({ error: 'Failed to update gold price' }, { status: 500 });
  }
}
