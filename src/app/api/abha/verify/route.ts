import { NextRequest, NextResponse } from 'next/server';
import ABHAService from '@/app/lib/abhaService';

export async function POST(request: NextRequest) {
  const { abhaId, action, otp, txnId } = await request.json();
  const abhaService = new ABHAService();

  try {
    await abhaService.initialize();

    switch (action) {
      case 'check':
        const exists = await abhaService.verifyABHAExists(abhaId);
        return NextResponse.json({ exists });

      case 'sendOTP':
        const transaction = await abhaService.loginWithMobileOTP(abhaId);
        return NextResponse.json({ txnId: transaction.txnId });

      case 'verifyOTP':
        const authToken = await abhaService.verifyOTP(txnId, otp);
        return NextResponse.json({ token: authToken.token });

      case 'getProfile':
        const userToken = request.headers.get('X-User-Token') || '';
        const profile = await abhaService.getUserProfile(userToken);
        const healthRecords = await abhaService.getHealthRecords(abhaId);
        return NextResponse.json({ profile, healthRecords });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}