import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';

// PERBAIKAN IMPORT:
import { auth } from '../configs/firebase'; // Mundur 1 langkah ke folder configs
import Colors from '../constants/Colors';   // Mundur 1 langkah ke folder constants
import { useAuth } from './AuthContext';    // Sejajar dengan file AuthContext

export default function KeamananScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [email, setEmail] = useState(user?.email || '');

    const handleResetPassword = async () => {
        if (!email) return Alert.alert("Error", "Email wajib diisi");
        
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                "Email Terkirim", 
                "Silakan cek inbox/spam email Anda untuk link reset password.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert("Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Keamanan Akun</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Ionicons name="lock-closed-outline" size={60} color={Colors.primary} style={{marginBottom: 20}} />
                <Text style={styles.title}>Ubah Password</Text>
                <Text style={styles.subtitle}>Kami akan mengirimkan link untuk mereset password ke email Anda.</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email Terdaftar</Text>
                    <TextInput 
                        style={styles.input} 
                        value={email} 
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    
                    <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Mengirim..." : "Kirim Link Reset"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    backButton: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...Colors.shadow },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    content: { padding: 20, alignItems: 'center', marginTop: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
    subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
    formContainer: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 20, ...Colors.shadow },
    label: { marginBottom: 10, fontWeight: '600', color: Colors.textPrimary },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 20, backgroundColor: '#F8FAFC' },
    button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' }
});