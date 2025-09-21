'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Challenge {
  id: string;
  category: 'nutrition' | 'exercise' | 'mindfulness' | 'sleep' | 'hydration';
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  completed: boolean;
  progress: number;
  icon: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  score: number;
  level: number;
  streak: number;
  status: 'online' | 'offline';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export default function PreventionProgramPage() {
  const router = useRouter();
  const [userScore, setUserScore] = useState(1250);
  const [userLevel, setUserLevel] = useState(12);
  const [userStreak, setUserStreak] = useState(7);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [animatedScore, setAnimatedScore] = useState(1250);
  const [levelProgress, setLevelProgress] = useState(0);
  
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([
    {
      id: '1',
      category: 'exercise',
      title: 'Morning Walk Challenge',
      description: 'Take a 30-minute walk before 10 AM',
      points: 50,
      difficulty: 'easy',
      duration: '30 mins',
      completed: false,
      progress: 65,
      icon: '🚶‍♂️'
    },
    {
      id: '2',
      category: 'nutrition',
      title: 'Vegetable Power',
      description: 'Eat 5 servings of vegetables today',
      points: 75,
      difficulty: 'medium',
      duration: 'All day',
      completed: false,
      progress: 40,
      icon: '🥗'
    },
    {
      id: '3',
      category: 'mindfulness',
      title: 'Meditation Moment',
      description: 'Complete a 10-minute guided meditation',
      points: 40,
      difficulty: 'easy',
      duration: '10 mins',
      completed: true,
      progress: 100,
      icon: '🧘‍♀️'
    },
    {
      id: '4',
      category: 'hydration',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water',
      points: 30,
      difficulty: 'easy',
      duration: 'All day',
      completed: false,
      progress: 75,
      icon: '💧'
    },
    {
      id: '5',
      category: 'sleep',
      title: 'Digital Sunset',
      description: 'No screens 1 hour before bed',
      points: 60,
      difficulty: 'hard',
      duration: '1 hour',
      completed: false,
      progress: 0,
      icon: '🌙'
    }
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Sarah Chen', avatar: '👩', score: 2340, level: 18, streak: 15, status: 'online' },
    { id: '2', name: 'Mike Johnson', avatar: '👨', score: 1890, level: 15, streak: 12, status: 'online' },
    { id: '3', name: 'You', avatar: '😊', score: userScore, level: userLevel, streak: userStreak, status: 'online' },
    { id: '4', name: 'Priya Patel', avatar: '👩‍🦱', score: 1250, level: 12, streak: 7, status: 'offline' },
    { id: '5', name: 'Alex Kim', avatar: '🧑', score: 1120, level: 11, streak: 5, status: 'online' },
    { id: '6', name: 'David Brown', avatar: '👨‍🦰', score: 980, level: 9, streak: 3, status: 'offline' }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'First Steps', description: 'Complete your first challenge', icon: '🎯', unlocked: true, date: '2024-01-15' },
    { id: '2', title: 'Week Warrior', description: '7-day streak', icon: '🔥', unlocked: true, date: '2024-01-20' },
    { id: '3', title: 'Healthy Habits', description: 'Complete 10 nutrition challenges', icon: '🥇', unlocked: false },
    { id: '4', title: 'Fitness Enthusiast', description: 'Complete 20 exercise challenges', icon: '💪', unlocked: false }
  ]);

  const [showReward, setShowReward] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Animate level progress
    const progress = ((userScore % 100) / 100) * 100;
    setTimeout(() => setLevelProgress(progress), 100);
  }, [userScore]);

  // Update friends list when user score changes
  useEffect(() => {
    setFriends(prev => prev.map(f => 
      f.name === 'You' ? {...f, score: userScore, level: userLevel, streak: userStreak} : f
    ));
  }, [userScore, userLevel, userStreak]);

  useEffect(() => {
    // Animate score on change
    if (animatedScore !== userScore) {
      const diff = userScore - animatedScore;
      const steps = 20;
      const increment = diff / steps;
      let current = animatedScore;
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= userScore) || (increment < 0 && current <= userScore)) {
          setAnimatedScore(userScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, 30);
      
      return () => clearInterval(timer);
    }
  }, [userScore, animatedScore]);

  const completeChallenge = (challengeId: string) => {
    setDailyChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        setEarnedPoints(challenge.points);
        const newScore = userScore + challenge.points;
        setUserScore(newScore);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
        
        // Check for level up
        if (Math.floor(newScore / 100) > userLevel) {
          setUserLevel(level => level + 1);
          setTimeout(() => {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
          }, 1000);
        }
        
        return { ...challenge, completed: true, progress: 100 };
      }
      return challenge;
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch(category) {
      case 'exercise': return 'from-orange-400 to-red-500';
      case 'nutrition': return 'from-emerald-400 to-green-500';
      case 'mindfulness': return 'from-teal-400 to-cyan-500';
      case 'sleep': return 'from-indigo-400 to-blue-500';
      case 'hydration': return 'from-sky-400 to-blue-500';
      default: return 'from-teal-400 to-cyan-500';
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'exercise', label: 'Exercise', icon: '🏃‍♂️' },
    { id: 'nutrition', label: 'Nutrition', icon: '🍎' },
    { id: 'mindfulness', label: 'Mind', icon: '🧘‍♀️' },
    { id: 'sleep', label: 'Sleep', icon: '🌙' },
    { id: 'hydration', label: 'Water', icon: '💧' }
  ];

  const filteredChallenges = selectedCategory === 'all' 
    ? dailyChallenges 
    : dailyChallenges.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-sky-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Score */}
      <header className="relative backdrop-blur-xl bg-white/85 border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-6 animate-fadeInLeft">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Prevention Challenge Hub
              </h1>
            </div>
            
            {/* User Stats Bar */}
            <div className="flex items-center space-x-6 animate-fadeInRight">
              <div className="bg-white/90 rounded-2xl px-4 py-3 border border-teal-200 hover:scale-105 transition-all duration-300 shadow-md">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl animate-pulse">🏆</span>
                  <div>
                    <p className="text-xs text-teal-600 font-bold">Score</p>
                    <p className="text-2xl font-bold text-slate-800">{animatedScore.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 rounded-2xl px-4 py-3 border border-amber-200 hover:scale-105 transition-all duration-300 shadow-md">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="text-xs text-amber-600 font-bold">Level</p>
                    <p className="text-2xl font-bold text-amber-700">{userLevel}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 rounded-2xl px-4 py-3 border border-orange-200 hover:scale-105 transition-all duration-300 shadow-md">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl animate-pulse-slow">🔥</span>
                  <div>
                    <p className="text-xs text-orange-600 font-bold">Streak</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {userStreak} <span className="text-sm">days</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Level Progress Bar */}
          <div className="mt-6 bg-white/70 rounded-2xl p-4 border border-slate-200">
            <div className="flex justify-between text-sm text-slate-600 mb-2 font-semibold">
              <span>Level {userLevel}</span>
              <span className="text-teal-600">{userScore % 100}/100 XP to Level {userLevel + 1}</span>
            </div>
            <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="absolute inset-0 bg-teal-100 animate-pulse"></div>
              <div 
                className="relative bg-gradient-to-r from-teal-400 to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${levelProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Challenges */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <div className="bg-white/95 rounded-2xl p-5 shadow-xl border border-slate-200 animate-fadeIn">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group flex items-center space-x-2 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 animate-fadeInUp ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-xl group-hover:animate-bounce">{category.icon}</span>
                    <span className="font-bold">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent animate-fadeInLeft">
                Today's Challenges
              </h2>
              {filteredChallenges.map((challenge, index) => (
                <div 
                  key={challenge.id} 
                  className={`group bg-white/95 rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 hover:scale-[1.02] animate-fadeInUp ${
                    challenge.completed 
                      ? 'border-emerald-400 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative">
                        <span className="text-4xl">{challenge.icon}</span>
                        {challenge.completed && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-xl text-slate-800">{challenge.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4">{challenge.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="flex items-center text-slate-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {challenge.duration}
                          </span>
                          <span className="flex items-center font-bold text-amber-600">
                            ⚡ +{challenge.points} pts
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-slate-500 mb-2 font-semibold">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                challenge.completed 
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500' 
                                  : `bg-gradient-to-r ${getCategoryGradient(challenge.category)}`
                              }`}
                              style={{ width: `${challenge.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      disabled={challenge.completed}
                      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                        challenge.completed
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-xl'
                      }`}
                    >
                      {challenge.completed ? '✓ Completed' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-slate-200 animate-fadeIn">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={achievement.id}
                    className={`group text-center p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 animate-fadeInUp ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400' 
                        : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-4xl group-hover:animate-bounce inline-block">{achievement.icon}</span>
                    <p className="font-bold text-sm mt-3 text-slate-800">{achievement.title}</p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-slate-500 mt-1">{achievement.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            {/* Friends Leaderboard */}
            <div className="bg-white/95 rounded-2xl shadow-xl p-6 border border-slate-200 animate-fadeInRight">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center">
                <span className="mr-3 text-3xl">🏅</span> Friend Leaderboard
              </h2>
              
              <div className="space-y-3">
                {friends
                  .map(f => f.name === 'You' ? {...f, score: userScore, level: userLevel, streak: userStreak} : f)
                  .sort((a, b) => b.score - a.score)
                  .map((friend, index) => (
                    <div 
                      key={friend.id}
                      className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] animate-fadeInUp ${
                        friend.name === 'You'
                          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300'
                          : 'bg-white border border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-xl font-bold w-8 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-500' :
                          'text-slate-500'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </span>
                        <span className="text-3xl">{friend.avatar}</span>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center">
                            {friend.name}
                            {friend.status === 'online' && (
                              <span className="ml-2 relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <span>Lvl {friend.level}</span>
                            <span className="text-orange-600">🔥 {friend.streak}d</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-teal-600 text-lg">
                        {friend.score.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Challenge a Friend
              </button>
            </div>

            {/* Community Challenge */}
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl shadow-xl p-6 text-white animate-fadeInRight" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
              <h3 className="font-bold text-xl mb-3 relative z-10">🌟 Community Challenge</h3>
              <p className="text-sky-100 mb-4 relative z-10">Walk 1 Million Steps Together!</p>
              <div className="mb-4 relative z-10">
                <div className="flex justify-between text-xs text-sky-100 mb-2 font-semibold">
                  <span>Community Progress</span>
                  <span>742,350 / 1,000,000</span>
                </div>
                <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: '74%' }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-sky-100 relative z-10">
                <span>👥 234 participants</span>
                <span>⏱ 3 days left</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-10 transform animate-bounceIn pointer-events-auto">
            <div className="text-center">
              <span className="text-7xl inline-block animate-spin-slow">🎉</span>
              <h2 className="text-3xl font-bold text-white mt-4">Challenge Complete!</h2>
              <p className="text-5xl font-bold text-white mt-3">
                +{earnedPoints}
              </p>
              <p className="text-emerald-100 mt-3 text-lg">Keep up the great work!</p>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Popup */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl p-10 transform animate-bounceIn pointer-events-auto">
            <div className="text-center">
              <span className="text-7xl inline-block animate-pulse">⭐</span>
              <h2 className="text-3xl font-bold text-white mt-4">LEVEL UP!</h2>
              <p className="text-5xl font-bold text-white mt-3">Level {userLevel}</p>
              <p className="text-amber-100 mt-3 text-lg">New challenges unlocked!</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
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

        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
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

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}