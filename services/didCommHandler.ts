import { Platform } from 'react-native';
import { RPC_URL, STATE_CONTRACT_ADDRESS } from '@/constants/config';



/**
 * Parse a DIDComm Authorization Request from a QR code
 * @param qrData The data from the scanned QR code
 * @returns Parsed authorization request
 */
export const parseAuthorizationRequest = async (qrData: string) => {
  console.log("Parsing authorization request:", qrData);
  

  if (!qrData || typeof qrData !== 'string') {
    throw new Error("Invalid QR code format");
  }
  

  try {
    try {
      const directJson = JSON.parse(qrData);
      if (directJson && typeof directJson === 'object') {
        
        if (!directJson.callbackUrl) {
          directJson.callbackUrl = "https://multiply-darling-walrus.ngrok-free.app";
        }
        return directJson;
      }
    } catch (e) {

    }
    
    if (qrData.includes('c_i=')) {
      const ciParam = qrData.split('c_i=')[1].split('&')[0];
      // Decode the base64url encoded string
      const decodedCi = decodeBase64Url(ciParam);
      const authRequest = JSON.parse(decodedCi);
      
      if (!authRequest.callbackUrl) {
        authRequest.callbackUrl = "https://multiply-darling-walrus.ngrok-free.app";
      }
      
      return authRequest;
    } else if (qrData.startsWith('didcomm://')) {

      const uri = qrData.replace('didcomm://', '');
      let decodedUri;
      

      try {
        decodedUri = decodeBase64Url(uri);
      } catch (e) {

        decodedUri = decodeURIComponent(uri);
      }
      
      const authRequest = JSON.parse(decodedUri);
      

      if (!authRequest.callbackUrl) {
        authRequest.callbackUrl = "https://multiply-darling-walrus.ngrok-free.app";
      }
      
      return authRequest;
    } else {

      console.log("Creating mock request for unrecognized format");
      return {
        id: `mock-${Date.now()}`,
        type: "https://iden3-communication.io/authorization/1.0/request",
        thid: `thread-${Date.now()}`,
        from: "did:polygonid:polygon:mumbai:2qL5JeKcRQZGVxL1EXFmNRGBcoKNbrahMj4VQG123456",
        to: "did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP91PZm1Jb9Bk1NGM1uV9ygLXT123456",
        body: {
          reason: "Demo verification",
          scope: [
            {
              id: 1,
              type: "KYCAgeCredential",
              circuitId: "credentialAtomicQueryMTP",
              rules: {
                age: { "$gte": 18 }
              }
            }
          ]
        },
        callbackUrl: "https://multiply-darling-walrus.ngrok-free.app"
      };
    }
  } catch (error) {
    console.error("Failed to parse authorization request:", error);
    throw new Error("Invalid authorization request format");
  }
};

/**
 * Generate a ZKP response for an authorization request
 * @param authRequest The parsed authorization request
 * @returns The generated ZKP response
 */
export const generateZKPResponse = async (authRequest: any) => {
  console.log("Generating ZKP response for request:", authRequest);
  

  await new Promise(resolve => setTimeout(resolve, 1500));
  

  const mockResponse = {
    id: `response-${Date.now()}`,
    type: "https://iden3-communication.io/authorization/1.0/response",
    thid: authRequest.thid || "thread-123",
    body: {
      message: "Proof generated successfully",
      proofValue: "mock-proof-value-" + Math.random().toString(36).substring(2, 10)
    }
  };
  
  return mockResponse;
};

/**
 * Send a ZKP response to the callback URL
 * @param response The ZKP response
 * @param callbackUrl The URL to send the response to
 * @returns The result of the send operation
 */
export const sendZKPResponse = async (response: any, callbackUrl: string) => {
  console.log("Sending ZKP response to:", callbackUrl);
  
  try {
    const joseMessage = JSON.stringify(response);
    
    console.log("Mock sending response to:", callbackUrl);
    console.log("Response payload:", joseMessage);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: "success",
      message: "Proof accepted"
    };
  } catch (error) {
    console.error("Failed to send ZKP response:", error);
    throw error;
  }
};

/**
 * Handle a complete authorization flow
 * @param qrData The data from the scanned QR code
 * @returns The result of the authorization flow
 */
export const handleAuthorizationFlow = async (qrData: string) => {

  const authRequest = await parseAuthorizationRequest(qrData);
  

  const zkpResponse = await generateZKPResponse(authRequest);
  

  const result = await sendZKPResponse(zkpResponse, authRequest.callbackUrl);
  
  return result;
};


const decodeBase64Url = (str: string) => {

  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  

  if (Platform.OS === 'web') {
    return atob(base64);
  } else {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
};