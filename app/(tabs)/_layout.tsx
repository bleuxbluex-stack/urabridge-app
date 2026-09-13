import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Brain, BarChart2, User } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { language } = useTranslation();

  const bottomOffset = Math.max(insets.bottom + 14, Platform.OS === 'android' ? 22 : 18);

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let Icon = Home;
          let label = language === 'en' ? 'Home' : 'Kreu';

          if (route.name === 'index') {
            Icon = Home;
            label = language === 'en' ? 'Home' : 'Kreu';
          } else if (route.name === 'learn') {
            Icon = BookOpen;
            label = language === 'en' ? 'Learn' : 'Mëso';
          } else if (route.name === 'review') {
            Icon = Brain;
            label = language === 'en' ? 'Review' : 'Rishikim';
          } else if (route.name === 'progress') {
            Icon = BarChart2;
            label = language === 'en' ? 'Progress' : 'Progresi';
          } else if (route.name === 'profile') {
            Icon = User;
            label = language === 'en' ? 'Profile' : 'Profili';
          }

          const activeColor = '#1E56E0';
          const inactiveColor = '#94A3B8';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              {/* Active Top Line Indicator */}
              {isFocused ? (
                <View style={styles.activeTopDot} />
              ) : (
                <View style={styles.inactiveTopSpace} />
              )}

              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                <Icon
                  size={20}
                  color={isFocused ? activeColor : inactiveColor}
                  strokeWidth={isFocused ? 2.4 : 1.8}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? activeColor : inactiveColor },
                  isFocused && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="review" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E56E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  activeTopDot: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1E56E0',
    marginBottom: 4,
  },
  inactiveTopSpace: {
    height: 3,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconWrapper: {
    backgroundColor: '#EFF6FF',
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10.5,
  },
  activeTabLabel: {
    fontFamily: Typography.fontFamily.extraBold,
  },
});
