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

  // -- fallback generator (simple, deterministic)
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

  // Normalize model item
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

      // use projection if available, else fallback to predictions
      const modelPredicts = (analysis?.projection?.predictions && Array.isArray(analysis.projection.predictions))
        ? analysis.projection.predictions
        : (analysis?.predictions && Array.isArray(analysis.predictions))
          ? analysis.predictions
          : [];

      const normalized = modelPredicts.map(normalizePredictionItem);
      setPredictions(normalized.length ? normalized : generatePredictionsFallback(lifestyleData, healthData));

      // persist payload for prevention page
      sessionStorage.setItem('prevention_payload', JSON.stringify({
        predictions: normalized.length ? normalized : generatePredictionsFallback(lifestyleData, healthData),
        lifestyleData,
        healthData,
        analysis
      }));

      // update healthData with analysis so dashboard shows it
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-indigo-50 pb-12">
      <header className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Personalized Comorbidity Dashboard</h1>
            <p className="text-indigo-100 mt-2 max-w-2xl">
              Hi <span className="font-semibold">{userName}</span> — {heroSummary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm">Back to Dashboard</button>
            <button
              onClick={() => { setStep('lifestyle'); setError(null); }}
              className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold shadow">
              Edit Lifestyle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Form / Results */}
          <section className="lg:col-span-2 space-y-6">
            {/* Big Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-indigo-500">
                <div className="text-xs text-gray-500">Health Score</div>
                <div className="text-3xl font-extrabold">{healthData?.gamificationData?.healthScore ?? '—'}</div>
                <div className="text-sm text-gray-400 mt-2">Current overall wellness index</div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-emerald-400">
                <div className="text-xs text-gray-500">Streak</div>
                <div className="text-3xl font-extrabold text-emerald-600">{healthData?.gamificationData?.streakDays ?? 0}d</div>
                <div className="text-sm text-gray-400 mt-2">Healthy habit streak</div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-400">
                <div className="text-xs text-gray-500">Top Risk</div>
                <div className="text-3xl font-extrabold text-yellow-600">{healthData?.riskFactors ? Object.keys(healthData.riskFactors)[0] : '—'}</div>
                <div className="text-sm text-gray-400 mt-2">Most pressing risk by score</div>
              </div>
            </div>

            {/* Middle: Interactive area */}
            {step === 'lifestyle' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Update lifestyle to see projections</h2>
                  <div className="text-sm text-gray-500">Your selections will be used to create a projection</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { k: 'exercise', label: 'Exercise' , opts: [['','Choose'],['none','None'],['rare','1-2/mo'],['moderate','1-2/wk'],['regular','3-4/wk'],['daily','Daily']] },
                    { k: 'diet', label: 'Diet' , opts: [['','Choose'],['poor','Mostly processed'],['average','Average'],['good','Balanced'],['excellent','Excellent']] },
                    { k: 'sleep', label: 'Sleep', opts: [['','Choose'],['less5','<5h'],['5-6','5-6h'],['6-7','6-7h'],['7-8','7-8h'],['more8','>8h']] },
                    { k: 'stress', label: 'Stress', opts: [['','Choose'],['low','Low'],['moderate','Moderate'],['high','High'],['chronic','Chronic']] },
                    { k: 'smoking', label: 'Smoking', opts: [['','Choose'],['never','Never'],['former','Former'],['occasional','Occasional'],['yes','Regular']] },
                    { k: 'alcohol', label: 'Alcohol', opts: [['','Choose'],['none','None'],['occasional','Occasional'],['moderate','1-2/wk'],['regular','3-5/wk'],['heavy','Daily']] },
                    { k: 'waterIntake', label: 'Water', opts: [['','Choose'],['less1L','<1L'],['1-2L','1-2L'],['2-3L','2-3L'],['more3L','>3L']] },
                    { k: 'screenTime', label: 'Screen time', opts: [['','Choose'],['less2','<2h'],['2-4','2-4h'],['4-8','4-8h'],['more8','>8h']] }
                  ].map((f) => (
                    <div key={f.k}>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">{f.label}</label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={(lifestyleData as any)[f.k]}
                        onChange={(e) => setLifestyleData(prev => ({ ...prev, [f.k]: e.target.value }))}
                      >
                        {f.opts.map((o:any, i:number)=> <option key={i} value={o[0]}>{o[1]}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleLifestyleSubmit}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:brightness-105 disabled:opacity-60"
                  >
                    {isAnalyzing ? 'Analyzing…' : 'Project my risk'}
                  </button>
                  <button onClick={() => router.push('/dashboard')} className="px-4 py-3 border rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            {step === 'analysis' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 animate-pulse mb-4" />
                <h3 className="text-xl font-semibold">Creating your projection</h3>
                <p className="text-sm text-gray-500 mt-2">We combine your historical health data with the lifestyle you selected to estimate baseline and projection scenarios.</p>
              </div>
            )}

            {step === 'results' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{userName}'s Health Projection</h3>
                    <p className="text-sm text-gray-500 mt-1">{analysisRaw?.summary ?? healthData?.analysis?.summary ?? 'Personalized projection based on records & lifestyle.'}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">Updated</div>
                    <div className="font-semibold">{(analysisRaw?.generated_on || healthData?.analysis?.generated_on || new Date().toISOString()).slice(0,10)}</div>
                  </div>
                </div>

                {/* big comparison cards */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gradient-to-br from-white to-indigo-50 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Baseline (current)</div>
                        <div className="text-lg font-bold">What your records show today</div>
                      </div>
                      <div className="text-sm text-gray-600">Source: Records</div>
                    </div>

                    <div className="space-y-3">
                      {(healthData?.analysis?.baseline?.predictions ?? []).length > 0 ? (healthData.analysis.baseline.predictions).map((p:any,i:number)=>(
                        <div key={i} className="flex items-center justify-between gap-4 bg-white rounded-lg p-3 border">
                          <div>
                            <div className="text-sm font-semibold">{p.condition}</div>
                            <div className="text-xs text-gray-500">{p.rationale ?? ''}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{p.probability_pct ?? p.probability ?? '-' }%</div>
                            <div className="w-36 h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                              <div className={`h-2 ${Number(p.probability_pct ?? p.probability) >= 70 ? 'bg-red-500' : Number(p.probability_pct ?? p.probability) >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${Number(p.probability_pct ?? p.probability)}%` }} />
                            </div>
                          </div>
                        </div>
                      )) : <div className="text-sm text-gray-400">No baseline predictions available.</div>}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-white to-emerald-50 rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Projection (with chosen lifestyle)</div>
                        <div className="text-lg font-bold">If you keep this routine</div>
                      </div>
                      <div className="text-sm text-gray-600">Modeled by LLM</div>
                    </div>

                    <div className="space-y-3">
                      {(analysisRaw?.projection?.predictions ?? analysisRaw?.predictions ?? predictions).map((p:any,i:number)=>(
                        <div key={i} className="flex items-center justify-between gap-4 bg-white rounded-lg p-3 border">
                          <div>
                            <div className="text-sm font-semibold">{p.condition}</div>
                            <div className="text-xs text-gray-500">{p.rationale ?? ''}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{p.probability_pct ?? p.probability ?? p.prob ?? 0}%</div>
                            <div className="w-36 h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                              <div className={`h-2 ${Number(p.probability_pct ?? p.probability ?? p.prob) >= 70 ? 'bg-red-500' : Number(p.probability_pct ?? p.probability ?? p.prob) >= 50 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${Number(p.probability_pct ?? p.probability ?? p.prob)}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* deltas */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Projected Change</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(deltas.length ? deltas : (predictions.slice(0,3).map(p=>({condition:p.condition, delta_pct:0})))) .map((d:any,i:number)=>(
                      <div key={i} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500">Condition</div>
                          <div className="font-semibold">{d.condition}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${d.delta_pct < 0 ? 'text-green-600' : 'text-red-600'}`}>{d.delta_pct ?? 0}%</div>
                          <div className="text-xs text-gray-400">vs baseline</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right column: explainability + quick actions */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-5 border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Explainability</div>
                  <div className="font-semibold">Top features impacting risk</div>
                </div>
                <div className="text-sm text-gray-500">Insights</div>
              </div>

              <div className="mt-4 space-y-3">
                {topFeatures.length ? topFeatures.map((f:any,i:number)=>(
                  <div key={i} className="text-sm">
                    <div className="flex justify-between">
                      <div className="text-gray-700">{f.feature}</div>
                      <div className="font-semibold">{(f.impact ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                      <div className="h-2 bg-indigo-500" style={{ width: `${Math.min(100, Math.abs(f.impact) * 100)}%` }} />
                    </div>
                  </div>
                )) : <div className="text-sm text-gray-400">No features available.</div>}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border">
              <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
              <div className="space-y-3">
                <button onClick={()=> router.push('/prevention')} className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg">Start Prevention Program</button>
                <button onClick={()=> alert('Feature: share with doctor (stub)')} className="w-full px-3 py-2 border rounded-lg">Share with clinician</button>
                <button onClick={()=> alert('Feature: schedule consult (stub)')} className="w-full px-3 py-2 border rounded-lg">Schedule Consultation</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border text-sm text-gray-600">
              <div className="font-semibold mb-2">Notes</div>
              <div>These projections are estimated and intended for guidance only. Consult a clinician for medical decisions.</div>
            </div>
          </aside>
        </div>

        {/* Detailed timeline */}
        {step === 'results' && (
          <section className="mt-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Detailed Timeline & Recommendations</h3>

              <div className="space-y-4">
                {predictions.map((p, idx) => (
                  <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500">{p.years} {p.years === 1 ? 'year' : 'years'} out</div>
                      <div className="text-lg font-semibold">{p.condition}</div>
                      <div className="text-sm text-gray-600 mt-1">{p.rationale}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`inline-block px-3 py-1 rounded-full ${p.probability >= 70 ? 'bg-red-100 text-red-700' : p.probability >=50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {p.probability}% risk
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{p.preventable ? 'Preventable' : 'Not preventable'}</div>
                      </div>

                      <div className="text-right">
                        <button onClick={()=>toggleExpand(p.condition)} className="text-sm text-indigo-600 underline">
                          {expanded[p.condition] ? 'Hide interventions' : 'Show interventions'}
                        </button>
                      </div>
                    </div>

                    {expanded[p.condition] && (
                      <div className="mt-3 md:mt-0 md:col-span-2 w-full">
                        <div className="bg-gray-50 p-3 rounded-md grid md:grid-cols-2 gap-3">
                          {p.interventions.map((it, i) => (
                            <div key={i} className="text-sm bg-white p-2 rounded border">{it}</div>
                          ))}
                        </div>
                        {p.citations && p.citations.length > 0 && <div className="text-xs text-gray-500 mt-2">Citations: {p.citations.join(', ')}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
