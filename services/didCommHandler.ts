import { Platform } from 'react-native';
import { RPC_URL, STATE_CONTRACT_ADDRESS, REQUEST_TIMEOUT } from '@/constants/config';
import { useWalletStore } from '@/stores/walletStore';
import { generateZKProof, parseAuthorizationRequest as parseRequest } from './polygonId';
import { AuthorizationRequestMessage, VerificationHandlerResponse } from '@/types/polygon-id';

export const parseAuthorizationRequest = parseRequest;

/**
 * Generate a ZKP response for an authorization request
 * @param authRequest The parsed authorization request
 * @returns The generated ZKP response
 */
export const generateZKPResponse = async (authRequest: AuthorizationRequestMessage): Promise<VerificationHandlerResponse> => {
  console.log("Generating ZKP response for request:", authRequest);
  
  try {
    // Get the wallet from the store
    const { isInitialized, identityDid } = useWalletStore.getState();
    
    if (!isInitialized || !identityDid) {
      throw new Error("Wallet not initialized. Please initialize your wallet first.");
    }
    
    // Generate the ZKP response using our polygonId service
    const zkpResponse = await generateZKProof(authRequest);
    
    console.log("ZKP response generated successfully:", zkpResponse);
    return zkpResponse;
  } catch (error) {
    console.error("Failed to generate ZKP response:", error);
    throw error;
  }
};

/**
 * Send a ZKP response to the callback URL
 * @param response The ZKP response
 * @param callbackUrl The URL to send the response to
 * @returns The result of the send operation
 */
export const sendZKPResponse = async (response: VerificationHandlerResponse, callbackUrl: string) => {
  console.log("Sending ZKP response to:", callbackUrl);
  
  try {
    // Convert the response to a string if it's not already
    const responseData = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    // Send the response to the callback URL
    const fetchResponse = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: responseData,
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
    }
    
    const responseJson = await fetchResponse.json();
    console.log("ZKP response sent successfully:", responseJson);
    
    return responseJson;
  } catch (error) {
    console.error("Failed to send ZKP response:", error);
    
    // For network errors, provide a more specific message
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error("Network error: Could not connect to the callback server. Please check your internet connection.");
    }
    
    // For timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT/1000} seconds`);
    }
    
    throw error;
  }
};

/**
 * Handle a complete authorization flow
 * @param qrData The data from the scanned QR code
 * @returns The result of the authorization flow
 */
export const handleAuthorizationFlow = async (qrData: string) => {
  // Parse the authorization request
  const authRequest = await parseAuthorizationRequest(qrData);
  
  // Generate a ZKP response
  const zkpResponse = await generateZKPResponse(authRequest);
  
  // Send the response to the callback URL
  const result = await sendZKPResponse(zkpResponse, authRequest.callbackUrl);
  
  return result;
};