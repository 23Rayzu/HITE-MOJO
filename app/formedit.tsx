import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ref, update } from 'firebase/database';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../configs/firebase';
import Colors from '../constants/Colors';

export default function FormEditScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params;

    // State inisialisasi dengan data lama
    const [namaPelapor, setNamaPelapor] = useState(params.namaPelapor as string);
    const [jenisMotor, setJenisMotor] = useState(params.jenisMotor as string);
    const [nopol, setNopol] = useState(params.nopol as string);
    const [coordinates, setCoordinates] = useState(params.coordinates as string);
    const [loading, setLoading] = useState(false);

    const handleUpdate = () => {
        if (!id) return;

        const laporanRef = ref(db, `laporan_curanmor/${id}`);
        update(laporanRef, {
            namaPelapor,
            jenisMotor,
            nopol,
            coordinates
        })
            .then(() => {
                Alert.alert("Sukses", "Data laporan berhasil diperbarui");
                router.back();
            })
            .catch((error) => {
                Alert.alert("Gagal", "Gagal memperbarui data: " + error.message);
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Laporan</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Nama Pelapor</Text>
                <TextInput style={styles.input} value={namaPelapor} onChangeText={setNamaPelapor} placeholderTextColor="#9CA3AF" />

                <Text style={styles.label}>Jenis Kendaraan</Text>
                <TextInput style={styles.input} value={jenisMotor} onChangeText={setJenisMotor} placeholderTextColor="#9CA3AF" />

                <Text style={styles.label}>Nomor Polisi</Text>
                <TextInput style={styles.input} value={nopol} onChangeText={setNopol} placeholderTextColor="#9CA3AF" />

                <Text style={styles.label}>Koordinat (Lat, Long)</Text>
                <TextInput style={styles.input} value={coordinates} onChangeText={setCoordinates} placeholderTextColor="#9CA3AF" />

                <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={loading}>
                    <Text style={styles.submitButtonText}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 10 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 40,
    },
    backButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...Colors.shadow,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Colors.shadow },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: Colors.textPrimary },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20, backgroundColor: '#F8FAFC', fontSize: 14, color: Colors.textPrimary },
    submitButton: {
        marginTop: 10,
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});