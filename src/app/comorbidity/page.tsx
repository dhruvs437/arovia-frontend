'use client'
import React, { useState, useEffect } from 'react';
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
};

export default function ComorbidityPage() {
  const router = useRouter();
  const [step, setStep] = useState<'lifestyle' | 'analysis' | 'results'>('lifestyle');
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionTimeline[]>([]);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('healthData');
    if (!storedData) {
      router.push('/dashboard');
      return;
    }
    setHealthData(JSON.parse(storedData));
  }, [router]);

  const handleLifestyleSubmit = () => {
    setStep('analysis');
    setIsAnalyzing(true);
    
    // Simulate ML model analysis
    setTimeout(() => {
      // Generate predictions based on lifestyle and health metrics
      const generatedPredictions = generatePredictions(lifestyleData, healthData);
      setPredictions(generatedPredictions);
      setIsAnalyzing(false);
      setStep('results');
    }, 3000);
  };

  const generatePredictions = (lifestyle: LifestyleData, health: any): PredictionTimeline[] => {
    const baseRisk = health?.riskFactors?.diabetes?.score || 75;
    
    const predictions: PredictionTimeline[] = [];

    const exerciseModifier = lifestyle.exercise === 'none' ? 1.3 : lifestyle.exercise === 'moderate' ? 0.9 : 0.7;
    const dietModifier = lifestyle.diet === 'poor' ? 1.4 : lifestyle.diet === 'average' ? 1.0 : 0.8;
    const sleepModifier = lifestyle.sleep === 'less5' ? 1.2 : lifestyle.sleep === '6-7' ? 1.0 : 0.9;
    
    if (baseRisk > 60) {
      predictions.push({
        years: 2,
        condition: 'Type 2 Diabetes',
        probability: Math.min(95, Math.round(baseRisk * exerciseModifier * dietModifier)),
        preventable: true,
        interventions: ['Dietary changes', 'Exercise routine', 'Weight management']
      });
    }

    if (health?.riskFactors?.hypertension?.score > 50) {
      predictions.push({
        years: 3,
        condition: 'Chronic Hypertension',
        probability: Math.min(85, Math.round(health.riskFactors.hypertension.score * sleepModifier)),
        preventable: true,
        interventions: ['Stress management', 'Reduce sodium', 'Regular monitoring']
      });
    }

    predictions.push({
      years: 5,
      condition: 'Cardiovascular Disease',
      probability: Math.min(75, Math.round((baseRisk * 0.8) * exerciseModifier)),
      preventable: true,
      interventions: ['Cardiac screening', 'Cholesterol management', 'Lifestyle modification']
    });

    if (lifestyle.smoking === 'yes') {
      predictions.push({
        years: 7,
        condition: 'Respiratory Issues',
        probability: 65,
        preventable: true,
        interventions: ['Smoking cessation program', 'Lung function tests']
      });
    }

    predictions.push({
      years: 10,
      condition: 'Kidney Disease',
      probability: Math.min(60, Math.round(baseRisk * 0.6)),
      preventable: true,
      interventions: ['Blood pressure control', 'Regular kidney function tests']
    });

    return predictions.sort((a, b) => a.years - b.years);
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 70) return 'bg-red-500';
    if (probability >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // NEW: navigate to Prevention page with stored predictions + lifestyle + healthData
  const goToPrevention = () => {
    try {
      // Save the data that Prevention page may need
      sessionStorage.setItem('prevention_payload', JSON.stringify({
        predictions,
        lifestyleData,
        healthData
      }));
      // navigate to prevention route (adjust path if your route is different)
      router.push('/prevention');
    } catch (err) {
      console.error('Failed to store prevention payload', err);
      // fallback: navigate anyway
      router.push('/prevention');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comorbidity Risk Analysis</h1>
              <p className="text-gray-600 mt-1">AI-Powered Health Predictions</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === 'lifestyle' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            {/* ... same lifestyle form ... */}
            {/* (kept identical to your version for brevity) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Exercise */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Frequency</label>
                <select
                  value={lifestyleData.exercise}
                  onChange={(e) => setLifestyleData({...lifestyleData, exercise: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select frequency</option>
                  <option value="none">No exercise</option>
                  <option value="rare">1-2 times/month</option>
                  <option value="moderate">1-2 times/week</option>
                  <option value="regular">3-4 times/week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Diet */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diet Quality</label>
                <select
                  value={lifestyleData.diet}
                  onChange={(e) => setLifestyleData({...lifestyleData, diet: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select diet quality</option>
                  <option value="poor">Mostly processed/fast food</option>
                  <option value="average">Mixed diet</option>
                  <option value="good">Balanced with vegetables</option>
                  <option value="excellent">Whole foods, plant-based</option>
                </select>
              </div>

              {/* Sleep */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Average Sleep Duration</label>
                <select
                  value={lifestyleData.sleep}
                  onChange={(e) => setLifestyleData({...lifestyleData, sleep: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select sleep hours</option>
                  <option value="less5">Less than 5 hours</option>
                  <option value="5-6">5-6 hours</option>
                  <option value="6-7">6-7 hours</option>
                  <option value="7-8">7-8 hours</option>
                  <option value="more8">More than 8 hours</option>
                </select>
              </div>

              {/* Stress */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stress Level</label>
                <select
                  value={lifestyleData.stress}
                  onChange={(e) => setLifestyleData({...lifestyleData, stress: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select stress level</option>
                  <option value="low">Low stress</option>
                  <option value="moderate">Moderate stress</option>
                  <option value="high">High stress</option>
                  <option value="chronic">Chronic/severe stress</option>
                </select>
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking Status</label>
                <select
                  value={lifestyleData.smoking}
                  onChange={(e) => setLifestyleData({...lifestyleData, smoking: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="occasional">Occasional</option>
                  <option value="yes">Regular smoker</option>
                </select>
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alcohol Consumption</label>
                <select
                  value={lifestyleData.alcohol}
                  onChange={(e) => setLifestyleData({...lifestyleData, alcohol: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select consumption</option>
                  <option value="none">No alcohol</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">1-2 drinks/week</option>
                  <option value="regular">3-5 drinks/week</option>
                  <option value="heavy">Daily/heavy</option>
                </select>
              </div>

              {/* Water Intake */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Water Intake</label>
                <select
                  value={lifestyleData.waterIntake}
                  onChange={(e) => setLifestyleData({...lifestyleData, waterIntake: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select water intake</option>
                  <option value="less1L">Less than 1L</option>
                  <option value="1-2L">1-2 Liters</option>
                  <option value="2-3L">2-3 Liters</option>
                  <option value="more3L">More than 3L</option>
                </select>
              </div>

              {/* Screen Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Screen Time</label>
                <select
                  value={lifestyleData.screenTime}
                  onChange={(e) => setLifestyleData({...lifestyleData, screenTime: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select screen time</option>
                  <option value="less2">Less than 2 hours</option>
                  <option value="2-4">2-4 hours</option>
                  <option value="4-8">4-8 hours</option>
                  <option value="more8">More than 8 hours</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleLifestyleSubmit}
              disabled={!Object.values(lifestyleData).every(val => val !== '')}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Analyze My Risk Profile →
            </button>
          </div>
        )}

        {step === 'analysis' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 text-center">
            <div className="py-16">
              <div className="animate-pulse mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyzing Your Health Data</h2>
              <p className="text-gray-600 mb-2">Processing lifestyle factors...</p>
              <p className="text-gray-600 mb-2">Running predictive models...</p>
              <p className="text-gray-600">Generating personalized timeline...</p>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-8">
            {/* Risk Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Comorbidity Risk Timeline</h2>
              <p className="text-gray-600 mb-8">
                Based on your current health metrics and lifestyle, here's your predicted health timeline if current patterns continue:
              </p>

              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div className="space-y-8">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`absolute left-6 w-4 h-4 rounded-full ${getRiskColor(prediction.probability)} ring-4 ring-white`}></div>
                      <div className="ml-16 flex-1">
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-sm font-semibold text-purple-600">
                                {prediction.years} {prediction.years === 1 ? 'Year' : 'Years'} from now
                              </span>
                              <h3 className="text-xl font-bold text-gray-800 mt-1">{prediction.condition}</h3>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                prediction.probability >= 70 ? 'bg-red-100 text-red-800' :
                                prediction.probability >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>{prediction.probability}% Risk</span>
                              {prediction.preventable && <p className="text-xs text-green-600 mt-1">✓ Preventable</p>}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Interventions:</p>
                            <div className="flex flex-wrap gap-2">
                              {prediction.interventions.map((intervention, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{intervention}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Personalized Prevention Plan</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="text-2xl mb-3">🍎</div>
                  <h3 className="font-bold text-gray-800 mb-2">Nutrition</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Reduce processed foods</li>
                    <li>• Increase fiber intake</li>
                    <li>• Monitor portion sizes</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <div className="text-2xl mb-3">🏃‍♂️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Exercise</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 150 min/week moderate activity</li>
                    <li>• Strength training 2x/week</li>
                    <li>• Daily 10-minute walks</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <div className="text-2xl mb-3">🧘‍♀️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Lifestyle</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 7-8 hours sleep</li>
                    <li>• Stress management</li>
                    <li>• Regular check-ups</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={goToPrevention}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Start Prevention Program
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                  Consult with Doctor
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> These predictions are based on statistical models and current health trends. 
                They are not definitive diagnoses. Please consult with healthcare professionals for personalized medical advice.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
