import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, profile, isLoading, isInitialized, initialize } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      // User is not authenticated -> redirect to auth welcome screen
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (profile && !profile.onboarding_completed) {
      // User is authenticated but hasn't completed onboarding -> redirect to goal screen
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/goal');
      }
    } else if (inAuthGroup || inOnboardingGroup) {
      // User is fully authenticated & onboarded -> redirect to main tabs
      router.replace('/(tabs)');
    }
  }, [session, profile, isInitialized, fontsLoaded, segments]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <InitialLayout />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
