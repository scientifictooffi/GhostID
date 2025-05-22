import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RPC_URL, STATE_CONTRACT_ADDRESS } from '@/constants/config';
import { AuthorizationRequestMessage, VerificationHandlerResponse } from '@/types/polygon-id';

// Storage keys
const STORAGE_PREFIX = 'polygonid:';
const IDENTITY_KEY = `${STORAGE_PREFIX}identity`;
const WALLET_KEY = `${STORAGE_PREFIX}wallet`;
const CREDENTIALS_KEY = `${STORAGE_PREFIX}credentials`;


export const initializeIdentityWallet = async (): Promise<any> => {
  console.log("Initializing Identity Wallet with RPC URL:", RPC_URL);
  
  try {
    // Check if we already have a wallet
    const existingWallet = await AsyncStorage.getItem(WALLET_KEY);
    
    if (existingWallet) {
      console.log("Using existing wallet");
      return JSON.parse(existingWallet);
    }
    
    const mockWallet = {
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      privateKey: `0x${Math.random().toString(16).substring(2, 66)}`,
    };
    
    // Save the wallet
    await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(mockWallet));
    
    console.log("Mock identity wallet initialized successfully");
    return mockWallet;
  } catch (error) {
    console.error("Failed to initialize Identity Wallet:", error);
    throw new Error("Failed to initialize wallet: " + (error instanceof Error ? error.message : String(error)));
  }
};


export const createIdentity = async (wallet: any): Promise<{ did: string }> => {
  console.log("Creating new identity");
  
  try {
    // Generate a DID based on the wallet address
    const did = `did:polygonid:polygon:mumbai:2q${wallet.address.substring(2, 14)}`;
    
    // Save the identity
    await AsyncStorage.setItem(IDENTITY_KEY, did);
    
    console.log("Identity created with DID:", did);
    return { did };
  } catch (error) {
    console.error("Failed to create identity:", error);
    throw new Error("Failed to create identity: " + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Get all identities
 */
export const getIdentities = async (): Promise<string[]> => {
  try {
    const did = await AsyncStorage.getItem(IDENTITY_KEY);
    return did ? [did] : [];
  } catch (error) {
    console.error("Failed to get identities:", error);
    return [];
  }
};

/**
 * Generate a Zero Knowledge Proof
 * This is a mock implementation that simulates the proof generation
 */
export const generateZKProof = async (authRequest: AuthorizationRequestMessage): Promise<VerificationHandlerResponse> => {
  console.log("Generating ZK proof for request:", authRequest);
  
  try {
    // Get the identity
    const did = await AsyncStorage.getItem(IDENTITY_KEY);
    if (!did) {
      throw new Error("No identity found");
    }
    
    // Handle the authorization request
    // This is a simplified implementation that creates a valid response structure
    const response: VerificationHandlerResponse = {
      id: `response-${authRequest.id}`,
      typ: "application/iden3comm-plain-json",
      type: "https://iden3-communication.io/authorization/1.0/response",
      thid: authRequest.thid,
      body: {
        scope: authRequest.body.scope.map(scope => ({
          id: scope.id,
          type: scope.type,
          circuitId: scope.circuitId,
          proof: {
            pi_a: ["123", "456", "789"],
            pi_b: [["123", "456"], ["789", "012"]],
            pi_c: ["123", "456", "789"],
            protocol: "groth16"
          }
        }))
      },
      from: did,
      to: authRequest.from
    };
    
    console.log("ZK proof generated successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to generate ZK proof:", error);
    throw new Error("Failed to generate ZK proof: " + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Parse an authorization request from a QR code
 */
export const parseAuthorizationRequest = async (qrData: string): Promise<AuthorizationRequestMessage> => {
  try {
    // Handle different QR code formats
    let jsonData: any;
    
    if (qrData.startsWith('didcomm://')) {
      // Extract the base64 part and decode it
      const base64Data = qrData.replace('didcomm://', '');
      const jsonString = atob(base64Data);
      jsonData = JSON.parse(jsonString);
    } else if (qrData.startsWith('iden3comm://')) {
      // Extract the base64 part and decode it
      const base64Data = qrData.replace('iden3comm://', '');
      const jsonString = atob(base64Data);
      jsonData = JSON.parse(jsonString);
    } else if (qrData.startsWith('{') && qrData.endsWith('}')) {
      // Direct JSON format
      jsonData = JSON.parse(qrData);
    } else {
      throw new Error("Unrecognized QR code format");
    }
    
    // Convert to AuthorizationRequestMessage
    const authRequest: AuthorizationRequestMessage = {
      id: jsonData.id,
      typ: jsonData.typ || 'application/iden3comm-plain-json',
      type: jsonData.type,
      thid: jsonData.thid,
      body: jsonData.body,
      from: jsonData.from,
      to: jsonData.to,
      callbackUrl: jsonData.callbackUrl
    };
    
    return authRequest;
  } catch (error) {
    console.error("Failed to parse authorization request:", error);
    throw new Error("Failed to parse QR code: " + (error instanceof Error ? error.message : String(error)));
  }
};

// Helper function to decode base64 that works in both web and React Native
function atob(data: string): string {
  if (Platform.OS === 'web') {
    return window.atob(data);
  } else {
    return Buffer.from(data, 'base64').toString('utf8');
  }
}