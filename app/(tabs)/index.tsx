import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Scan, CheckCircle, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

import Colors from "@/constants/colors";
import { APP_NAME } from "@/constants/config";
import { useProofStore } from "@/stores/proofStore";
import { useWalletStore } from "@/stores/walletStore";

export default function HomeScreen() {
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { generateAndSendProof, resetState, status } = useProofStore();
  const { isInitialized, initializeWallet } = useWalletStore();
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    
    // Provide haptic feedback when QR code is scanned
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setScanned(true);
    setProcessing(true);
    setError(null);
    
    try {
      console.log("QR Code scanned with data:", data);
      
      // Check if wallet is initialized
      if (!isInitialized) {
        // Try to initialize the wallet automatically
        try {
          await initializeWallet();
          console.log("Wallet initialized automatically");
        } catch (walletError) {
          throw new Error("Wallet not initialized. Please initialize your wallet in Settings first.");
        }
      }
      
      // Process the QR code data
      await generateAndSendProof(data);
      
      // If we get here, it was successful
      setProcessing(false);
      
      // Provide success haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.error("Error processing QR code:", err);
      setError(err.message || "Failed to process QR code");
      setProcessing(false);
      
      // Provide error haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
    setError(null);
    resetState();
  };

  useEffect(() => {
    // Check if wallet is initialized on component mount
    if (!isInitialized) {
      Alert.alert(
        "Wallet Not Initialized",
        "Please initialize your wallet in Settings before scanning QR codes.",
        [
          { text: "OK", onPress: () => router.push("/settings") }
        ]
      );
    }
  }, [isInitialized]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>Scan a QR code to verify your identity</Text>
      </View>

      {!scanned ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            facing="back"
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          {processing ? (
            <>
              <View style={styles.statusIcon}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
              </View>
              <Text style={styles.statusText}>Processing request...</Text>
              <Text style={styles.statusDetail}>
                Generating zero-knowledge proof
              </Text>
            </>
          ) : error ? (
            <>
              <View style={styles.statusIcon}>
                <XCircle size={80} color={Colors.light.error} />
              </View>
              <Text style={styles.statusText}>Verification Failed</Text>
              <Text style={styles.statusDetail}>{error}</Text>
              <TouchableOpacity style={styles.button} onPress={resetScanner}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.statusIcon}>
                <CheckCircle size={80} color={Colors.light.success} />
              </View>
              <Text style={styles.statusText}>Verification Successful</Text>
              <Text style={styles.statusDetail}>
                Your proof has been sent securely
              </Text>
              <TouchableOpacity style={styles.button} onPress={resetScanner}>
                <Text style={styles.buttonText}>Scan Another</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {!scanned && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.footerText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.placeholder,
    textAlign: "center",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: "transparent",
    borderRadius: 16,
  },
  scanText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 8,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusIcon: {
    marginBottom: 20,
    height: 80,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 10,
  },
  statusDetail: {
    fontSize: 16,
    color: Colors.light.placeholder,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  iconButton: {
    alignItems: "center",
  },
  footerText: {
    marginTop: 8,
    color: Colors.light.primary,
    fontSize: 14,
  },
  text: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 20,
  },
});