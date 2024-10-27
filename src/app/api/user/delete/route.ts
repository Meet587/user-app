import { NextRequest, NextResponse } from 'next/server';

import User from '@/models/user.model';
import connectToDB from '@/db/config';

export async function DELETE(request: NextRequest) {
    const { userId } = await request.json(); 

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        await connectToDB();
        const result = await User.deleteOne({ _id: userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found', status: 404, success: false });
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'An error occurred', status: 500, success: false });
    }
}
