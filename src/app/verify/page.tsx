'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type VerificationStep = 'abha' | 'otp' | 'loading' | 'success';

interface UserProfile {
  name: string;
  healthIdNumber: string;
  healthId?: string;
  gender: string;
  dateOfBirth: string;
  mobile: string;
}

interface HealthData {
  profile: UserProfile;
  healthRecords: any;
  riskFactors: any;
  gamificationData: any;
  analysis?: any;
}

// Import mock data
const mockABHAProfiles: Record<string, any> = {
  "14123456789012": {
    healthIdNumber: "14-1234-5678-9012",
    healthId: "john.doe@sbx",
    name: "John Doe",
    gender: "Male",
    dateOfBirth: "15-08-1979",
    mobile: "9876543210"
  },
  "91234567890123": {
    healthIdNumber: "91-2345-6789-0123",
    healthId: "priya.sharma@sbx",
    name: "Priya Sharma",
    gender: "Female",
    dateOfBirth: "22-03-1985",
    mobile: "9876543211"
  },
  "78901234567890": {
    healthIdNumber: "78-9012-3456-7890",
    healthId: "raj.patel@sbx",
    name: "Raj Patel",
    gender: "Male",
    dateOfBirth: "10-11-1970",
    mobile: "9876543212"
  }
};

