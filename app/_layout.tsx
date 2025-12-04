import { Slot, useRouter, useSegments, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext'; // Pastikan path import benar
import Colors from '../constants/Colors';

function InitialLayout() {
    // PERBAIKAN DI SINI: Gunakan 'loading' sesuai dengan AuthContext Anda
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Ubah 'initializing' menjadi 'loading'
        if (loading) return;

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

        if (!user && !inAuthGroup) {
            // Belum Login -> Arahkan ke Login
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // Sudah Login -> Arahkan ke Dashboard
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]); // Ubah dependency array juga

    // Tampilkan Spinner jika masih 'loading'
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="keamanan" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="notifikasi" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="detail" options={{ headerShown: false }} />
            <Stack.Screen name="lapor" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <InitialLayout />
        </AuthProvider>
    );
}