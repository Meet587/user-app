import connectToDB from '@/db/config';
import User from '@/models/user.model';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectToDB();

    try {
        const users = await User.find({});
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to retrieve users' }, { status: 500 });
    }
}