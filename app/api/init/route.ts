import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import GoldPrice from '@/models/GoldPrice';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if members already exist
    const existingMembers = await Member.countDocuments();
    if (existingMembers > 0) {
      return NextResponse.json({ 
        message: 'Data already initialized',
        membersCount: existingMembers 
      });
    }

    // Add sample members
    const sampleMembers = [
      { name: 'Rajesh Patel', phone: '+91 9876543210', email: 'rajesh@example.com', isActive: true },
      { name: 'Priya Shah', phone: '+91 9876543211', email: 'priya@example.com', isActive: true },
      { name: 'Amit Kumar', phone: '+91 9876543212', email: 'amit@example.com', isActive: true },
      { name: 'Neha Singh', phone: '+91 9876543213', email: 'neha@example.com', isActive: true },
      { name: 'Vikram Mehta', phone: '+91 9876543214', email: 'vikram@example.com', isActive: true },
      { name: 'Anjali Desai', phone: '+91 9876543215', email: 'anjali@example.com', isActive: true },
      { name: 'Suresh Reddy', phone: '+91 9876543216', email: 'suresh@example.com', isActive: true },
      { name: 'Kavita Sharma', phone: '+91 9876543217', email: 'kavita@example.com', isActive: true },
      { name: 'Rahul Gupta', phone: '+91 9876543218', email: 'rahul@example.com', isActive: true },
      { name: 'Pooja Verma', phone: '+91 9876543219', email: 'pooja@example.com', isActive: true },
    ];

    await Member.insertMany(sampleMembers);

    // Add default gold price if not exists
    const existingGoldPrice = await GoldPrice.countDocuments();
    if (existingGoldPrice === 0) {
      await GoldPrice.create({
        pricePerGram: 6000,
        currency: 'INR'
      });
    }

    return NextResponse.json({ 
      message: 'Sample data initialized successfully',
      membersAdded: sampleMembers.length
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    return NextResponse.json({ error: 'Failed to initialize data' }, { status: 500 });
  }
}
