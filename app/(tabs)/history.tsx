import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, Modal, View, ScrollView } from 'react-native';
import { db } from '../../configs/firebase';
import Colors from '../../constants/Colors';

export default function HistoryScreen() {
    const router = useRouter();
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // STATE UNTUK EDIT MODAL
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [editJenisMotor, setEditJenisMotor] = useState('');
    const [editNopol, setEditNopol] = useState('');
    const [editCiri, setEditCiri] = useState('');
    const [editStatus, setEditStatus] = useState('');

    useEffect(() => {
        const reportsRef = ref(db, 'laporan_curanmor/');
        const unsubscribe = onValue(reportsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const locs = Object.keys(data).map(key => ({ id: key, ...data[key] }))
                    .sort((a, b) => b.timestamp - a.timestamp);
                setLocations(locs);
            } else { setLocations([]); }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- HELPER WARNA STATUS ---
    const getStatusColors = (status: string) => {
        switch (status) {
            case 'Hilang':
                return { bg: '#FEE2E2', main: '#EF4444' }; // Merah (Danger)
            case 'Ditemukan':
                return { bg: '#FEF3C7', main: '#F59E0B' }; // Kuning/Oranye (Warning)
            case 'Di Ambil':
                return { bg: '#D1FAE5', main: '#10B981' }; // Hijau (Success)
            default:
                return { bg: '#F3F4F6', main: '#6B7280' }; // Default Abu
        }
    };

    // --- FUNGSI HAPUS ---
    const handleDelete = (id: string) => {
        Alert.alert("Hapus Laporan", "Yakin hapus permanen?", [
            { text: "Batal", style: "cancel" },
            { text: "Hapus", style: "destructive", onPress: async () => {
                try { await remove(ref(db, `laporan_curanmor/${id}`)); Alert.alert("Sukses", "Data dihapus."); } 
                catch (error) { Alert.alert("Error", "Gagal hapus."); }
            }}
        ]);
    };

    // --- FUNGSI BUKA MODAL EDIT ---
    const handleEdit = (item: any) => {
        setEditData(item);
        setEditJenisMotor(item.jenisMotor);
        setEditNopol(item.nopol);
        setEditCiri(item.ciriCiri || '');
        setEditStatus(item.status);
        setIsEditVisible(true);
    };

    // --- FUNGSI SIMPAN PERUBAHAN ---
    const saveEdit = async () => {
        if (!editData) return;
        try {
            await update(ref(db, `laporan_curanmor/${editData.id}`), {
                jenisMotor: editJenisMotor,
                nopol: editNopol,
                ciriCiri: editCiri,
                status: editStatus
            });
            Alert.alert("Sukses", "Data laporan diperbarui.");
            setIsEditVisible(false);
        } catch (error) {
            Alert.alert("Error", "Gagal update data.");
        }
    };

    // --- FUNGSI KE PETA ---
    const handleGoToMap = (loc: any) => {
        if (loc.coordinates) {
            const [lat, lng] = loc.coordinates.split(',').map((c: string) => c.trim());
            router.push(`/(tabs)/peta?lat=${lat}&lng=${lng}&focusId=${loc.id}`);
        } else {
            Alert.alert("Info", "Laporan ini tidak memiliki data koordinat valid.");
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const colors = getStatusColors(item.status);

        return (
            <View style={styles.card}>
                {/* BAGIAN KIRI: KE PETA */}
                <TouchableOpacity style={styles.infoSection} onPress={() => handleGoToMap(item)}>
                    <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
                        <Ionicons name="location" size={24} color={colors.main} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.motorTitle}>{item.jenisMotor}</Text>
                        <Text style={styles.nopolText}>{item.nopol}</Text>
                        <Text style={[styles.statusText, { color: colors.main }]}>
                            {item.status}
                        </Text>
                        <Text style={styles.coordText} numberOfLines={1}>
                            <Ionicons name="map-outline" size={10} /> {item.kecamatan || 'Lokasi Peta'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* BAGIAN KANAN: AKSI */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E0F2FE' }]} onPress={() => handleEdit(item)}>
                        <Ionicons name="pencil" size={18} color="#0284C7" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginTop: 10 }]} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Riwayat Laporan</Text>
                <Text style={styles.subHeader}>Kelola data kehilangan dan pantau lokasi.</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={locations}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="folder-open-outline" size={50} color="#ccc" /><Text style={{ color: '#aaa', marginTop: 10 }}>Belum ada data laporan.</Text></View>}
                />
            )}

            {/* MODAL EDIT DATA */}
            <Modal visible={isEditVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Laporan</Text>
                        <ScrollView>
                            <Text style={styles.label}>Jenis Motor</Text>
                            <TextInput style={styles.input} value={editJenisMotor} onChangeText={setEditJenisMotor} />
                            
                            <Text style={styles.label}>Nomor Polisi</Text>
                            <TextInput style={styles.input} value={editNopol} onChangeText={setEditNopol} />
                            
                            <Text style={styles.label}>Ciri-Ciri</Text>
                            <TextInput style={styles.input} value={editCiri} onChangeText={setEditCiri} multiline />

                            <Text style={styles.label}>Update Status</Text>
                            <View style={styles.statusContainer}>
                                {/* PERUBAHAN DISINI: Hanya menampilkan Ditemukan dan Di Ambil */}
                                {['Ditemukan', 'Di Ambil'].map(st => (
                                    <TouchableOpacity 
                                        key={st} 
                                        style={[styles.statusChip, editStatus === st && styles.statusChipActive]} 
                                        onPress={() => setEditStatus(st)}
                                    >
                                        <Text style={[styles.statusChipText, editStatus === st && {color:'#fff'}]}>{st}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#ccc'}]} onPress={() => setIsEditVisible(false)}>
                                <Text>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, {backgroundColor: Colors.primary}]} onPress={saveEdit}>
                                <Text style={{color:'#fff', fontWeight:'bold'}}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    
    // --- Header Styles ---
    headerContainer: { 
        paddingTop: 60, 
        paddingHorizontal: 20, 
        paddingBottom: 20, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#f0f0f0' 
    },
    header: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
    subHeader: { fontSize: 14, color: Colors.textSecondary, marginTop: 5 },
    
    // --- List Styles ---
    listContent: { padding: 20, paddingBottom: 100 },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 16, 
        marginBottom: 15, 
        flexDirection: 'row', 
        ...Colors.shadow, 
        elevation: 3, 
        overflow: 'hidden' 
    },
    
    // --- Card Inner Styles ---
    infoSection: { flex: 1, flexDirection: 'row', padding: 15, alignItems: 'center' },
    iconBox: { 
        width: 45, 
        height: 45, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    textContainer: { flex: 1 },
    motorTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary },
    nopolText: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
    statusText: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    coordText: { fontSize: 11, color: '#94A3B8' },
    
    actionSection: { 
        width: 60, 
        backgroundColor: '#F8FAFC', 
        borderLeftWidth: 1, 
        borderLeftColor: '#F1F5F9', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    
    // --- MODAL STYLES (DIPERBAIKI) ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    
    label: { fontSize: 12, color: '#666', marginTop: 10, marginBottom: 5, fontWeight: '600' },
    input: { 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        borderRadius: 10, 
        padding: 12, 
        backgroundColor: '#F8FAFC',
        fontSize: 14,
        color: Colors.textPrimary
    },
    
    // PERBAIKAN CONTAINER TOMBOL STATUS
    statusContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', // Membagi ruang kiri kanan
        gap: 10, // Jarak antar tombol
        marginTop: 5 
    },
    
    // PERBAIKAN TOMBOL STATUS AGAR TIDAK TERPOTONG
    statusChip: { 
        flex: 1, // KUNCI: Agar lebar tombol otomatis mengisi ruang (50% kiri, 50% kanan)
        paddingVertical: 12, // Tinggi tombol nyaman disentuh
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    
    statusChipActive: { 
        backgroundColor: Colors.primary, 
        borderColor: Colors.primary 
    },
    
    statusChipText: { 
        fontSize: 13, // Ukuran font pas
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center' 
    },
    
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, gap: 15 },
    modalBtn: { 
        flex: 1, 
        padding: 14, 
        borderRadius: 12, 
        alignItems: 'center' 
    }
});