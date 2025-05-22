import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

interface WalletState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  walletId: string | null;
  initializeWallet: () => Promise<void>;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      isLoading: false,
      error: null,
      walletId: null,

      initializeWallet: async () => {
        try {
          set({ isLoading: true, error: null });

          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const walletId = `wallet_${Math.random().toString(36).substring(2, 15)}`;
          
          set({ 
            isInitialized: true, 
            isLoading: false,
            walletId
          });
          
          console.log("Wallet initialized with ID:", walletId);
          
        } catch (error: any) {
          console.error("Failed to initialize wallet:", error);
          set({ 
            isLoading: false, 
            error: error.message || "Failed to initialize wallet" 
          });
          throw error;
        }
      },

      resetWallet: () => {
        set({ 
          isInitialized: false,
          walletId: null,
          error: null
        });
        console.log("Wallet reset");
      }
    }),
    {
      name: "ghostid-wallet-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);