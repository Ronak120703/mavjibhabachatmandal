import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();
    const members = await Member.find({}).sort({ createdAt: -1 });
    
    // Convert _id to id for frontend compatibility
    const membersWithId = members.map(member => ({
      ...member.toObject(),
      id: member._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json(membersWithId);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const member = await Member.create(body);
    
    // Convert _id to id for frontend compatibility
    const memberWithId = {
      ...member.toObject(),
      id: member._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(memberWithId, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
