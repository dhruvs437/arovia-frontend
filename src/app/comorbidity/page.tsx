'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type LifestyleData = {
  exercise: string;
  diet: string;
  sleep: string;
  stress: string;
  smoking: string;
  alcohol: string;
  waterIntake: string;
  screenTime: string;
};

type PredictionTimeline = {
  years: number;
  condition: string;
  probability: number;
  preventable: boolean;
  interventions: string[];
  rationale?: string;
  citations?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ComorbidityPage() {
  const router = useRouter();

  const [step, setStep] = useState<'lifestyle' | 'analysis' | 'results'>('lifestyle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lifestyleData, setLifestyleData] = useState<LifestyleData>({
    exercise: '',
    diet: '',
    sleep: '',
    stress: '',
    smoking: '',
    alcohol: '',
    waterIntake: '',
    screenTime: ''
  });

  const [healthData, setHealthData] = useState<any | null>(null);
  const [predictions, setPredictions] = useState<PredictionTimeline[]>([]);
  const [analysisRaw, setAnalysisRaw] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem('healthData');
    if (!stored) {
      router.push('/dashboard');
      return;
    }
    setHealthData(JSON.parse(stored));
  }, [router]);

  function generatePredictionsFallback(lifestyle: LifestyleData, health: any): PredictionTimeline[] {
    const baseRisk = health?.riskFactors?.diabetes?.score ?? 50;
    const preds: PredictionTimeline[] = [];
    const exerciseFactor = lifestyle.exercise === 'daily' ? 0.7 : lifestyle.exercise === 'regular' ? 0.85 : 1.05;
    const dietFactor = lifestyle.diet === 'excellent' ? 0.75 : lifestyle.diet === 'good' ? 0.9 : 1.1;
    const stressFactor = lifestyle.stress === 'low' ? 0.85 : lifestyle.stress === 'moderate' ? 1.0 : 1.2;

    preds.push({
      years: 3,
      condition: 'Type 2 Diabetes',
      probability: Math.max(4, Math.min(95, Math.round(baseRisk * exerciseFactor * dietFactor))),
      preventable: true,
      interventions: ['Improve diet', 'Walk 30 min/day', 'Weight loss'],
      rationale: 'Current metabolic markers combined with lifestyle indicate medium-term diabetes risk.'
    });

    preds.push({
      years: 6,
      condition: 'Cardiovascular Disease',
      probability: Math.max(8, Math.min(95, Math.round((baseRisk * 0.9) * stressFactor))),
      preventable: true,
      interventions: ['150 min/wk cardio', 'Reduce sodium', 'Mindfulness'],
      rationale: 'Cardiometabolic profile and stress levels drive cardiovascular risk.'
    });

    preds.push({
      years: 10,
      condition: 'Chronic Kidney Disease',
      probability: Math.max(3, Math.min(70, Math.round(baseRisk * 0.55))),
      preventable: true,
      interventions: ['BP control', 'Kidney tests', 'Glycemic control'],
      rationale: 'Long-term exposure to diabetes/hypertension increases kidney risk.'
    });

    return preds.sort((a, b) => a.years - b.years);
  }

  function normalizePredictionItem(p: any): PredictionTimeline {
    return {
      years: Number(p.years ?? p.y ?? 0),
      condition: p.condition ?? p.name ?? 'Unknown',
      probability: Number(p.probability_pct ?? p.probability ?? p.prob ?? 0),
      preventable: !!p.preventable,
      interventions: p.interventions ?? [],
      rationale: p.rationale ?? '',
      citations: p.citations ?? []
    };
  }

  async function callBackendAnalyze(userId: string, lifestyle: LifestyleData, token: string | null) {
    const body = { userId, lifestyle, healthDatabases: ['NHANES', 'WHO'] };
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'analyze failed');
    return json.analysis;
  }

  const handleLifestyleSubmit = async () => {
    setError(null);
    if (!Object.values(lifestyleData).every(v => v !== '')) {
      setError('Please complete all lifestyle fields to get an accurate projection.');
      return;
    }
    if (!healthData) {
      setError('No health data found. Please verify first.');
      return;
    }

    setStep('analysis');
    setIsAnalyzing(true);

    const token = sessionStorage.getItem('apiToken');
    const userId = healthData?.profile?.healthId ?? healthData?.profile?.healthIdNumber ?? (healthData?.profile?.name ?? 'guest').toLowerCase().replace(/\s+/g, '');

    try {
      const analysis = await callBackendAnalyze(userId, lifestyleData, token);
      setAnalysisRaw(analysis);

      const modelPredicts = (analysis?.projection?.predictions && Array.isArray(analysis.projection.predictions))
        ? analysis.projection.predictions
        : (analysis?.predictions && Array.isArray(analysis.predictions))
          ? analysis.predictions
          : [];

      const normalized = modelPredicts.map(normalizePredictionItem);
      setPredictions(normalized.length ? normalized : generatePredictionsFallback(lifestyleData, healthData));

      sessionStorage.setItem('prevention_payload', JSON.stringify({
        predictions: normalized.length ? normalized : generatePredictionsFallback(lifestyleData, healthData),
        lifestyleData,
        healthData,
        analysis
      }));

      const merged = { ...healthData, analysis };
      sessionStorage.setItem('healthData', JSON.stringify(merged));
      setHealthData(merged);

      setStep('results');
    } catch (err: any) {
      console.warn('Analyze failure — falling back locally', err);
      setError('Analysis service unavailable. Showing local personalized estimates.');
      const fallback = generatePredictionsFallback(lifestyleData, healthData);
      setPredictions(fallback);
      sessionStorage.setItem('prevention_payload', JSON.stringify({ predictions: fallback, lifestyleData, healthData }));
      setStep('results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deltas = useMemo(() => {
    const a = analysisRaw ?? healthData?.analysis;
    if (!a?.deltas || !Array.isArray(a.deltas)) return [];
    return a.deltas.slice().sort((x:any,y:any)=>Math.abs(y.delta_pct)-Math.abs(x.delta_pct));
  }, [analysisRaw, healthData]);

  const topFeatures = useMemo(() => {
    const a = analysisRaw ?? healthData?.analysis;
    return a?.explainability?.top_features ?? [];
  }, [analysisRaw, healthData]);

  const toggleExpand = (cond: string) => {
    setExpanded(prev => ({ ...prev, [cond]: !prev[cond] }));
  };

  const userName = healthData?.profile?.name ?? 'User';
  const heroSummary = analysisRaw?.summary ?? healthData?.analysis?.summary ?? 'See how changing lifestyle alters your risk timeline.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative backdrop-blur-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="animate-fadeInLeft">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Personalized Comorbidity Dashboard
            </h1>
            <p className="text-purple-100 mt-2 max-w-2xl">
              Hi <span className="font-bold text-white">{userName}</span> — {heroSummary}
            </p>
          </div>

          <div className="flex items-center gap-3 animate-fadeInRight">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="backdrop-blur-sm bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border border-white/20"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => { setStep('lifestyle'); setError(null); }}
              className="bg-white text-purple-700 px-5 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300"
            >
              Edit Lifestyle
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Form / Results */}
          <section className="lg:col-span-2 space-y-6">
            {/* Big Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 animate-fadeInUp">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-purple-200 font-semibold uppercase tracking-wider">Health Score</div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-4xl font-bold text-white">{healthData?.gamificationData?.healthScore ?? '—'}</div>
                <div className="text-sm text-purple-300 mt-2">Current wellness index</div>
                <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000" style={{ width: `${healthData?.gamificationData?.healthScore ?? 0}%` }}></div>
                </div>
              </div>

              <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Streak</div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-4xl font-bold text-emerald-400">
                  {healthData?.gamificationData?.streakDays ?? 0}<span className="text-2xl text-emerald-300">d</span>
                </div>
                <div className="text-sm text-emerald-200 mt-2">Healthy habit streak</div>
                <div className="mt-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < Math.min(5, Math.floor((healthData?.gamificationData?.streakDays ?? 0) / 7)) ? 'bg-emerald-400' : 'bg-white/10'}`}></div>
                  ))}
                </div>
              </div>

              <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-amber-200 font-semibold uppercase tracking-wider">Top Risk</div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-2xl font-bold text-amber-400 truncate">
                  {healthData?.riskFactors ? Object.keys(healthData.riskFactors)[0].replace(/_/g, ' ') : '—'}
                </div>
                <div className="text-sm text-amber-200 mt-2">Most pressing risk</div>
                <div className="mt-3 flex gap-1">
                  <div className="h-1 flex-1 bg-amber-400 rounded-full"></div>
                  <div className="h-1 flex-1 bg-amber-400/60 rounded-full"></div>
                  <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Middle: Interactive area */}
            {step === 'lifestyle' && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20 animate-fadeIn">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Update Your Lifestyle</h2>
                    <p className="text-purple-200 mt-1">Your selections will create a personalized health projection</p>
                  </div>
                  <div className="hidden lg:block">
                    <svg className="w-16 h-16 text-purple-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { k: 'exercise', label: '🏃‍♂️ Exercise', opts: [['','Choose'],['none','None'],['rare','1-2/mo'],['moderate','1-2/wk'],['regular','3-4/wk'],['daily','Daily']] },
                    { k: 'diet', label: '🥗 Diet Quality', opts: [['','Choose'],['poor','Mostly processed'],['average','Average'],['good','Balanced'],['excellent','Excellent']] },
                    { k: 'sleep', label: '😴 Sleep Duration', opts: [['','Choose'],['less5','<5h'],['5-6','5-6h'],['6-7','6-7h'],['7-8','7-8h'],['more8','>8h']] },
                    { k: 'stress', label: '😰 Stress Level', opts: [['','Choose'],['low','Low'],['moderate','Moderate'],['high','High'],['chronic','Chronic']] },
                    { k: 'smoking', label: '🚬 Smoking', opts: [['','Choose'],['never','Never'],['former','Former'],['occasional','Occasional'],['yes','Regular']] },
                    { k: 'alcohol', label: '🍷 Alcohol', opts: [['','Choose'],['none','None'],['occasional','Occasional'],['moderate','1-2/wk'],['regular','3-5/wk'],['heavy','Daily']] },
                    { k: 'waterIntake', label: '💧 Water Intake', opts: [['','Choose'],['less1L','<1L'],['1-2L','1-2L'],['2-3L','2-3L'],['more3L','>3L']] },
                    { k: 'screenTime', label: '📱 Screen Time', opts: [['','Choose'],['less2','<2h'],['2-4','2-4h'],['4-8','4-8h'],['more8','>8h']] }
                  ].map((f, index) => (
                    <div key={f.k} className="group animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                      <label className="text-sm font-bold text-purple-200 mb-2 block">{f.label}</label>
                      <select
                        className="w-full rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                        value={(lifestyleData as any)[f.k]}
                        onChange={(e) => setLifestyleData(prev => ({ ...prev, [f.k]: e.target.value }))}
                      >
                        {f.opts.map((o:any, i:number)=> (
                          <option key={i} value={o[0]} className="bg-purple-900 text-white">{o[1]}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-200">
                    {error}
                  </div>
                )}

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleLifestyleSubmit}
                    disabled={isAnalyzing}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <span className="relative z-10">
                      {isAnalyzing ? 'Analyzing…' : 'Project My Risk'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard')} 
                    className="backdrop-blur-sm bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl border border-white/20 text-white font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {step === 'analysis' && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-12 text-center border border-white/20 animate-fadeIn">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-spin-slow"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-900 to-pink-900"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Creating Your Projection</h3>
                <p className="text-purple-200 max-w-md mx-auto">
                  We're combining your historical health data with the lifestyle you selected to estimate baseline and projection scenarios.
                </p>
                <div className="mt-8 flex justify-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></div>
                  ))}
                </div>
              </div>
            )}

            {step === 'results' && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20 animate-fadeIn">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                      {userName}'s Health Projection
                    </h3>
                    <p className="text-purple-300 mt-2">
                      {analysisRaw?.summary ?? healthData?.analysis?.summary ?? 'Personalized projection based on records & lifestyle.'}
                    </p>
                  </div>

                  <div className="backdrop-blur-sm bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                    <div className="text-xs text-purple-300">Updated</div>
                    <div className="font-bold text-white">
                      {(analysisRaw?.generated_on || healthData?.analysis?.generated_on || new Date().toISOString()).slice(0,10)}
                    </div>
                  </div>
                </div>

                {/* Comparison cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Baseline (Current)</div>
                          <div className="text-xl font-bold text-white mt-1">What your records show today</div>
                        </div>
                        <div className="text-xs text-purple-400 backdrop-blur-sm bg-white/5 px-3 py-1 rounded-full">Records</div>
                      </div>

                      <div className="space-y-3">
                        {(healthData?.analysis?.baseline?.predictions ?? []).length > 0 ? (healthData.analysis.baseline.predictions).map((p:any,i:number)=>(
                          <div key={i} className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-bold text-white">{p.condition}</div>
                                <div className="text-xs text-purple-300 mt-1">{p.rationale ?? ''}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">{p.probability_pct ?? p.probability ?? '-'}%</div>
                                <div className="w-24 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      Number(p.probability_pct ?? p.probability) >= 70 ? 'bg-gradient-to-r from-red-400 to-rose-400' : 
                                      Number(p.probability_pct ?? p.probability) >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 
                                      'bg-gradient-to-r from-emerald-400 to-green-400'
                                    }`} 
                                    style={{ width: `${Number(p.probability_pct ?? p.probability)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : <div className="text-sm text-purple-400">No baseline predictions available.</div>}
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full filter blur-3xl opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Projection (With Lifestyle)</div>
                          <div className="text-xl font-bold text-white mt-1">If you keep this routine</div>
                        </div>
                        <div className="text-xs text-emerald-400 backdrop-blur-sm bg-white/5 px-3 py-1 rounded-full">AI Model</div>
                      </div>

                      <div className="space-y-3">
                        {(analysisRaw?.projection?.predictions ?? analysisRaw?.predictions ?? predictions).map((p:any,i:number)=>(
                          <div key={i} className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-bold text-white">{p.condition}</div>
                                <div className="text-xs text-emerald-300 mt-1">{p.rationale ?? ''}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">{p.probability_pct ?? p.probability ?? p.prob ?? 0}%</div>
                                <div className="w-24 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      Number(p.probability_pct ?? p.probability ?? p.prob) >= 70 ? 'bg-gradient-to-r from-red-400 to-rose-400' : 
                                      Number(p.probability_pct ?? p.probability ?? p.prob) >= 50 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 
                                      'bg-gradient-to-r from-emerald-400 to-green-400'
                                    }`} 
                                    style={{ width: `${Number(p.probability_pct ?? p.probability ?? p.prob)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deltas */}
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-purple-200 mb-4">Projected Change Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(deltas.length ? deltas : (predictions.slice(0,3).map(p=>({condition:p.condition, delta_pct:0})))).map((d:any,i:number)=>(
                      <div key={i} className="backdrop-blur-sm bg-white/5 rounded-xl p-5 border border-white/10 hover:scale-105 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Condition</div>
                            <div className="font-bold text-white mt-1">{d.condition}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${d.delta_pct < 0 ? 'text-emerald-400' : d.delta_pct > 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                              {d.delta_pct > 0 ? '+' : ''}{d.delta_pct ?? 0}%
                            </div>
                            <div className="text-xs text-purple-400">vs baseline</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right column */}
          <aside className="space-y-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeInRight">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">AI Explainability</div>
                  <div className="font-bold text-white mt-1">Top Risk Factors</div>
                </div>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-4">
                {topFeatures.length ? topFeatures.map((f:any,i:number)=>(
                  <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-purple-200 text-sm font-medium">{f.feature}</div>
                      <div className="font-bold text-white">{(f.impact ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.abs(f.impact) * 100)}%` }}
                      />
                    </div>
                  </div>
                )) : <div className="text-sm text-purple-400">No feature analysis available.</div>}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeInRight" style={{ animationDelay: '100ms' }}>
              <h4 className="font-bold text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/prevention')} 
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">Start Prevention Program</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => alert('Feature: share with doctor (stub)')} 
                  className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium border border-white/20 transition-all duration-300"
                >
                  Share with Clinician
                </button>
                <button 
                  onClick={() => alert('Feature: schedule consult (stub)')} 
                  className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium border border-white/20 transition-all duration-300"
                >
                  Schedule Consultation
                </button>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl shadow-xl p-6 border border-amber-500/20 animate-fadeInRight" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="font-bold text-amber-200 mb-2">Important Notice</div>
                  <div className="text-sm text-amber-100/80 leading-relaxed">
                    These projections are estimated and intended for guidance only. Consult a clinician for medical decisions.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Detailed timeline */}
        {step === 'results' && (
          <section className="mt-8 animate-fadeIn">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl shadow-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
                Detailed Timeline & Recommendations
              </h3>

              <div className="space-y-6">
                {predictions.map((p, idx) => (
                  <div 
                    key={idx} 
                    className="group backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="backdrop-blur-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">
                            {p.years} {p.years === 1 ? 'year' : 'years'} out
                          </span>
                          {p.preventable && (
                            <span className="backdrop-blur-sm bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                              ✓ Preventable
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-bold text-white mb-2">{p.condition}</div>
                        <div className="text-purple-200">{p.rationale}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-lg backdrop-blur-sm border ${
                            p.probability >= 70 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                            p.probability >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                            'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {p.probability}%
                          </div>
                          <div className="text-xs text-purple-400 mt-2">Risk Level</div>
                        </div>

                        <button 
                          onClick={() => toggleExpand(p.condition)} 
                          className="backdrop-blur-sm bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/20 transition-all duration-300"
                        >
                          <svg 
                            className={`w-5 h-5 text-purple-300 transform transition-transform duration-300 ${expanded[p.condition] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {expanded[p.condition] && (
                      <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
                        <div className="mb-3 text-sm font-bold text-purple-200">Recommended Interventions:</div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {p.interventions.map((it, i) => (
                            <div 
                              key={i} 
                              className="backdrop-blur-sm bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-200 hover:bg-blue-500/20 transition-all duration-300"
                            >
                              <span className="text-blue-400 mr-2">→</span>{it}
                            </div>
                          ))}
                        </div>
                        {p.citations && p.citations.length > 0 && (
                          <div className="mt-4 text-xs text-purple-400">
                            📚 Citations: {p.citations.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
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

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}