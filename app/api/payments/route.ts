import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find({}).populate('memberId').populate('drawId').sort({ createdAt: -1 });
    
    // Convert _id to id for frontend compatibility
    const paymentsWithId = payments.map(payment => ({
      ...payment.toObject(),
      id: payment._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(paymentsWithId);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const payment = await Payment.create(body);
    
    // Convert _id to id for frontend compatibility
    const paymentWithId = {
      ...payment.toObject(),
      id: payment._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(paymentWithId, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Find and update the payment
    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // Convert _id to id for frontend compatibility
    const paymentWithId = {
      ...payment.toObject(),
      id: payment._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(paymentWithId);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
