'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HealthData {
  profile: any;
  healthRecords: any[];
  riskFactors: any;
  gamificationData: any;
  analysis?: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'risks'>('overview');

  useEffect(() => {
    const storedData = sessionStorage.getItem('healthData');
    if (!storedData) {
      router.push('/verify');
      return;
    }
    const parsed: HealthData = JSON.parse(storedData);

    // If analysis is present, convert predictions -> riskFactors and merge
    if (parsed.analysis && Array.isArray(parsed.analysis.predictions)) {
      const predictedRisks = predictionsToRiskFactors(parsed.analysis.predictions || []);
      parsed.riskFactors = { ...(parsed.riskFactors || {}), ...predictedRisks };
    }

    setHealthData(parsed);
  }, [router]);

  if (!healthData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Calculate overall health score
  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {healthData.profile.name}</p>
            </div>
            <button
              onClick={() => router.push('/comorbidity')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Check Comorbidity Risk →
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Overall Health Score */}
            <div className="text-center">
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider mb-2">
                Overall Health Score
              </h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(healthData.gamificationData.healthScore / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={`absolute text-4xl font-bold ${getHealthScoreColor(healthData.gamificationData.healthScore)}`}>
                  {healthData.gamificationData.healthScore}
                </span>
              </div>
              <p className="text-gray-500 mt-2">Out of 100</p>
            </div>

            {/* Primary Conditions */}
            <div className="space-y-4">
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                Primary Health Risks
              </h3>
              {Object.entries(healthData.riskFactors || {}).map(([condition, data]: [string, any]) => (
                <div key={condition} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{condition.replace(/_/g, ' ')}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(data.risk)}`}>
                    {data.risk} ({data.score}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Gamification Stats */}
            <div className="space-y-4">
              <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                Achievements
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Current Streak</span>
                <span className="font-bold text-purple-600">🔥 {healthData.gamificationData.streakDays} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Community Rank</span>
                <span className="font-bold text-blue-600">#{healthData.gamificationData.communityRank}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {healthData.gamificationData.badges.map((badge: string) => (
                  <span key={badge} className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {(['overview', 'records', 'risks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Health Metrics</h2>

              {/* Latest Test Results */}
              <div className="grid md:grid-cols-2 gap-6">
                {healthData.healthRecords[1]?.tests?.map((test: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{test.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        test.status === 'high' ? 'bg-red-100 text-red-600' :
                        test.status === 'normal' ? 'bg-green-100 text-green-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{test.value}</p>
                    <p className="text-sm text-gray-500">Normal: {test.normal}</p>
                  </div>
                ))}
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Medications</h3>
                <div className="space-y-3">
                  {healthData.healthRecords[0]?.medications?.map((med: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                      <div>
                        <p className="font-semibold text-gray-800">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                      </div>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Medical Records</h2>
              {healthData.healthRecords.map((record: any, index: number) => (
                <div key={index} className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{record.type}</h3>
                    <span className="text-sm text-gray-600">{record.date}</span>
                  </div>
                  <p className="text-gray-700">Doctor: {record.doctor}</p>
                  <p className="text-gray-700">Hospital: {record.hospital}</p>
                  <button className="mt-3 text-purple-600 hover:text-purple-700 font-semibold text-sm">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Risk Analysis</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ Comorbidity Alert</h3>
                <p className="text-gray-700 mb-4">
                  Based on your current health metrics and medical history, our AI model has identified potential comorbidity risks.
                </p>
                <button
                  onClick={() => router.push('/comorbidity')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  View Detailed Timeline & Predictions
                </button>
              </div>

              {/* AI Summary */}
              {healthData.analysis?.summary && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold">AI Summary</h4>
                  <p className="text-gray-700 mt-2">{healthData.analysis.summary}</p>
                </div>
              )}

              {/* Predictions list (if available) */}
              {Array.isArray(healthData.analysis?.predictions) && healthData.analysis.predictions.length > 0 && (
                <div className="space-y-4 mt-4">
                  {healthData.analysis.predictions.map((p: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{p.condition}</h4>
                          <p className="text-xs text-gray-500">{p.years} {p.years === 1 ? 'year' : 'years'} from now</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            p.probability_pct >= 70 ? 'bg-red-100 text-red-800' :
                            p.probability_pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>{p.probability_pct}% Risk</span>
                          {p.preventable && <p className="text-xs text-green-600 mt-1">✓ Preventable</p>}
                        </div>
                      </div>

                      {p.rationale && <p className="text-gray-700 mt-3">{p.rationale}</p>}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p.interventions || []).map((it: string, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{it}</span>
                        ))}
                      </div>

                      {p.citations && p.citations.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">Citations: {p.citations.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Factors Visualization */}
              <div className="space-y-4 mt-6">
                {Object.entries(healthData.riskFactors || {}).map(([condition, data]: [string, any]) => (
                  <div key={condition} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 capitalize">{condition.replace(/_/g, ' ')} Risk</span>
                      <span className="text-sm text-gray-600">{data.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          data.risk === 'High' ? 'bg-red-500' :
                          data.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Trend: {data.trend || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">Book Appointment</h3>
            <p className="text-gray-600 text-sm mt-1">Schedule a consultation</p>
          </button>

          <button className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="text-3xl mb-3">💊</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">Medicine Reminder</h3>
            <p className="text-gray-600 text-sm mt-1">Set medication alerts</p>
          </button>

          <button className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-left group">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">Join Community</h3>
            <p className="text-gray-600 text-sm mt-1">Connect with others</p>
          </button>
        </div>
      </main>
    </div>
  );
}

/**
 * Helper: convert model predictions -> dashboard riskFactors shape
 * expected prediction fields: { condition, probability_pct, rationale, interventions }
 */
function predictionsToRiskFactors(predictions: any[]) {
  const out: Record<string, any> = {};
  if (!Array.isArray(predictions)) return out;
  predictions.forEach(pred => {
    const key = pred.condition.toLowerCase().replace(/\s+/g, '_'); // e.g. "Type 2 Diabetes" -> "type_2_diabetes"
    const score = Math.min(100, Math.round((pred.probability_pct ?? pred.probability ?? 0) || 0));
    const riskLabel = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    out[key] = {
      risk: riskLabel,
      score,
      trend: pred.trend || 'N/A',
      rationale: pred.rationale || '',
      interventions: pred.interventions || [],
      citations: pred.citations || []
    };
  });
  return out;
}
