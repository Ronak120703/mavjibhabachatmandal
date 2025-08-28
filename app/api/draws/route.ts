import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draw from '@/models/Draw';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check for month filter
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let query = {};
    if (month) {
      query = { month: month };
    }
    
    const draws = await Draw.find(query).sort({ date: -1 });
    
    // Convert _id to id for frontend compatibility
    const drawsWithId = draws.map(draw => ({
      ...draw.toObject(),
      id: draw._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(drawsWithId);
  } catch (error) {
    console.error('Error fetching draws:', error);
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    console.log('Creating draw with data:', body);
    
    // Validate required fields
    if (!body.winnerId) {
      return NextResponse.json({ error: 'winnerId is required' }, { status: 400 });
    }
    
    if (!body.winnerName) {
      return NextResponse.json({ error: 'winnerName is required' }, { status: 400 });
    }
    
    // Convert winnerId to ObjectId if it's a string
    if (body.winnerId && typeof body.winnerId === 'string') {
      try {
        body.winnerId = new mongoose.Types.ObjectId(body.winnerId);
        console.log('Converted winnerId to ObjectId:', body.winnerId);
      } catch (error) {
        console.error('Invalid winnerId format:', body.winnerId);
        return NextResponse.json({ error: 'Invalid winner ID format' }, { status: 400 });
      }
    }
    
    // Remove the payments array if it exists (it's not in the schema)
    if (body.payments) {
      delete body.payments;
    }
    
    // Ensure all required fields are present
    const drawData = {
      month: body.month,
      date: body.date,
      winnerId: body.winnerId,
      winnerName: body.winnerName,
      goldPricePerGram: body.goldPricePerGram,
      totalAmount: body.totalAmount,
      amountPerMember: body.amountPerMember,
      qrCodeUrl: body.qrCodeUrl,
      isCompleted: body.isCompleted || false,
    };
    
    console.log('Final draw data:', drawData);
    
    const draw = await Draw.create(drawData);
    console.log('Draw created successfully:', draw);
    
    // Convert _id to id for frontend compatibility
    const drawWithId = {
      ...draw.toObject(),
      id: draw._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(drawWithId, { status: 201 });
  } catch (error) {
    console.error('Error creating draw:', error);
    return NextResponse.json({ 
      error: 'Failed to create draw',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
