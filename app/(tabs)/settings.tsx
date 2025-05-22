import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Key, RefreshCw, Info, ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";

import Colors from "@/constants/colors";
import { useWalletStore } from "@/stores/walletStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { resetWallet, initializeWallet, isInitialized } = useWalletStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleResetWallet = () => {
    Alert.alert(
      "Reset Wallet",
      "Are you sure you want to reset your wallet? This will delete all your credentials and keys.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: () => {
            resetWallet();
            Alert.alert("Wallet Reset", "Your wallet has been reset successfully.");
          }
        }
      ]
    );
  };

  const handleInitializeWallet = async () => {
    try {
      await initializeWallet();
      Alert.alert("Success", "Wallet initialized successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to initialize wallet");
    }
  };

  const renderSettingItem = (
    icon: ReactNode, 
    title: string, 
    description: string, 
    action: (() => void) | ((value: boolean) => void), 
    isSwitch: boolean = false, 
    value: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={isSwitch ? undefined : action as () => void}
      disabled={isSwitch}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={action as (value: boolean) => void}
          trackColor={{ false: "#D1D1D6", true: Colors.light.primary }}
          thumbColor={"#FFFFFF"}
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
          isInitialized ? "Your wallet is initialized and ready" : "Your wallet needs to be initialized",
          isInitialized ? () => {} : handleInitializeWallet
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

      <View style={styles.footer}>
        <Text style={styles.version}>GhostID v1.0.0</Text>
        <Text style={styles.copyright}>© 2025 GhostID</Text>
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
});