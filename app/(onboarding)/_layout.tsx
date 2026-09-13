import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8F7F3' },
      }}
    >
      <Stack.Screen name="goal" />
    </Stack>
  );
}
