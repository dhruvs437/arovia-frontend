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
    { id: '3', name: 'Priya Patel', avatar: '👩‍🦱', score: 1250, level: 12, streak: 7, status: 'offline' },
    { id: '4', name: 'Alex Kim', avatar: '🧑', score: 1120, level: 11, streak: 5, status: 'online' },
    { id: '5', name: 'David Brown', avatar: '👨‍🦰', score: 980, level: 9, streak: 3, status: 'offline' }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'First Steps', description: 'Complete your first challenge', icon: '🎯', unlocked: true, date: '2024-01-15' },
    { id: '2', title: 'Week Warrior', description: '7-day streak', icon: '🔥', unlocked: true, date: '2024-01-20' },
    { id: '3', title: 'Healthy Habits', description: 'Complete 10 nutrition challenges', icon: '🥇', unlocked: false },
    { id: '4', title: 'Fitness Enthusiast', description: 'Complete 20 exercise challenges', icon: '💪', unlocked: false }
  ]);

  const [showReward, setShowReward] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const completeChallenge = (challengeId: string) => {
    setDailyChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        setEarnedPoints(challenge.points);
        setUserScore(score => score + challenge.points);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
        
        // Check for level up
        if ((userScore + challenge.points) > userLevel * 100) {
          setUserLevel(level => level + 1);
        }
        
        return { ...challenge, completed: true, progress: 100 };
      }
      return challenge;
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const calculateLevelProgress = () => {
    return ((userScore % 100) / 100) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header with Score */}
      <header className="bg-white shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Prevention Challenge Hub</h1>
            </div>
            
            {/* User Stats Bar */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-bold text-purple-600">{userScore.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="text-xl font-bold text-blue-600">{userLevel}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-xl font-bold text-orange-600">{userStreak} days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Level Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Level {userLevel}</span>
              <span>{userScore % 100}/100 XP to Level {userLevel + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${calculateLevelProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Challenges */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Today's Challenges</h2>
              {filteredChallenges.map(challenge => (
                <div 
                  key={challenge.id} 
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                    challenge.completed ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-3xl">{challenge.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{challenge.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{challenge.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center text-gray-500">
                            ⏱ {challenge.duration}
                          </span>
                          <span className="flex items-center text-purple-600 font-semibold">
                            ⚡ +{challenge.points} pts
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                challenge.completed ? 'bg-green-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      disabled={challenge.completed}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        challenge.completed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
                      }`}
                    >
                      {challenge.completed ? '✓ Completed' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`text-center p-4 rounded-lg border-2 ${
                      achievement.unlocked 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <p className="font-semibold text-sm mt-2">{achievement.title}</p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-6">
            {/* Friends Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🏅</span> Friend Leaderboard
              </h2>
              
              <div className="space-y-3">
                {friends
                  .sort((a, b) => b.score - a.score)
                  .map((friend, index) => (
                    <div 
                      key={friend.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        friend.name === 'Priya Patel' // Highlight current user
                          ? 'bg-purple-100 border-2 border-purple-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <span className="text-2xl">{friend.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center">
                            {friend.name}
                            {friend.status === 'online' && (
                              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>Lvl {friend.level}</span>
                            <span>🔥 {friend.streak}d</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-purple-600">
                        {friend.score.toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>

              <button className="w-full mt-4 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-lg transition-colors">
                Challenge a Friend
              </button>
            </div>

            {/* Community Challenge */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-3">🌟 Community Challenge</h3>
              <p className="text-sm mb-3">Walk 1 Million Steps Together!</p>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>742,350 / 1,000,000</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full"
                    style={{ width: '74%' }}
                  />
                </div>
              </div>
              <p className="text-xs">234 participants • 3 days left</p>
            </div>
          </div>
        </div>
      </main>

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-8 transform animate-bounce pointer-events-auto">
            <div className="text-center">
              <span className="text-6xl">🎉</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-4">Challenge Complete!</h2>
              <p className="text-3xl font-bold text-purple-600 mt-2">+{earnedPoints} Points</p>
              <p className="text-gray-600 mt-2">Keep up the great work!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}