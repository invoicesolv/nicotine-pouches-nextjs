import { NextRequest, NextResponse } from 'next/server';
import { authenticateStoreRequest } from '@/lib/store-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateStoreRequest(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: authResult.user,
      vendor: authResult.vendor,
    });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
