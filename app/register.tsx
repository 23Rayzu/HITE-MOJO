import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../configs/firebase'; // auth sudah bertipe Auth
import Colors from '../constants/Colors';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Mohon lengkapi semua data.");
            return;
        }
        setLoading(true);
        try {
            // auth langsung digunakan tanpa casting 'any' lagi
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profil pengguna dengan nama
            await updateProfile(userCredential.user, { displayName: name });
            // Pendaftaran berhasil, navigasi akan ditangani oleh AuthProvider di _layout
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert("Registrasi Gagal", "Email ini sudah terdaftar.");
            } else {
                Alert.alert("Registrasi Gagal", "Terjadi kesalahan: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Buat Akun Baru</Text>
                <Text style={styles.subtitle}>Isi data diri Anda untuk memulai</Text>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nama Lengkap"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Mendaftar...' : 'Daftar'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Sudah punya akun? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Login</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
    content: { padding: 20 },
    backButton: { position: 'absolute', top: 10, left: 20, zIndex: 1 },
    title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center', marginBottom: 10, marginTop: 40 },
    subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40 },
    formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Colors.shadow },
    input: {
        borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15,
        paddingVertical: 12, marginBottom: 15, backgroundColor: '#F8FAFC', fontSize: 14, color: Colors.textPrimary
    },
    button: {
        marginTop: 10, backgroundColor: Colors.primary, padding: 18,
        borderRadius: 15, alignItems: 'center'
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    linkText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
});