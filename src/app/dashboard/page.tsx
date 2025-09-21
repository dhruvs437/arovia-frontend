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
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const storedData = sessionStorage.getItem('healthData');
    if (!storedData) {
      router.push('/verify');
      return;
    }
    const parsed: HealthData = JSON.parse(storedData);

    if (parsed.analysis && Array.isArray(parsed.analysis.predictions)) {
      const predictedRisks = predictionsToRiskFactors(parsed.analysis.predictions || []);
      parsed.riskFactors = { ...(parsed.riskFactors || {}), ...predictedRisks };
    }

    setHealthData(parsed);
    
    // Animate health score
    if (parsed.gamificationData?.healthScore) {
      const target = parsed.gamificationData.healthScore;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [router]);

  if (!healthData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 bg-purple-400 opacity-20"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-fadeInLeft">
              <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                Health Dashboard
              </h1>
              <p className="text-purple-200 mt-1">Welcome back, {healthData.profile.name} ✨</p>
            </div>
            <button
              onClick={() => router.push('/comorbidity')}
              className="animate-fadeInRight group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                Check Comorbidity Risk 
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score Card */}
        <div className="animate-fadeInUp backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Overall Health Score */}
            <div className="text-center">
              <h3 className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-4">
                Overall Health Score
              </h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#healthGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(animatedScore / 100) * 440} 440`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="50%" stopColor="#e879f9" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={`absolute text-5xl font-bold ${getHealthScoreColor(animatedScore)}`}>
                  {animatedScore}
                </span>
              </div>
              <p className="text-purple-300 mt-3 text-sm">Excellent Health</p>
              <div className="mt-4 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-8 rounded-full transition-all duration-500 ${
                      i < Math.floor(animatedScore / 20) ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-white/10'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>

            {/* Primary Conditions */}
            <div className="space-y-4">
              <h3 className="text-purple-200 text-sm font-semibold uppercase tracking-wider">
                Primary Health Risks
              </h3>
              {Object.entries(healthData.riskFactors || {}).map(([condition, data]: [string, any], index) => (
                <div 
                  key={condition} 
                  className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-purple-100 capitalize font-medium">{condition.replace(/_/g, ' ')}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${getRiskColor(data.risk)}`}>
                    {data.risk} ({data.score}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Gamification Stats */}
            <div className="space-y-4">
              <h3 className="text-purple-200 text-sm font-semibold uppercase tracking-wider">
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-purple-100">Current Streak</span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                    🔥 {healthData.gamificationData.streakDays} days
                  </span>
                </div>
                <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-purple-100">Community Rank</span>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    #{healthData.gamificationData.communityRank}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {healthData.gamificationData.badges.map((badge: string, index: number) => (
                  <span 
                    key={badge} 
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm text-yellow-200 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {(['overview', 'records', 'risks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : 'backdrop-blur-sm bg-white/10 text-purple-200 hover:bg-white/20 border border-white/10'
              }`}
            >
              {tab === 'overview' && '📊'} {tab === 'records' && '📋'} {tab === 'risks' && '⚠️'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
                Recent Health Metrics
              </h2>

              {/* Latest Test Results */}
              <div className="grid md:grid-cols-2 gap-6">
                {healthData.healthRecords[1]?.tests?.map((test: any, index: number) => (
                  <div 
                    key={index} 
                    className="backdrop-blur-sm bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-purple-100 text-lg">{test.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                        test.status === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        test.status === 'normal' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">{test.value}</p>
                    <p className="text-sm text-purple-300">Normal: {test.normal}</p>
                    <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          test.status === 'normal' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                          test.status === 'high' ? 'bg-gradient-to-r from-rose-400 to-pink-400' :
                          'bg-gradient-to-r from-amber-400 to-yellow-400'
                        }`}
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-xl font-bold text-purple-100 mb-4">Current Medications</h3>
                <div className="space-y-3">
                  {healthData.healthRecords[0]?.medications?.map((med: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-5 border border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div>
                        <p className="font-bold text-white text-lg">{med.name}</p>
                        <p className="text-sm text-purple-300">{med.dosage} - {med.frequency}</p>
                      </div>
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/25">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
                Medical Records
              </h2>
              {healthData.healthRecords.map((record: any, index: number) => (
                <div 
                  key={index} 
                  className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400"></div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-white">{record.type}</h3>
                    <span className="text-sm text-purple-300 backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
                      {record.date}
                    </span>
                  </div>
                  <p className="text-purple-200">Doctor: {record.doctor}</p>
                  <p className="text-purple-200">Hospital: {record.hospital}</p>
                  <button className="mt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 font-bold text-sm transition-all duration-300">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
                Risk Analysis
              </h2>
              <div className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-amber-400 p-6 rounded-2xl animate-pulse-slow">
                <h3 className="font-bold text-amber-200 mb-3 text-xl">⚠️ Comorbidity Alert</h3>
                <p className="text-amber-100 mb-4">
                  Based on your current health metrics and medical history, our AI model has identified potential comorbidity risks.
                </p>
                <button
                  onClick={() => router.push('/comorbidity')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/25"
                >
                  View Detailed Timeline & Predictions
                </button>
              </div>

              {/* AI Summary */}
              {healthData.analysis?.summary && (
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="font-bold text-purple-100 text-lg mb-3">🤖 AI Summary</h4>
                  <p className="text-purple-200 leading-relaxed">{healthData.analysis.summary}</p>
                </div>
              )}

              {/* Predictions list */}
              {Array.isArray(healthData.analysis?.predictions) && healthData.analysis.predictions.length > 0 && (
                <div className="space-y-4 mt-6">
                  {healthData.analysis.predictions.map((p: any, i: number) => (
                    <div 
                      key={i} 
                      className="backdrop-blur-sm bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-lg">{p.condition}</h4>
                          <p className="text-xs text-purple-300 mt-1">
                            {p.years} {p.years === 1 ? 'year' : 'years'} from now
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border ${
                            p.probability_pct >= 70 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                            p.probability_pct >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                            'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {p.probability_pct}% Risk
                          </span>
                          {p.preventable && (
                            <p className="text-xs text-emerald-400 mt-2 font-semibold">✓ Preventable</p>
                          )}
                        </div>
                      </div>

                      {p.rationale && (
                        <p className="text-purple-200 mt-4 leading-relaxed">{p.rationale}</p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(p.interventions || []).map((it: string, idx: number) => (
                          <span 
                            key={idx} 
                            className="bg-blue-500/20 backdrop-blur-sm text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {it}
                          </span>
                        ))}
                      </div>

                      {p.citations && p.citations.length > 0 && (
                        <p className="text-xs text-purple-400 mt-3">
                          📚 Citations: {p.citations.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Factors Visualization */}
              <div className="space-y-5 mt-8">
                {Object.entries(healthData.riskFactors || {}).map(([condition, data]: [string, any], index) => (
                  <div 
                    key={condition} 
                    className="space-y-3 animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-100 capitalize">
                        {condition.replace(/_/g, ' ')} Risk
                      </span>
                      <span className="text-sm text-purple-300 font-semibold">{data.score}%</span>
                    </div>
                    <div className="relative w-full h-4 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                          data.risk === 'High' ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                          data.risk === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 
                          'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${data.score}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </div>
                    </div>
                    <p className="text-xs text-purple-400">Trend: {data.trend || 'Stable'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left border border-white/20 hover:scale-105 animate-fadeInUp">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">📅</div>
              <h3 className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                Book Appointment
              </h3>
              <p className="text-purple-300 text-sm mt-1">Schedule a consultation</p>
            </div>
          </button>

          <button className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left border border-white/20 hover:scale-105 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">💊</div>
              <h3 className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                Medicine Reminder
              </h3>
              <p className="text-purple-300 text-sm mt-1">Set medication alerts</p>
            </div>
          </button>

          <button className="group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left border border-white/20 hover:scale-105 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">👥</div>
              <h3 className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                Join Community
              </h3>
              <p className="text-purple-300 text-sm mt-1">Connect with others</p>
            </div>
          </button>
        </div>
      </main>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function predictionsToRiskFactors(predictions: any[]) {
  const out: Record<string, any> = {};
  if (!Array.isArray(predictions)) return out;
  predictions.forEach(pred => {
    const key = pred.condition.toLowerCase().replace(/\s+/g, '_');
    const score = Math.min(100, Math.round((pred.probability_pct ?? pred.probability ?? 0) || 0));
    const riskLabel = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    out[key] = {
      risk: riskLabel,
      score,
      trend: pred.trend || 'Stable',
      rationale: pred.rationale || '',
      interventions: pred.interventions || [],
      citations: pred.citations || []
    };
  });
  return out;
}