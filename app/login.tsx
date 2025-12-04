import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
// 1. Tambahkan import Image
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { auth } from '../configs/firebase';
import Colors from '../constants/Colors';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Isi email dan password.");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert("Login Gagal", "Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                
                {/* 2. GANTI ICON DENGAN IMAGE DISINI */}
                {/* Pastikan path '../../assets' sesuai dengan struktur folder Anda. */}
                {/* Jika file ini ada di dalam folder "app", maka mundur 2 langkah (../..) biasanya sudah benar untuk ke root assets */}
                <Image 
                    source={require('../assets/images/icon.png')} 
                    style={styles.logo}
                />

                <Text style={styles.title}>HITE MOJO</Text>
                <Text style={styles.subtitle}>Hilang Temu Motor Jogja</Text>

                <View style={styles.formContainer}>
                    <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
                    <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={{color: Colors.textSecondary}}>Belum punya akun? </Text>
                    <Link href="/register" asChild><TouchableOpacity><Text style={{color: Colors.primary, fontWeight:'bold'}}>Daftar</Text></TouchableOpacity></Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
    content: { padding: 20 },
    
    // 3. Tambahkan Style untuk Logo Gambar
    logo: {
        width: 100,      // Sesuaikan ukuran
        height: 100,     // Sesuaikan ukuran
        alignSelf: 'center',
        marginBottom: 20,
        resizeMode: 'contain' // Agar gambar tidak gepeng
    },

    title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40 },
    formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Colors.shadow },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 15, backgroundColor: '#F8FAFC' },
    button: { backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
});