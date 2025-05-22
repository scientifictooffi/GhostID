# PolygonID Mobile App

A mobile application for zero-knowledge proof identity verification using PolygonID.

## Overview

This app is a mobile port of the [PolygonID Extension Demo](https://github.com/0xPolygonID/extension-demo), implementing the PolygonID protocol for verifiable credentials and zero-knowledge proofs. It allows users to:

1. Create and manage decentralized identities (DIDs)
2. Scan QR codes containing DIDComm authorization requests
3. Generate zero-knowledge proofs (ZKPs) to verify identity claims without revealing sensitive data
4. Send these proofs securely to requesting services

## Features

- **Decentralized Identity Management**: Create and manage Polygon ID identities
- **QR Code Scanner**: Scan and parse DIDComm authorization requests
- **Zero-Knowledge Proof Generation**: Generate ZKPs using the PolygonID SDK
- **Secure Communication**: Send proofs to verifiers via secure channels

## Technical Implementation

This application uses:

- **React Native with Expo**: For cross-platform mobile development
- **PolygonID JS SDK**: For identity and credential management
- **Expo Camera**: For QR code scanning
- **AsyncStorage**: For secure data persistence
- **Zustand**: For state management

## Development Notes

This implementation uses a simplified version of the PolygonID SDK functionality. Due to compatibility issues with React Native, particularly around secure random number generation, some parts have been mocked for demonstration purposes.

### Current Implementation Status

- The app can create and manage identities
- It can scan and parse QR codes
- It generates simulated ZK proofs for development purposes
- It can send proofs to the callback URL

In a production environment, you would need to:
1. Use the full PolygonID SDK with proper native modules for cryptographic operations
2. Handle key management securely
3. Implement proper error handling and recovery

## Demo Mode

The current implementation uses a simplified wallet that doesn't require secure random number generation, making it compatible with environments where cryptographically secure random numbers aren't available (like some web browsers).

## Testing

### Example QR Payload

For testing purposes, you can use the following example QR payload:

```
didcomm://eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0eXBlIjoiaHR0cHM6Ly9pZGVuMy1jb21tdW5pY2F0aW9uLmlvL2F1dGhvcml6YXRpb24vMS4wL3JlcXVlc3QiLCJ0aGlkIjoiMTIzNDU2Nzg5MCIsImJvZHkiOnsicmVhc29uIjoiUGxlYXNlIHZlcmlmeSB5b3VyIGFnZSIsInNjb3BlIjpbeyJpZCI6MSwidHlwZSI6IktZQ0FnZUNyZWRlbnRpYWwiLCJjaXJjdWl0SWQiOiJjcmVkZW50aWFsQXRvbWljUXVlcnlNVFAiLCJydWxlcyI6eyJhZ2UiOnsiJGd0ZSI6MTh9fX1dfSwiZnJvbSI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFMNUplS2NSUVpHVnhMMUVYRm1OUkdCY29LTmJyYWhNajRWUUcxMjM0NTYiLCJ0byI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFEeXkxa0VvMkFZY1A5MVBabTFKYjlCazFOR00xdVY5eWdMWFQxMjM0NTYiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vbXVsdGlwbHktZGFybGluZy13YWxydXMubmdyb2stZnJlZS5hcHAifQ==
```

This payload represents a request to verify that the user is at least 18 years old.
