// Mock ABHA profiles for hackathon demo
export const mockABHAProfiles: Record<string, any> = {
    "14123456789012": {
      healthIdNumber: "14-1234-5678-9012",
      healthId: "john.doe@sbx",
      name: "John Doe",
      gender: "Male",
      dateOfBirth: "15-08-1979",
      mobile: "9876543210",
      email: "john.doe@example.com",
      address: {
        line: "123 Main Street",
        district: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }
    },
    "91234567890123": {
      healthIdNumber: "91-2345-6789-0123",
      healthId: "priya.sharma@sbx",
      name: "Priya Sharma",
      gender: "Female",
      dateOfBirth: "22-03-1985",
      mobile: "9876543211",
      email: "priya.sharma@example.com",
      address: {
        line: "456 Park Avenue",
        district: "Delhi",
        state: "Delhi",
        pincode: "110001"
      }
    },
    "78901234567890": {
      healthIdNumber: "78-9012-3456-7890",
      healthId: "raj.patel@sbx",
      name: "Raj Patel",
      gender: "Male",
      dateOfBirth: "10-11-1970",
      mobile: "9876543212",
      email: "raj.patel@example.com",
      address: {
        line: "789 Lake View",
        district: "Bangalore",
        state: "Karnataka",
        pincode: "560001"
      }
    }
  };
  
  // Mock health records for each ABHA ID
  export const mockHealthRecords: Record<string, any> = {
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
    },
    "91234567890123": {
      records: [
        {
          type: 'Prescription',
          date: '2024-01-20',
          doctor: 'Dr. Kumar',
          hospital: 'Max Healthcare',
          medications: [
            { name: 'Iron Supplement', dosage: '200mg', frequency: 'Once daily' }
          ]
        },
        {
          type: 'Lab Report',
          date: '2024-01-18',
          tests: [
            { name: 'Hemoglobin', value: '10.5 g/dL', normal: '12-16 g/dL', status: 'low' },
            { name: 'Blood Pressure', value: '110/70', normal: '< 120/80', status: 'normal' },
            { name: 'Blood Sugar', value: '95 mg/dL', normal: '< 100 mg/dL', status: 'normal' }
          ]
        }
      ],
      riskFactors: {
        diabetes: { risk: 'Low', score: 25, trend: 'stable' },
        hypertension: { risk: 'Low', score: 20, trend: 'stable' },
        anemia: { risk: 'High', score: 70, trend: 'improving' }
      },
      gamificationData: {
        healthScore: 78,
        streakDays: 45,
        badges: ['Iron Warrior', 'Consistency Champion', 'Month Master'],
        challenges: ['Iron Rich Diet Plan', 'Yoga Challenge'],
        communityRank: 89
      }
    },
    "78901234567890": {
      records: [
        {
          type: 'Prescription',
          date: '2024-01-12',
          doctor: 'Dr. Reddy',
          hospital: 'Fortis Hospital',
          medications: [
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
            { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily' }
          ]
        },
        {
          type: 'Lab Report',
          date: '2024-01-08',
          tests: [
            { name: 'Total Cholesterol', value: '245 mg/dL', normal: '< 200 mg/dL', status: 'high' },
            { name: 'LDL', value: '160 mg/dL', normal: '< 100 mg/dL', status: 'high' },
            { name: 'Blood Pressure', value: '135/85', normal: '< 120/80', status: 'borderline' }
          ]
        }
      ],
      riskFactors: {
        diabetes: { risk: 'Medium', score: 45, trend: 'stable' },
        hypertension: { risk: 'Medium', score: 50, trend: 'improving' },
        cardiovascular: { risk: 'High', score: 80, trend: 'improving' }
      },
      gamificationData: {
        healthScore: 55,
        streakDays: 8,
        badges: ['Comeback Kid', 'Heart Hero'],
        challenges: ['Mediterranean Diet Challenge', 'Cardio Boost Program'],
        communityRank: 456
      }
    }
  };
  
  // Mock OTP for demo
  export const MOCK_OTP = "123456";
  
  // Mock transaction ID generator
  export const generateMockTxnId = () => `mock-txn-${Date.now()}`;
  
  // Gamification levels
  export const healthLevels = [
    { level: 1, name: 'Beginner', minScore: 0, maxScore: 20 },
    { level: 2, name: 'Health Conscious', minScore: 21, maxScore: 40 },
    { level: 3, name: 'Wellness Warrior', minScore: 41, maxScore: 60 },
    { level: 4, name: 'Vitality Master', minScore: 61, maxScore: 80 },
    { level: 5, name: 'Health Champion', minScore: 81, maxScore: 100 }
  ];
  
  // Community challenges
  export const communityChallenges = [
    {
      id: 1,
      name: '10K Steps Daily',
      participants: 1234,
      duration: '30 days',
      reward: '500 Health Points'
    },
    {
      id: 2,
      name: 'Sugar-Free September',
      participants: 892,
      duration: '30 days',
      reward: '750 Health Points'
    },
    {
      id: 3,
      name: 'Meditation Marathon',
      participants: 567,
      duration: '21 days',
      reward: '400 Health Points'
    }
  ];