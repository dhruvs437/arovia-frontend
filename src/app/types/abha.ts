export interface ABHAProfile {
    healthIdNumber: string;
    healthId: string;
    name: string;
    gender: string;
    dateOfBirth: string;
    mobile: string;
    email?: string;
    address?: {
      line?: string;
      district?: string;
      state?: string;
      pincode?: string;
    };
    kycPhoto?: string;
    profilePhoto?: string;
  }
  
  export interface AuthToken {
    token: string;
    expiresIn: number;
    refreshToken?: string;
  }
  
  export interface TransactionResponse {
    txnId: string;
  }
  
  export interface HealthRecord {
    type: string;
    date: string;
    doctor?: string;
    hospital?: string;
    medications?: any[];
    tests?: any[];
  }
  
  export interface RiskFactors {
    diabetes: { risk: string; score: number };
    hypertension: { risk: string; score: number };
    cardiovascular: { risk: string; score: number };
  }