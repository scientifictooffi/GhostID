// Custom type definitions for PolygonID SDK

// Define the authorization request message structure
export interface AuthorizationRequestMessage {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: {
    reason: string;
    scope: Array<{
      id: number;
      type: string;
      circuitId: string;
      rules: any;
    }>;
  };
  from: string;
  to: string;
  callbackUrl: string;
}

// Define credential status type enum
export enum CredentialStatusType {
  SparseMerkleTreeProof = 'SparseMerkleTreeProof',
  Iden3ReverseSparseMerkleTreeProof = 'Iden3ReverseSparseMerkleTreeProof',
  Iden3CommRevocationStatusV1 = 'iden3comm',
  Iden3OnchainSparseMerkleTreeProof2023 = 'Iden3OnchainSparseMerkleTreeProof2023'
}

// Define our own verification handler response type
export interface VerificationHandlerResponse {
  id: string;
  typ: string;
  type: string;
  thid: string;
  body: any;
  from: string;
  to: string;
}