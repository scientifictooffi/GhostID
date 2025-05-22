import { create } from "zustand";
import { parseAuthorizationRequest, generateZKPResponse, sendZKPResponse } from "@/services/didCommHandler";
import { useWalletStore } from "./walletStore";
import { AuthorizationRequestMessage, VerificationHandlerResponse } from "@/types/polygon-id";

interface ProofState {
  status: 'idle' | 'scanning' | 'processing' | 'success' | 'error';
  error: string | null;
  lastProofId: string | null;
  lastProofData: any | null;
  generateAndSendProof: (qrData: string) => Promise<void>;
  resetState: () => void;
}

export const useProofStore = create<ProofState>((set, get) => ({
  status: 'idle',
  error: null,
  lastProofId: null,
  lastProofData: null,

  generateAndSendProof: async (qrData: string) => {
    try {
      set({ status: 'processing', error: null });
      
      console.log("Processing QR data:", qrData);
      
      // Check if wallet is initialized
      const { isInitialized } = useWalletStore.getState();
      if (!isInitialized) {
        throw new Error("Wallet not initialized. Please initialize your wallet first.");
      }
      
      // Validate QR data format
      if (!qrData || typeof qrData !== 'string') {
        throw new Error("Invalid QR code format");
      }
      
      // Step 1: Parse the authorization request
      console.log("Parsing authorization request...");
      const authRequest = await parseAuthorizationRequest(qrData);
      console.log("Authorization request parsed:", authRequest);
      
      // Step 2: Generate a ZKP response
      console.log("Generating ZKP response...");
      const zkpResponse = await generateZKPResponse(authRequest);
      console.log("ZKP response generated:", zkpResponse);
      
      // Step 3: Send the response to the callback URL
      console.log("Sending ZKP response...");
      const result = await sendZKPResponse(zkpResponse, authRequest.callbackUrl);
      console.log("ZKP response sent, result:", result);
      
      // Generate a proof ID for tracking
      const proofId = `proof_${Math.random().toString(36).substring(2, 10)}`;
      
      console.log("Proof generated and sent successfully with ID:", proofId);
      
      set({ 
        status: 'success',
        lastProofId: proofId,
        lastProofData: {
          request: authRequest,
          response: zkpResponse,
          result
        }
      });
      
    } catch (error: any) {
      console.error("Failed to generate and send proof:", error);
      set({ 
        status: 'error', 
        error: error.message || "Failed to generate and send proof" 
      });
      throw error;
    }
  },

  resetState: () => {
    set({ 
      status: 'idle',
      error: null
    });
  }
}));