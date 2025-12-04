import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { push, ref } from "firebase/database";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../configs/firebase';
import Colors from '../../constants/Colors';
import { useAuth } from '../AuthContext';

export default function LaporScreen() {
    const { user } = useAuth();
    const [jenisMotor, setJenisMotor] = useState('');
    const [nopol, setNopol] = useState('');
    const [noRangka, setNoRangka] = useState('');
    const [noMesin, setNoMesin] = useState('');
    const [ciriCiri, setCiriCiri] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationAddress, setLocationAddress] = useState('');
    const [mapVisible, setMapVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState({ latitude: -7.250445, longitude: 112.768845, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocationCoords(coords);
        setMapRegion({ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 });
        setLocationAddress(`${coords.latitude}, ${coords.longitude}`);
    };

    const openMap = async () => {
        if (!locationCoords) await getCurrentLocation();
        setMapVisible(true);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.3, base64: true });
        if (!result.canceled && result.assets[0].base64) {
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        if (!jenisMotor || !nopol || !locationCoords || !imageBase64 || !noRangka) {
            Alert.alert("Data Belum Lengkap", "Mohon isi Foto, Jenis Motor, Nopol, No Rangka, dan Lokasi.");
            return;
        }
        setLoading(true);
        try {
            const reportsRef = ref(db, 'laporan_curanmor/');
            await push(reportsRef, {
                namaPelapor: user?.displayName || 'Anonim',
                uid: user?.uid,
                jenisMotor,
                nopol,
                noRangka,
                noMesin,
                ciriCiri,
                coordinates: `${locationCoords.latitude}, ${locationCoords.longitude}`,
                status: 'Hilang',
                timestamp: Date.now(),
                imageUrl: imageBase64,
                history: [{ status: 'Laporan Diterima', date: Date.now(), desc: 'Laporan diterima petugas.' }]
            });
            Alert.alert("Sukses", "Laporan berhasil dikirim!");
            setJenisMotor(''); setNopol(''); setNoRangka(''); setNoMesin(''); setCiriCiri(''); setImageBase64(null); setLocationCoords(null); setLocationAddress('');
            router.push('/(tabs)');
        } catch (error: any) { Alert.alert("Gagal", error.message); } finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Buat Laporan Baru</Text><View style={{ width: 40 }} />
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Foto Kendaraan (Wajib)</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {imageBase64 ? (<Image source={{ uri: imageBase64 }} style={styles.imagePreview} />) : (<View style={styles.imagePickerPlaceholder}><Ionicons name="camera" size={30} color={Colors.textSecondary} /><Text style={styles.imagePickerText}>Pilih Foto (Base64)</Text></View>)}
                    </TouchableOpacity>

                    <Text style={styles.label}>Nama Pelapor</Text>
                    <TextInput style={[styles.input, styles.inputDisabled]} value={user?.displayName || ''} editable={false} />
                    <Text style={styles.label}>Jenis Motor (Wajib)</Text>
                    <TextInput style={styles.input} value={jenisMotor} onChangeText={setJenisMotor} placeholder="Contoh: Honda Vario 125" />
                    <Text style={styles.label}>Nomor Polisi (Wajib)</Text>
                    <TextInput style={styles.input} value={nopol} onChangeText={setNopol} placeholder="Contoh: AB 1234 CD" />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}><Text style={styles.label}>No. Rangka (Wajib)</Text><TextInput style={styles.input} value={noRangka} onChangeText={setNoRangka} placeholder="MH1..." /></View>
                        <View style={{ flex: 1 }}><Text style={styles.label}>No. Mesin</Text><TextInput style={styles.input} value={noMesin} onChangeText={setNoMesin} placeholder="JM1..." /></View>
                    </View>
                    <Text style={styles.label}>Ciri-ciri Khusus</Text>
                    <TextInput style={[styles.input, { height: 80 }]} multiline value={ciriCiri} onChangeText={setCiriCiri} textAlignVertical="top" />

                    <Text style={styles.label}>Lokasi Hilang</Text>
                    <TouchableOpacity style={styles.locationButton} onPress={openMap}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="map" size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                            <Text style={{ color: locationAddress ? Colors.textPrimary : '#9CA3AF', flex: 1 }}>{locationAddress || "Klik untuk tandai lokasi..."}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Kirim Laporan</Text>}</TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={mapVisible} animationType="slide">
                <View style={{ flex: 1 }}>
                    <MapView style={{ flex: 1 }} region={mapRegion} onRegionChangeComplete={setMapRegion}><Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} /></MapView>
                    <View style={styles.markerFixed} pointerEvents="none"><Ionicons name="location-sharp" size={40} color={Colors.primary} /></View>
                    <View style={styles.mapFooter}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={[styles.btnMap, { backgroundColor: '#ccc' }]} onPress={() => setMapVisible(false)}><Text>Batal</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btnMap, { backgroundColor: Colors.primary }]} onPress={() => { setLocationCoords({ latitude: mapRegion.latitude, longitude: mapRegion.longitude }); setLocationAddress(`${mapRegion.latitude.toFixed(6)}, ${mapRegion.longitude.toFixed(6)}`); setMapVisible(false); }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Pilih Lokasi</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { padding: 20, paddingTop: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backButton: { backgroundColor: '#fff', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...Colors.shadow },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Colors.shadow, marginBottom: 50 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 5, color: Colors.textPrimary, marginTop: 10 },
    imagePicker: { height: 180, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    imagePickerPlaceholder: { alignItems: 'center' },
    imagePickerText: { marginTop: 5, color: Colors.textSecondary },
    imagePreview: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
    input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#F8FAFC', fontSize: 14, color: Colors.textPrimary },
    inputDisabled: { backgroundColor: '#F1F5F9', color: Colors.textSecondary },
    locationButton: { padding: 15, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, backgroundColor: '#EBF2FF', marginTop: 5 },
    submitButton: { marginTop: 30, backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    markerFixed: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40 },
    mapFooter: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
    btnMap: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' }
});