import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onValue, ref, runTransaction } from 'firebase/database';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../configs/firebase';
import Colors from '../../constants/Colors';
import { useAuth } from '../AuthContext';

// Definisi Tipe Data
type HistoryItem = { status: string; date: number; desc: string; updatedBy?: string };

type Report = {
  id: string;
  nopol: string;
  name: string;
  type: string;
  kecamatan: string;
  date: string;
  timestamp: number;
  status: string;
  image: string;
  isMine: boolean;
  history: HistoryItem[];
};

type HotspotData = {
  location: string;
  count: number;
} | null;

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Ditemukan');
  const [allReports, setAllReports] = useState<Report[]>([]);
  
  // State Modal
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Fetch Data Realtime
  useEffect(() => {
    const reportsRef = ref(db, 'laporan_curanmor/');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray: Report[] = Object.keys(data).map(key => ({
          id: key,
          nopol: data[key].nopol || 'N/A',
          name: data[key].jenisMotor,
          type: 'Roda Dua',
          kecamatan: data[key].kecamatan || 'Diketahui',
          date: new Date(data[key].timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          timestamp: data[key].timestamp,
          status: data[key].status || 'Hilang',
          image: data[key].imageUrl || `https://ui-avatars.com/api/?name=${data[key].nopol || 'N/A'}&background=EBF2FF&color=7F8C8D`,
          isMine: data[key].uid === user?.uid,
          history: data[key].history || []
        }));
        // Urutkan dari yang terbaru
        setAllReports(reportsArray.sort((a, b) => b.timestamp - a.timestamp));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // ---------------------------------------------------------
  // PERBAIKAN UTAMA: Auto-Sync Selected Report
  // Ini memastikan data di Modal selalu sinkron dengan Database
  // ---------------------------------------------------------
  useEffect(() => {
    if (selectedReport && allReports.length > 0) {
      const updatedData = allReports.find(item => item.id === selectedReport.id);
      if (updatedData) {
        // Cek jika ada perubahan status/history agar tidak re-render berlebihan
        if (updatedData.status !== selectedReport.status || updatedData.history?.length !== selectedReport.history?.length) {
            setSelectedReport(updatedData);
        }
      }
    }
  }, [allReports]); 
  // ---------------------------------------------------------

  // 2. Logic Hotspot
  const hotspot = useMemo<HotspotData>(() => {
    const locationStats: Record<string, number> = {};
    allReports.filter(r => r.status === 'Hilang').forEach(r => {
      const loc = r.kecamatan ? String(r.kecamatan) : 'Diketahui';
      locationStats[loc] = (locationStats[loc] || 0) + 1;
    });
    let maxLoc: string | null = null;
    let maxCount = 0;
    Object.entries(locationStats).forEach(([loc, count]) => {
      if (count > maxCount) { maxCount = count; maxLoc = loc; }
    });
    return maxLoc !== null ? { location: maxLoc, count: maxCount } : null;
  }, [allReports]);

  // 3. Stats (SINKRON DENGAN STRING "Di Ambil")
  const stats = useMemo(() => ({
    hilang: allReports.filter(r => r.status === 'Hilang').length,
    ditemukan: allReports.filter(r => r.status === 'Ditemukan').length,
    selesai: allReports.filter(r => r.status === 'Di Ambil').length, 
  }), [allReports]);

  // 4. Filter
  const filteredReports = useMemo(() => {
    if (activeFilter === 'Laporan saya') return allReports.filter(report => report.isMine);
    return allReports.filter(report => report.status === activeFilter);
  }, [activeFilter, allReports]);

  // 5. Update Status via Modal
  const updateStatus = async (newStatus: string, description: string) => {
    if (!selectedReport) return;
    
    Alert.alert("Konfirmasi", `Ubah status menjadi "${newStatus}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya, Update", onPress: async () => {
          try {
            const reportRef = ref(db, `laporan_curanmor/${selectedReport.id}`);
            await runTransaction(reportRef, (curr) => {
              if (curr) {
                // Update Status Utama
                curr.status = newStatus;
                
                // Tambah History
                const newHist = {
                  status: newStatus,
                  date: Date.now(),
                  desc: description,
                  updatedBy: user?.displayName || 'Sistem'
                };

                if (!curr.history) curr.history = [];
                curr.history.push(newHist);
              }
              return curr;
            });
            // Tidak perlu setModalVisible(false) langsung jika ingin melihat perubahan
            Alert.alert("Sukses", "Status berhasil diperbarui!");
          } catch (e) { Alert.alert("Error", "Gagal update status."); }
        }
      }
    ]);
  };

  const StatCard = ({ label, count, color, icon }: any) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIcon}><Ionicons name={icon} size={18} color="#fff" /></View>
      <View><Text style={styles.statCount}>{count}</Text><Text style={styles.statLabel}>{label}</Text></View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Siap 86, {user?.displayName?.split(' ')[0] || 'Komandan'}!</Text>
                <Text style={{ color: Colors.textSecondary }}>Dashboard Monitoring Curanmor</Text>
              </View>
              <View style={styles.logoContainer}><FontAwesome5 name="shield-alt" size={24} color={Colors.primary} /></View>
            </View>

            {hotspot && (
              <View style={styles.hotspotBanner}>
                <View style={styles.hotspotIcon}><MaterialCommunityIcons name="alert-decagram" size={24} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotspotTitle}>ZONA MERAH: {hotspot.location.toUpperCase()}</Text>
                  <Text style={styles.hotspotDesc}>Terpantau {hotspot.count} kasus aktif di wilayah ini. Tingkatkan patroli.</Text>
                </View>
              </View>
            )}

            <View style={styles.statsContainer}>
              <StatCard label="Hilang" count={stats.hilang} color="#EF4444" icon="alert-circle" />
              <StatCard label="Ditemukan" count={stats.ditemukan} color="#F59E0B" icon="search" />
              <StatCard label="Selesai" count={stats.selesai} color="#10B981" icon="checkmark-circle" />
            </View>

            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/lapor')}>
              <View>
                <View style={styles.iconCircle}><Ionicons name="add" size={24} color="#fff" /></View>
                <Text style={styles.actionTitle}>Buat Laporan Baru</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Input data kehilangan masyarakat</Text>
              </View>
              <Ionicons name="document-text" size={50} color="#FFB02E" style={{ opacity: 0.8 }} />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Monitoring Data</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, maxHeight: 50 }} contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 40 }}>
              {['Ditemukan', 'Hilang', 'Di Ambil', 'Laporan saya'].map(f => (
                <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.chip, activeFilter === f && styles.chipActive]}>
                  <Text style={[styles.chipText, activeFilter === f && { color: '#fff' }]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.reportCard} onPress={() => item.isMine ? (setSelectedReport(item), setModalVisible(true)) : router.push(`/detail?id=${item.id}`)}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.reportNopol}>{item.nopol}</Text>
                  <Text style={{ fontSize: 10, backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, color: '#64748B', overflow: 'hidden' }} numberOfLines={1}>{item.kecamatan}</Text>
                </View>
                <Text style={styles.reportName}>{item.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="calendar-outline" size={12} color="#888" /><Text style={styles.reportDate}> {item.date}</Text></View>
            </View>
            <Image source={{ uri: item.image }} style={styles.reportImage} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 50 }}><MaterialCommunityIcons name="file-search-outline" size={50} color="#ddd" /><Text style={{ color: '#aaa', marginTop: 10 }}>Belum ada laporan masuk.</Text></View>}
      />

      {/* MODAL DETAIL (DASHBOARD) */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <Text style={styles.modalTitle}>Detail Laporan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
            </View>
            <Image source={{ uri: selectedReport?.image }} style={{ width: '100%', height: 150, borderRadius: 12, marginBottom: 15 }} />
            
            {/* STATUS DISPLAY - SINKRON DENGAN DATA TERBARU */}
            <View style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 15 }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>Status Saat Ini:</Text>
              <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 16, 
                  color: selectedReport?.status === 'Hilang' ? '#EF4444' : (selectedReport?.status === 'Ditemukan' ? '#F59E0B' : '#10B981') 
                }}>
                {selectedReport?.status}
              </Text>
              <Text style={{ fontSize: 12, marginTop: 4, color: '#64748B' }}>Lokasi Kejadian: {selectedReport?.kecamatan}</Text>
            </View>
            
            {/* RIWAYAT - DIURUTKAN TERBARU DI ATAS */}
            <Text style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 14 }}>Riwayat Terbaru:</Text>
            <ScrollView style={{ maxHeight: 120, marginBottom: 15 }}>
              {selectedReport?.history && selectedReport.history.length > 0 ? (
                selectedReport.history.slice().reverse().map((hist, index) => {
                    const isActive = index === 0; // Item paling atas
                    return (
                      <View key={index} style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' }}>
                        <View style={{ 
                            width: 8, height: 8, borderRadius: 4, 
                            backgroundColor: isActive ? (hist.status === 'Hilang' ? '#EF4444' : hist.status === 'Ditemukan' ? '#F59E0B' : '#10B981') : '#ccc', 
                            marginTop: 6, marginRight: 8 
                        }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 12, color: isActive ? '#000' : '#666' }}>{hist.status}</Text>
                          <Text style={{ fontSize: 11, color: '#666' }}>{new Date(hist.date).toLocaleString('id-ID')}</Text>
                          <Text style={{ fontSize: 11, color: '#444', fontStyle: 'italic' }}>"{hist.desc}"</Text>
                        </View>
                      </View>
                    );
                })
              ) : (
                <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Belum ada riwayat update.</Text>
              )}
            </ScrollView>
            
            {/* BUTTON ACTION (LOGIC FLOW: Hilang -> Ditemukan -> Di Ambil) */}
            <View>
              {selectedReport?.status === 'Hilang' && (
                <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#F59E0B' }]} onPress={() => updateStatus('Ditemukan', 'Motor ditemukan oleh petugas patroli/warga.')}>
                  <Text style={styles.btnText}>Tandai Ditemukan</Text>
                </TouchableOpacity>
              )}
              {selectedReport?.status === 'Ditemukan' && (
                <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#10B981' }]} onPress={() => updateStatus('Di Ambil', 'Kendaraan telah diserahkan kembali ke pemilik.')}>
                  <Text style={styles.btnText}>Konfirmasi Selesai / Di Ambil</Text>
                </TouchableOpacity>
              )}
              {selectedReport?.status === 'Di Ambil' && (
                 <View style={[styles.btnAction, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.btnText, {color: '#94A3B8'}]}>Kasus Selesai</Text>
                 </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  logoContainer: { width: 45, height: 45, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  hotspotBanner: { backgroundColor: '#EF4444', borderRadius: 16, padding: 15, marginBottom: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#EF4444', shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 },
  hotspotIcon: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  hotspotTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hotspotDesc: { color: '#fff', fontSize: 12, marginTop: 2, opacity: 0.9 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '31%', padding: 12, borderRadius: 16, height: 100, justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
  statIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  statCount: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  actionCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, ...Colors.shadow },
  iconCircle: { width: 40, height: 40, backgroundColor: Colors.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  actionTitle: { fontWeight: 'bold', fontSize: 16, color: Colors.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: Colors.textPrimary },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  reportCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, flexDirection: 'row', marginBottom: 15, ...Colors.shadow, height: 100, alignItems: 'center' },
  reportNopol: { fontWeight: 'bold', fontSize: 16, color: Colors.textPrimary },
  reportName: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  reportDate: { fontSize: 11, color: '#888' },
  reportImage: { width: 80, height: 80, borderRadius: 12, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  btnAction: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});