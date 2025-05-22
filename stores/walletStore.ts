import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { initializeIdentityWallet, createIdentity, getIdentities } from "@/services/polygonId";

interface WalletState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  walletId: string | null;
  identityDid: string | null;
  initializeWallet: () => Promise<void>;
  resetWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isLoading: false,
      error: null,
      walletId: null,
      identityDid: null,

      initializeWallet: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Initialize the Identity Wallet
          const identityWallet = await initializeIdentityWallet();
          
          // Check if we already have identities
          const identities = await getIdentities();
          let identityDid: string | null = null;
          
          if (!identities || identities.length === 0) {
            // Create a new identity
            const { did } = await createIdentity(identityWallet);
            identityDid = did;
          } else {
            // Use the first identity
            identityDid = identities[0];
          }
          
          set({ 
            isInitialized: true, 
            isLoading: false,
            walletId: identityDid,
            identityDid
          });
          
          console.log("Wallet initialized with DID:", identityDid);
          
        } catch (error: any) {
          console.error("Failed to initialize wallet:", error);
          set({ 
            isLoading: false, 
            error: error.message || "Failed to initialize wallet" 
          });
          throw error;
        }
      },

      resetWallet: async () => {
        try {
          set({ isLoading: true });
          
          // Clear AsyncStorage keys related to the wallet
          const keys = await AsyncStorage.getAllKeys();
          const walletKeys = keys.filter(key => key.startsWith('polygonid:'));
          
          if (walletKeys.length > 0) {
            await AsyncStorage.multiRemove(walletKeys);
          }
          
          set({ 
            isInitialized: false,
            isLoading: false,
            walletId: null,
            identityDid: null,
            error: null
          });
          
          console.log("Wallet reset successfully");
        } catch (error: any) {
          console.error("Failed to reset wallet:", error);
          set({ isLoading: false, error: error.message });
          throw error;
        }
      }
    }),
    {
      name: "polygonid-wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        walletId: state.walletId,
        identityDid: state.identityDid,
      }),
    }
  )
);