import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import { CartProvider } from "../context/CartContext";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "../context/LanguageContext";

// Import i18n configuration (no need to use it directly, just initialize it)
import '../lib/i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
