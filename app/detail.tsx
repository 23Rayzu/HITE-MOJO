import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { get, ref, runTransaction } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../configs/firebase';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

type HistoryItem = { status: string; date: number; desc: string };

type ReportDetail = {
    id: string;
    namaPelapor: string;
    jenisMotor: string;
    nopol: string;
    coordinates: string;
    status: string;
    timestamp: number;
    imageUrl?: string;
    history?: HistoryItem[];
};

export default function DetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params;

    const [report, setReport] = useState<ReportDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchReport = async () => {
            try {
                const reportId = Array.isArray(id) ? id[0] : id;
                const reportRef = ref(db, `laporan_curanmor/${reportId}`);
                
                const snapshot = await get(reportRef);
                if (snapshot.exists()) {
                    setReport({ id: snapshot.key as string, ...snapshot.val() });
                } else {
                    console.log("Data tidak ditemukan");
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const updateStatusWithHistory = async (newStatus: string, description: string) => {
        if (!id) return;
        const reportId = Array.isArray(id) ? id[0] : id;
        const reportRef = ref(db, `laporan_curanmor/${reportId}`);
        
        try {
            await runTransaction(reportRef, (currentData) => {
                if (currentData) {
                    currentData.status = newStatus;
                    const newHistoryItem = { status: newStatus, date: Date.now(), desc: description };
                    
                    if (!currentData.history) currentData.history = [];
                    currentData.history.push(newHistoryItem);
                }
                return currentData;
            });
            
            setReport(prev => prev ? { 
                ...prev, 
                status: newStatus,
                history: [...(prev.history || []), { status: newStatus, date: Date.now(), desc: description }]
            } : null);

            Alert.alert("Sukses", `Status berhasil diubah menjadi ${newStatus}`);
        } catch (error: any) {
            Alert.alert("Gagal", "Terjadi kesalahan saat update status: " + error.message);
        }
    };

    const defaultImage = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

    if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    if (!report) return <View style={styles.centerContainer}><Text>Laporan tidak ditemukan.</Text></View>;

    const timelineData = report.history && report.history.length > 0 
        ? [...report.history].reverse() 
        : [{ status: 'Laporan Dibuat', date: report.timestamp, desc: 'Laporan awal diterima sistem.' }];

    const getBadgeColor = (status: string) => {
        if (status === 'Hilang') return '#EF4444';
        if (status === 'Ditemukan') return '#F59E0B';
        if (status === 'Di Ambil') return '#10B981';
        return '#64748B';
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
                <View style={{flex:1, marginLeft: 15}}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{report.nopol || 'Detail Laporan'}</Text>
                    <Text style={styles.headerSubtitle}>Detail Rincian Laporan</Text>
                </View>
                <Ionicons name="share-social-outline" size={24} color={Colors.textPrimary} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.vehicleName}>{report.jenisMotor}</Text>
                            <Text style={styles.vehicleType}>Kendaraan Roda Dua</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor(report.status) }]}>
                            <Text style={styles.badgeText}>{report.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Image source={{ uri: report.imageUrl || defaultImage }} style={styles.vehicleImage} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}><Text style={styles.label}>Nama Pelapor</Text><Text style={styles.label}>Plat Nomor</Text><Text style={styles.label}>Lokasi</Text></View>
                        <View style={styles.infoColVal}>
                            <Text style={styles.value}>{report.namaPelapor}</Text>
                            <Text style={styles.value}>{report.nopol || '-'}</Text>
                            <Text style={styles.value} selectable>{report.coordinates}</Text>
                        </View>
                    </View>

                    <Text style={{fontWeight:'bold', marginBottom:15, fontSize:14}}>Riwayat Status:</Text>
                    <View style={styles.timelineContainer}>
                        {timelineData.map((item, index) => {
                            const dateObj = new Date(item.date);
                            const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
                            const isActive = index === 0;
                            return (
                                <View key={index} style={styles.timelineRow}>
                                    <View style={styles.dateCol}>
                                        <View style={isActive ? styles.activeDateBadge : styles.dateBadge}><Text style={isActive ? styles.activeDateText : styles.dateText}>{dateStr}</Text></View>
                                    </View>
                                    <View style={styles.lineCol}>
                                        <View style={[styles.dot, isActive && styles.activeDot]} />
                                        {index !== timelineData.length - 1 && <View style={styles.line} />}
                                    </View>
                                    <View style={styles.statusCol}>
                                        <Text style={[styles.statusTitle, isActive && {fontWeight:'bold', color: Colors.primary}]}>{item.status}</Text>
                                        <Text style={styles.statusDesc}>{item.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{marginTop: 20}}>
                        {report.status === 'Hilang' && (
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#F59E0B' }]} onPress={() => updateStatusWithHistory('Ditemukan', 'Motor ditemukan oleh petugas/warga.')}>
                                <Text style={styles.buttonText}>Tandai Sebagai Ditemukan</Text>
                            </TouchableOpacity>
                        )}
                        {report.status === 'Ditemukan' && (
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#10B981' }]} onPress={() => updateStatusWithHistory('Di Ambil', 'Kendaraan telah diserahkan kembali ke pemilik.')}>
                                <Text style={styles.buttonText}>Konfirmasi Selesai / Di Ambil</Text>
                            </TouchableOpacity>
                        )}
                        {report.status === 'Di Ambil' && (
                            <View style={[styles.button, { backgroundColor: '#E2E8F0' }]}><Text style={[styles.buttonText, {color: '#64748B'}]}>Kasus Selesai</Text></View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
    headerSubtitle: { fontSize: 12, color: Colors.textSecondary },
    scrollContent: { padding: 20, paddingBottom: 50 },
    mainCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, ...Colors.shadow, minHeight: 600 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    vehicleName: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
    vehicleType: { fontSize: 12, color: Colors.textSecondary },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, height: 25, justifyContent: 'center' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    vehicleImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20, resizeMode: 'cover' },
    infoRow: { flexDirection: 'row', marginBottom: 30 },
    infoCol: { width: 100 },
    infoColVal: { flex: 1 },
    label: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
    value: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600', marginBottom: 5 },
    timelineContainer: { marginBottom: 10 },
    timelineRow: { flexDirection: 'row', minHeight: 70 },
    dateCol: { width: 75, alignItems: 'flex-end', paddingRight: 10 },
    dateBadge: {},
    activeDateBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    dateText: { fontSize: 10, color: Colors.textSecondary, fontWeight: 'bold' },
    activeDateText: { fontSize: 10, color: Colors.textPrimary, fontWeight: 'bold' },
    lineCol: { width: 20, alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1', marginTop: 6, zIndex: 1 },
    activeDot: { backgroundColor: Colors.primary, width: 12, height: 12, borderWidth: 2, borderColor: '#fff', elevation: 2, borderRadius: 6, marginTop: 4 },
    line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', position: 'absolute', top: 5, bottom: -5, zIndex: 0 },
    statusCol: { flex: 1, paddingLeft: 10, paddingRight: 5, paddingBottom: 15 },
    statusTitle: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
    statusDesc: { fontSize: 11, color: '#666', marginTop: 2, lineHeight: 16 },
    button: { padding: 15, borderRadius: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});