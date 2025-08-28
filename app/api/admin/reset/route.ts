import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draw from '@/models/Draw';
import Payment from '@/models/Payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear all draws and payments
    await Draw.deleteMany({});
    await Payment.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: 'All draw and payment data has been reset successfully',
      drawsDeleted: true,
      paymentsDeleted: true
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}
