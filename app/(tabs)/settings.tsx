import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Key, RefreshCw, Info, ChevronRight, Download } from "lucide-react-native";
import { ReactNode } from "react";
import * as Haptics from 'expo-haptics';

import Colors from "@/constants/colors";
import { useWalletStore } from "@/stores/walletStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { resetWallet, initializeWallet, isInitialized, isLoading, identityDid, error } = useWalletStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isImportingCredential, setIsImportingCredential] = useState(false);

  const handleResetWallet = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Reset Wallet",
      "Are you sure you want to reset your wallet? This will delete all your credentials and keys.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: async () => {
            try {
              await resetWallet();
              Alert.alert("Wallet Reset", "Your wallet has been reset successfully.");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to reset wallet");
            }
          }
        }
      ]
    );
  };

  const handleInitializeWallet = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      await initializeWallet();
      Alert.alert("Success", "Wallet initialized successfully");
    } catch (error: unknown) {
      Alert.alert("Error", (error as Error).message || "Failed to initialize wallet");
    }
  };

  const handleImportCredential = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!isInitialized) {
      Alert.alert("Error", "Please initialize your wallet first");
      return;
    }
    
    setIsImportingCredential(true);
    
    try {
      // This would be replaced with actual credential import logic
      // For example, scanning a QR code or selecting a file
      
      setTimeout(() => {
        setIsImportingCredential(false);
        Alert.alert(
          "Import Credential",
          "This feature would allow importing credentials from issuers. In a production app, this would connect to credential issuers or scan credential QR codes."
        );
      }, 1500);
    } catch (error: any) {
      setIsImportingCredential(false);
      Alert.alert("Error", error.message || "Failed to import credential");
    }
  };

  const renderSettingItem = (
    icon: ReactNode, 
    title: string, 
    description: string, 
    action: (() => void) | ((value: boolean) => void), 
    isSwitch: boolean = false, 
    value: boolean = false,
    loading: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={isSwitch ? undefined : action as () => void}
      disabled={isSwitch || isLoading || loading}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.light.primary} />
      ) : isSwitch ? (
        <Switch
          value={value}
          onValueChange={action as (value: boolean) => void}
          trackColor={{ false: "#D1D1D6", true: Colors.light.primary }}
          thumbColor={"#FFFFFF"}
          disabled={isLoading}
        />
      ) : (
        <ChevronRight size={20} color={Colors.light.placeholder} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your GhostID wallet</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        
        {renderSettingItem(
          <Key size={24} color={Colors.light.primary} />,
          "Wallet Status",
          isInitialized 
            ? `Your wallet is initialized with DID: ${identityDid?.substring(0, 15)}...` 
            : "Your wallet needs to be initialized",
          isInitialized ? () => {} : handleInitializeWallet,
          false,
          false,
          isLoading
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Text style={styles.errorHint}>
            </Text>
          </View>
        )}
        
        {renderSettingItem(
          <Download size={24} color={Colors.light.primary} />,
          "Import Credential",
          "Import a verifiable credential from an issuer",
          handleImportCredential,
          false,
          false,
          isImportingCredential
        )}
        
        {renderSettingItem(
          <RefreshCw size={24} color={Colors.light.error} />,
          "Reset Wallet",
          "Delete all credentials and keys",
          handleResetWallet
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {renderSettingItem(
          <Shield size={24} color={Colors.light.primary} />,
          "Biometric Authentication",
          "Use Face ID or fingerprint to secure your wallet",
          () => setBiometricEnabled(!biometricEnabled),
          true,
          biometricEnabled
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {renderSettingItem(
          <Info size={24} color={Colors.light.primary} />,
          "Dark Mode",
          "Switch between light and dark themes",
          () => setDarkModeEnabled(!darkModeEnabled),
          true,
          darkModeEnabled
        )}
        
        {renderSettingItem(
          <Info size={24} color={Colors.light.primary} />,
          "Notifications",
          "Receive alerts about verification requests",
          () => setNotificationsEnabled(!notificationsEnabled),
          true,
          notificationsEnabled
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing</Text>
        <View style={styles.testingInfo}>
          <Text style={styles.testingTitle}>Test QR Code</Text>
          <Text style={styles.testingDescription}>
            Use the following format for testing:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {"didcomm://eyJpZCI6IjEyMzQ1Njc4OTAiLCJ0eXBlIjoiaHR0cHM6Ly9pZGVuMy1jb21tdW5pY2F0aW9uLmlvL2F1dGhvcml6YXRpb24vMS4wL3JlcXVlc3QiLCJ0aGlkIjoiMTIzNDU2Nzg5MCIsImJvZHkiOnsicmVhc29uIjoiUGxlYXNlIHZlcmlmeSB5b3VyIGFnZSIsInNjb3BlIjpbeyJpZCI6MSwidHlwZSI6IktZQ0FnZUNyZWRlbnRpYWwiLCJjaXJjdWl0SWQiOiJjcmVkZW50aWFsQXRvbWljUXVlcnlNVFAiLCJydWxlcyI6eyJhZ2UiOnsiJGd0ZSI6MTh9fX1dfSwiZnJvbSI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFMNUplS2NSUVpHVnhMMUVYRm1OUkdCY29LTmJyYWhNajRWUUcxMjM0NTYiLCJ0byI6ImRpZDpwb2x5Z29uaWQ6cG9seWdvbjptdW1iYWk6MnFEeXkxa0VvMkFZY1A5MVBabTFKYjlCazFOR00xdVY5eWdMWFQxMjM0NTYiLCJjYWxsYmFja1VybCI6Imh0dHBzOi8vbXVsdGlwbHktZGFybGluZy13YWxydXMubmdyb2stZnJlZS5hcHAifQ=="}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.demoNotice}>
        <Text style={styles.demoNoticeTitle}>Demo Mode</Text>
        <Text style={styles.demoNoticeText}>
          This is a simplified demo implementation that doesn't use the full PolygonID SDK due to compatibility issues with React Native.
          In a production app, you would use the complete SDK with proper cryptographic operations.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>GhostID v1.0.0</Text>
        <Text style={styles.copyright}>© 2023 GhostID</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.placeholder,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.placeholder,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingIcon: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.placeholder,
  },
  testingInfo: {
    padding: 16,
  },
  testingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  testingDescription: {
    fontSize: 14,
    color: Colors.light.placeholder,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: "#F0F0F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  version: {
    fontSize: 14,
    color: Colors.light.placeholder,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: Colors.light.placeholder,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#FFF5F5",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: Colors.light.placeholder,
  },
  demoNotice: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  demoNoticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  demoNoticeText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});