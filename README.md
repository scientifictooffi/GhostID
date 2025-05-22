# GhostID

A mobile application for zero-knowledge proof identity verification.

## Overview

GhostID is a React Native application that allows users to:

1. Scan QR codes containing DIDComm authorization requests
2. Parse and validate these requests
3. Generate zero-knowledge proofs (ZKPs) to verify identity claims
4. Send these proofs securely to the requesting service

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- React Native development environment
- Expo CLI

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/scientifictooffi/ghostid.git
   cd ghostid
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   RPC_URL=https://rpc-mumbai.maticvigil.com
   STATE_CONTRACT_ADDRESS=0x134B1BE34911E39A8397ec6289782989729807a4
   ```

4. Start the development server:
   ```
   yarn start
   ```

### Running on a Device

#### Physical Device

1. Install the Expo Go app on your device
2. Scan the QR code from the terminal with your device camera

#### Emulator

1. Start your Android or iOS emulator
2. Press 'a' for Android or 'i' for iOS in the terminal

## Testing

### Example QR Payload

For testing purposes, you can use the following example QR payload:

```
didcomm://eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0eXBlIjoiaHR0cHM6Ly9pZGVuMy1jb21tdW5pY2F0aW9uLmlvL2F1dGhvcml6YXRpb24vMS4wL3JlcXVlc3QiLCJ0aGlkIjoiMTIzNDU2Nzg5MCIsImJvZHkiOnsicmVhc29uIjoiUGxlYXNlIHZlcmlmeSB5b3VyIGFnZSIsInNjb3BlIjpbeyJpZCI6MSwidHlwZSI6IktZQ0FnZUNyZWRlbnRpYWwiLCJjaXJjdWl0SWQiOiJjcmVkZW50aWFsQXRvbWljUXVlcnlNVFAiLCJydWxlcyI6eyJhZ2UiOnsiJGd0ZSI6MTh9fX1dfSwiZnJvbSI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFMNUplS2NSUVpHVnhMMUVYRm1OUkdCY29LTmJyYWhNajRWUUcxMjM0NTYiLCJ0byI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFEeXkxa0VvMkFZY1A5MVBabTFKYjlCazFOR00xdVY5eWdMWFQxMjM0NTYiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20vY2FsbGJhY2sifQ==
```

This payload represents a request to verify that the user is at least 18 years old.
