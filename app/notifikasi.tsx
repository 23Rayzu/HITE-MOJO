import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// PERBAIKAN IMPORT:
import Colors from '../constants/Colors'; 

export default function NotifikasiScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={styles.content}>
                <Ionicons name="notifications-off-outline" size={80} color="#CBD5E1" />
                <Text style={styles.title}>Segera Hadir</Text>
                <Text style={styles.subtitle}>Fitur notifikasi sedang dalam tahap pengembangan.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
    backButton: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...Colors.shadow },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20 },
    subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 10, textAlign: 'center' },
});