import { View, Text, Image, TouchableOpacity, Platform } from 'react-native'
import React from 'react'
import { Tabs, router } from 'expo-router'

const BLUE_400 = "#60A5FA"
const WHITE    = "#FFFFFF"
const GRAY_MID = "#E4E4E4"

const icons: Record<string, number> = {
  Home:    require('../home.png'),
  Profile: require('../user.png'),
}

// ── Regular tab icon ──────────────────────────────────────────
const TabIcon = ({ focused, title }: { focused: boolean; title: string }) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 70,           // fixed width prevents label wrapping
  }}>
    <Image
      source={icons[title]}
      style={{
        height: 22, width: 22,
        tintColor: focused ? BLUE_400 : '#9CA3AF',
      }}
      resizeMode="contain"
    />
    <Text
      numberOfLines={1}   // hard-cap at 1 line, never wraps
      style={{
        fontSize: 11,
        fontWeight: focused ? '700' : '500',
        color: focused ? BLUE_400 : '#9CA3AF',
      }}
    >
      {title}
    </Text>
  </View>
)

// ── Centre plus button ────────────────────────────────────────
const PlusButton = () => (
  <TouchableOpacity
    onPress={() => router.push('/post')}
    activeOpacity={0.85}
    style={{
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: BLUE_400,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 40,   // lifts button above bar on both platforms
      shadowColor: BLUE_400,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    }}
  >
    {/* Plus icon — two rectangles */}
    <View style={{ width: 20, height: 2, backgroundColor: WHITE, borderRadius: 1, position: 'absolute' }} />
    <View style={{ width: 2, height: 20, backgroundColor: WHITE, borderRadius: 1, position: 'absolute' }} />
  </TouchableOpacity>
)

// ── Layout ────────────────────────────────────────────────────
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // Fixed height — enough for icon + label + safe area
          height: 84,
          backgroundColor: WHITE,
          borderTopWidth: 1,
          borderTopColor: GRAY_MID,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 12,
          // Safe area padding handled manually below — NOT via paddingBottom
          // so label never gets clipped by it
          paddingBottom: 0,
          paddingTop: 0,
          overflow: 'visible',
        },
        tabBarItemStyle: {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          // Slight upward offset so icon+label sit in the visible portion,
          // above the iOS home indicator dead zone
          paddingBottom: Platform.OS === 'ios' ? 18 : 6,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} title="Home" />,
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: 'Post',
          tabBarIcon: () => <PlusButton />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} title="Profile" />,
        }}
      />
    </Tabs>
  )
}

export { PlusButton as PlusIcon }