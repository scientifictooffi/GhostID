import { create } from "zustand";
import { parseAuthorizationRequest, generateZKPResponse, sendZKPResponse } from "@/services/didCommHandler";


interface ProofState {
  status: 'idle' | 'scanning' | 'processing' | 'success' | 'error';
  error: string | null;
  lastProofId: string | null;
  generateAndSendProof: (qrData: string) => Promise<void>;
  resetState: () => void;
}

export const useProofStore = create<ProofState>((set, get) => ({
  status: 'idle',
  error: null,
  lastProofId: null,

  generateAndSendProof: async (qrData: string) => {
    try {
      set({ status: 'processing', error: null });
      
      console.log("Processing QR data:", qrData);
      
      if (!qrData || typeof qrData !== 'string') {
        throw new Error("Invalid QR code format");
      }
      
      console.log("Parsing authorization request...");
      const authRequest = await parseAuthorizationRequest(qrData);
      console.log("Authorization request parsed:", authRequest);
      
      console.log("Generating ZKP response...");
      const zkpResponse = await generateZKPResponse(authRequest);
      console.log("ZKP response generated:", zkpResponse);
      
      console.log("Sending ZKP response...");
      const result = await sendZKPResponse(zkpResponse, authRequest.callbackUrl);
      console.log("ZKP response sent, result:", result);
      

      const proofId = `proof_${Math.random().toString(36).substring(2, 10)}`;
      
      console.log("Proof generated and sent successfully with ID:", proofId);
      
      set({ 
        status: 'success',
        lastProofId: proofId
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