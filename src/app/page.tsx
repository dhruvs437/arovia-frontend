'use client'
import React, { useState, ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export default function Home() {
  const [abhaId, setAbhaId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formatAbhaId = (value: string): string => {
    // Remove all non-numeric characters
    const numbers: string = value.replace(/[^0-9]/g, '');
    
    // Format as XX-XXXX-XXXX-XXXX
    let formatted: string = '';
    for (let i = 0; i < numbers.length && i < 14; i++) {
      if (i === 2 || i === 6 || i === 10) {
        formatted += '-';
      }
      formatted += numbers[i];
    }
    return formatted;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const formatted: string = formatAbhaId(e.target.value);
    setAbhaId(formatted);
  };

  const handleSubmit = async () => {
    const cleanId = abhaId.replace(/-/g, '');
    
    if (cleanId.length !== 14) {
      alert('Please enter a valid 14-digit ABHA number');
      return;
    }

    setIsLoading(true);
    
    // Store ABHA ID and redirect to verification
    sessionStorage.setItem('abhaId', cleanId);
    window.location.href = '/verify';
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const progress: number = (abhaId.replace(/-/g, '').length / 14) * 100;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-sky-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 relative z-10">
        {/* Progress bar */}
        <div className="h-1 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent text-center mb-2">
          Enter ABHA ID
        </h1>
        
        <p className="text-slate-600 text-center mb-8">
          Access your unified health records
        </p>

        <div>
          <div className="mb-6">
            <label 
              htmlFor="abha-input"
              className="block text-xs font-bold text-teal-700 uppercase tracking-wider mb-2"
            >
              ABHA Number
            </label>
            <input
              id="abha-input"
              type="text"
              value={abhaId}
              onChange={handleInputChange}
              placeholder="14-1234-5678-9012"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-slate-700 font-medium text-lg bg-white hover:border-teal-400"
              maxLength={17}
              autoComplete="off"
              onKeyPress={handleKeyPress}
              aria-label="ABHA ID Input"
              aria-describedby="abha-helper-text"
            />
            <p 
              id="abha-helper-text"
              className="flex items-center text-xs text-slate-500 mt-2"
            >
              <span className="mr-1">🔒</span>
              Your data is encrypted and secure
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transform hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-600"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin h-5 w-5 mr-3" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none" 
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              'Continue with ABHA'
            )}
          </button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">OR</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-600 mb-3">
            Don&apos;t have an ABHA ID?
          </p>
          <a
            href="https://abha.abdm.gov.in/abha/v3/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl transition-all duration-200 group border border-slate-300"
          >
            <span className="mr-2">🆔</span>
            Create ABHA ID
            <svg 
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-center text-xs text-slate-500">
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Need help? 
            <a 
              href="#" 
              className="ml-1 text-teal-600 hover:text-teal-700 font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </main>
  );
}