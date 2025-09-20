import axios from 'axios';
import NodeRSA from 'node-rsa';

// Configuration
const config = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://abhasbx.abdm.gov.in/abha/api' 
    : 'https://healthidsbx.abdm.gov.in/api',
  clientId: process.env.ABHA_CLIENT_ID || 'your_client_id',
  clientSecret: process.env.ABHA_CLIENT_SECRET || 'your_client_secret'
};

// Types
interface ABHAProfile {
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

interface AuthToken {
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

interface TransactionResponse {
  txnId: string;
}

class ABHAService {
  private authToken: string | null = null;
  private publicKey: string | null = null;

  // Initialize service and get auth token
  async initialize(): Promise<void> {
    try {
      // Get public certificate for encryption
      const certResponse = await axios.get(`${config.baseUrl}/v2/auth/cert`);
      this.publicKey = certResponse.data;

      // Get auth token for API access
      const authResponse = await axios.post(`${config.baseUrl}/v2/auth/init`, {
        clientId: config.clientId,
        clientSecret: config.clientSecret
      });
      this.authToken = authResponse.data.token;
    } catch (error) {
      console.error('Failed to initialize ABHA service:', error);
      throw new Error('ABHA service initialization failed');
    }
  }

  // Encrypt sensitive data using public key
  private encryptData(data: string): string {
    if (!this.publicKey) {
      throw new Error('Public key not available');
    }
    
    const key = new NodeRSA();
    key.importKey(this.publicKey, 'public');
    key.setOptions({ encryptionScheme: 'pkcs1' });
    return key.encrypt(data, 'base64');
  }

  // Check if ABHA ID exists
  async verifyABHAExists(abhaId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${config.baseUrl}/v1/search/existsByHealthId`,
        {
          params: { healthId: abhaId },
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId
          }
        }
      );
      return response.data.status === true;
    } catch (error) {
      console.error('ABHA verification failed:', error);
      return false;
    }
  }

  // Login with ABHA using Mobile OTP
  async loginWithMobileOTP(abhaId: string): Promise<TransactionResponse> {
    try {
      // Step 1: Initialize authentication
      const initResponse = await axios.post(
        `${config.baseUrl}/v2/auth/init`,
        {
          authMethod: 'MOBILE_OTP',
          healthid: abhaId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId
          }
        }
      );

      // Step 2: Generate OTP
      const otpResponse = await axios.post(
        `${config.baseUrl}/v1/auth/confirmWithMobileOTP`,
        {
          txnId: initResponse.data.txnId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId
          }
        }
      );

      return { txnId: otpResponse.data.txnId };
    } catch (error) {
      console.error('Failed to generate OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  // Verify OTP and get user token
  async verifyOTP(txnId: string, otp: string): Promise<AuthToken> {
    try {
      const encryptedOTP = this.encryptData(otp);
      
      const response = await axios.post(
        `${config.baseUrl}/v1/auth/confirmWithMobileOTP`,
        {
          otp: encryptedOTP,
          txnId: txnId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId
          }
        }
      );

      return {
        token: response.data.token,
        expiresIn: response.data.expiresIn,
        refreshToken: response.data.refreshToken
      };
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw new Error('Invalid OTP');
    }
  }

  // Get user profile
  async getUserProfile(userToken: string): Promise<ABHAProfile> {
    try {
      const response = await axios.get(
        `${config.baseUrl}/v1/account/profile`,
        {
          headers: {
            'X-Token': userToken,
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  // Get QR code for sharing
  async getQRCode(userToken: string): Promise<string> {
    try {
      const response = await axios.get(
        `${config.baseUrl}/v1/account/qrCode`,
        {
          headers: {
            'X-Token': userToken,
            'Authorization': `Bearer ${this.authToken}`,
            'X-HIP-ID': config.clientId,
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert to base64 for display
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Failed to fetch QR code:', error);
      throw new Error('Failed to fetch QR code');
    }
  }

  // Mock health records for hackathon demo
  async getHealthRecords(abhaId: string): Promise<any> {
    // For hackathon, return mock data
    // In production, this would fetch from HIE/HIU
    return {
      abhaId: abhaId,
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
            { name: 'HbA1c', value: '7.2%', normal: '< 6.5%' },
            { name: 'Blood Pressure', value: '140/90', normal: '< 120/80' },
            { name: 'Cholesterol', value: '210 mg/dL', normal: '< 200 mg/dL' }
          ]
        }
      ],
      // Risk predictions based on data
      riskFactors: {
        diabetes: { risk: 'High', score: 75 },
        hypertension: { risk: 'Medium', score: 60 },
        cardiovascular: { risk: 'Medium', score: 55 }
      }
    };
  }
}

export default ABHAService;