const mockHealthRecords: Record<string, any> = {
  "14123456789012": {
    records: [
      {
        type: 'Prescription',
        date: '2024-01-15',
        doctor: 'Dr. Sharma',
        hospital: 'Apollo Hospital',
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
        ]
      },
      {
        type: 'Lab Report',
        date: '2024-01-10',
        tests: [
          { name: 'HbA1c', value: '7.2%', normal: '< 6.5%', status: 'high' },
          { name: 'Blood Pressure', value: '140/90', normal: '< 120/80', status: 'high' },
          { name: 'Cholesterol', value: '210 mg/dL', normal: '< 200 mg/dL', status: 'borderline' }
        ]
      }
    ],
    riskFactors: {
      diabetes: { risk: 'High', score: 75, trend: 'increasing' },
      hypertension: { risk: 'Medium', score: 60, trend: 'stable' },
      cardiovascular: { risk: 'Medium', score: 55, trend: 'increasing' }
    },
    gamificationData: {
      healthScore: 65,
      streakDays: 12,
      badges: ['First Steps', 'Week Warrior'],
      challenges: ['30-Day Sugar Control', 'Daily Walk Challenge'],
      communityRank: 234
    }
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep>('abha');
  const [abhaId, setAbhaId] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  useEffect(() => {
    // Get ABHA ID from session if redirected from home page
    const storedAbhaId = sessionStorage.getItem('abhaId');
    if (storedAbhaId) {
      setAbhaId(storedAbhaId);
    }
  }, []);

  const formatAbhaId = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    let formatted = '';
    for (let i = 0; i < numbers.length && i < 14; i++) {
      if (i === 2 || i === 6 || i === 10) {
        formatted += '-';
      }
      formatted += numbers[i];
    }
    return formatted;
  };

  const handleAbhaSubmit = async () => {
    setError('');
    const cleanId = abhaId.replace(/-/g, '');

    if (cleanId.length !== 14) {
      setError('Please enter a valid 14-digit ABHA number');
      return;
    }

    setIsLoading(true);
    // simulate network latency/validation
    await new Promise((r) => setTimeout(r, 700));

    if (mockABHAProfiles[cleanId]) {
      setStep('otp');
      setError('');
    } else {
      setError('ABHA ID not found. Try: 14123456789012');
    }

    setIsLoading(false);
  };

  // helper: login to backend (dev flow) and return token
  async function backendLoginForDev(username: string, password = 'devpass') {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'login failed');
    return json.token;
  }

  // helper: simple POST wrapper that includes JWT
  async function postWithAuth(path: string, token: string, body: any) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  const handleOTPVerification = async () => {
    setError('');
    if (otp !== '123456') {
      setError('Invalid OTP. Use: 123456');
      return;
    }

    setIsLoading(true);
    const cleanId = abhaId.replace(/-/g, '');
    try {
      // small ui delay
      await new Promise((r) => setTimeout(r, 600));

      const profile = mockABHAProfiles[cleanId];
      const records = mockHealthRecords[cleanId] || mockHealthRecords["14123456789012"];

      // Build the local healthData first
      const localHealthData: HealthData = {
        profile,
        healthRecords: records.records,
        riskFactors: records.riskFactors,
        gamificationData: records.gamificationData,
      };

      // 1) login to backend (dev helper — will create user if missing)
      // use a deterministic dev username derived from profile name
      const devUsername = profile.name.toLowerCase().replace(/\s+/g, '');
      const token = await backendLoginForDev(devUsername, 'devpass');

      // persist token in sessionStorage for frontend use
      sessionStorage.setItem('apiToken', token);

      // 2) create health record on backend (so server has data to merge)
      const payload = {
        // map mock records to payload fields expected by backend
        last_hba1c: Number((records.records[1]?.tests?.find((t: any) => t.name === 'HbA1c')?.value || '').replace('%', '')) || null,
        bmi: 29.4, // demo value — replace with real mapping if available
        medications: records.records[0]?.medications || [],
        tests: records.records[1]?.tests || []
      };

      await postWithAuth('/api/health', token, {
        userId: profile.healthId || profile.healthIdNumber || devUsername,
        source: 'abha-mock',
        payload
      });

      // 3) call analyze endpoint with lifestyle defaults (you can expose UI later)
      const lifestyleDefaults = {
        exercise: 'rare',
        diet: 'average',
        sleep: '5-6h',
        stress: 'high'
      };

      const analyzeRes = await postWithAuth('/api/analyze', token, {
        userId: profile.healthId || profile.healthIdNumber || devUsername,
        lifestyle: lifestyleDefaults,
        healthDatabases: ['NHANES', 'WHO']
      });

      // analyzeRes is expected shape: { ok: true, analysis: {...} } or fallback
      let analysis = null;
      if (analyzeRes && analyzeRes.ok && analyzeRes.analysis) {
        analysis = analyzeRes.analysis;
      } else {
        // backend may return { ok:false, error: '...' } — show warning but proceed
        console.warn('Analyze call failed or returned fallback:', analyzeRes);
      }

      // combine and save into sessionStorage for Dashboard
      const combined = {
        ...localHealthData,
        analysis
      };

      sessionStorage.setItem('healthData', JSON.stringify(combined));
      setHealthData(combined);
      setStep('success');

    } catch (err: any) {
      console.error('verify backend error', err);
      setError(err?.message || 'Failed to connect to backend. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToDashboard = () => {
    if (healthData) {
      // already saved to sessionStorage in success path; just navigate
      router.push('/dashboard');
    }
  };

  const progress = (abhaId.replace(/-/g, '').length / 14) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4">
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: step === 'abha' ? `${progress}%` : step === 'otp' ? '50%' : '100%' }}
          />
        </div>

        {step === 'abha' && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
              Verify ABHA ID
            </h1>

            <p className="text-gray-500 text-center mb-8">
              Enter your ABHA ID to access health records
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                ABHA Number
              </label>
              <input
                type="text"
                value={formatAbhaId(abhaId)}
                onChange={(e) => setAbhaId(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="14-1234-5678-9012"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-700 font-medium text-lg"
                maxLength={17}
              />
              <p className="text-xs text-gray-500 mt-2">
                Demo IDs: 14123456789012, 91234567890123, 78901234567890
              </p>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleAbhaSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wider disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify ABHA'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Enter OTP
            </h1>

            <div className="mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-2xl text-center text-gray-500 tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Demo OTP: 123456
              </p>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              onClick={handleOTPVerification}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 'success' && healthData && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Successful!
              </h1>
              <p className="text-gray-600">
                Welcome, {healthData.profile.name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Health Score:</span>
                  <span className="font-bold text-green-600">{healthData.gamificationData.healthScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Risk Level:</span>
                  <span className="font-bold text-orange-600">{healthData.riskFactors.diabetes.risk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Streak:</span>
                  <span className="font-bold text-gray-500">{healthData.gamificationData.streakDays} days</span>
                </div>
              </div>
            </div>

            <button
              onClick={proceedToDashboard}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 rounded-xl"
            >
              Proceed to Health Dashboard →
            </button>
          </>
        )}

        {/* small global error */}
        {error && step !== 'abha' && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </main>
  );
}
