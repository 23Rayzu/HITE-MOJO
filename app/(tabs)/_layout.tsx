import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94A3B8', // Abu-abu cool gray yang lebih modern
        headerShown: false,
        tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 70, // Tinggi disesuaikan per OS
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
            borderTopLeftRadius: 24, // Radius lebih smooth
            borderTopRightRadius: 24,
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            position: 'absolute', // Mengambang (Floating Tab)
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 8, // Shadow Android
            shadowColor: '#000', // Shadow iOS
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        tabBarShowLabel: false, // Label tetap disembunyikan untuk tampilan minimalis
    }}>
      
      {/* 1. DASHBOARD - Menggunakan Icon Grid */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons 
                    name={focused ? "grid" : "grid-outline"} 
                    size={24} 
                    color={color} 
                />
                {/* Indikator Titik kecil jika aktif */}
                {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 2. PETA - Icon Map */}
      <Tabs.Screen
        name="peta"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons 
                    name={focused ? "map" : "map-outline"} 
                    size={24} 
                    color={color} 
                />
                {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 3. LAPOR - Tombol Tengah Menonjol (Floating Action) */}
      <Tabs.Screen
        name="lapor"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.fabButton, { backgroundColor: Colors.primary }]}>
                <Ionicons name="add" size={32} color="#fff" />
            </View>
          ),
        }}
      />

      {/* 4. HISTORY - Icon Time/Clock */}
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons 
                    name={focused ? "time" : "time-outline"} 
                    size={28} 
                    color={color} 
                />
                {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      {/* 5. PROFILE - Icon Person Circle */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
                <Ionicons 
                    name={focused ? "person" : "person-outline"} 
                    size={24} 
                    color={color} 
                />
                {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

// Styles terpisah agar rapi
const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        top: 5,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginTop: 4,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20, // Membuatnya "keluar" sedikit ke atas dari tab bar
        elevation: 5,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 4,
        borderColor: '#f2f2f2', // Border putih/abu tipis agar kontras dengan background
    }
});