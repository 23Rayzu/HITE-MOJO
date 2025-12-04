import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { db } from '../../configs/firebase';
import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

// DATA POLRES/POLSEK (Static)
const policeStations = [
    { id: 'p1', name: 'Polsek Mlati', lat: -7.730907590477738, lng: 110.32728787725102, type: 'police' },
    { id: 'p2', name: 'Polsek Ngaglik', lat: -7.721237252656924, lng: 110.40371598265047, type: 'police' },
    { id: 'p3', name: 'Polsek Depok Timur', lat: -7.760808680759336, lng: 110.41638748208028, type: 'police' },
    { id: 'p4', name: 'Polsek Bulak Sumur', lat: -7.770381544936334, lng: 110.38488704715704, type: 'police' },
    { id: 'p5', name: 'Polsek Danurejan', lat: -7.78786114264994, lng: 110.37803227475611, type: 'police' },
    { id: 'p6', name: 'Polsek Tegalrejo', lat: -7.771640089724118, lng: 110.36233208166885, type: 'police' },
    { id: 'p7', name: 'Polsek Jetis', lat: -7.78232378523731, lng: 110.36075793970635, type: 'police' },
    { id: 'p8', name: 'Polsek Gedongtengen', lat: -7.7884873770541425, lng: 110.3615023843187, type: 'police' },
    { id: 'p9', name: 'Polsek Gondokusuman', lat: -7.789274321860955, lng: 110.38953918246153, type: 'police' },
    { id: 'p10', name: 'Polsek Pakualaman', lat: -7.795992328959214, lng: 110.37700790323746, type: 'police' },
    { id: 'p11', name: 'Polsek Ngampilan', lat: -7.796077366332747, lng: 110.36224502634333, type: 'police' },
    { id: 'p12', name: 'Polsek Godean', lat: -7.7670272760633425, lng: 110.30958735340583, type: 'police' },
    { id: 'p13', name: 'Polsek Depok Barat', lat: -7.78093299495256, lng: 110.40724489115944, type: 'police' },
    { id: 'p14', name: 'Polda DIY', lat: -7.7578899580306, lng: 110.40051399973669, type: 'police' },
];

export default function PetaScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); 
    const mapRef = useRef<MapView>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // STATE BARU: Untuk menyimpan data marker yang sedang diklik
    const [selectedMarker, setSelectedMarker] = useState<any>(null);
    
    const [hotspot, setHotspot] = useState<{ center: { latitude: number, longitude: number }, radius: number, name: string, count: number } | null>(null);

    const initialRegion = {
        latitude: -7.770,
        longitude: 110.370,
        latitudeDelta: 0.13,
        longitudeDelta: 0.13,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Hilang': return '#FF3B30';
            case 'Ditemukan': return '#F59E0B';
            case 'Di Ambil': return '#10B981';
            default: return '#FF3B30';
        }
    };

    useEffect(() => {
        if (params.lat && params.lng && mapRef.current) {
            const lat = parseFloat(params.lat as string);
            const lng = parseFloat(params.lng as string);
            mapRef.current.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [params]);

    useEffect(() => {
        const reportsRef = ref(db, 'laporan_curanmor/');
        const unsubscribe = onValue(reportsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const locs: any[] = [];
                const stats: Record<string, { count: number, coords: {lat: number, lng: number}[] }> = {};

                Object.keys(data).forEach(key => {
                    if (data[key].coordinates) {
                        const [latStr, lngStr] = data[key].coordinates.split(',');
                        const lat = parseFloat(latStr.trim());
                        const lng = parseFloat(lngStr.trim());

                        locs.push({ 
                            id: key, 
                            ...data[key], 
                            latitude: lat, 
                            longitude: lng,
                            type: 'report' // Penanda tipe data
                        });

                        if (data[key].status === 'Hilang') {
                            const kec = data[key].kecamatan || 'Diketahui';
                            if (!stats[kec]) { stats[kec] = { count: 0, coords: [] }; }
                            stats[kec].count += 1;
                            stats[kec].coords.push({ lat, lng });
                        }
                    }
                });

                setLocations(locs);

                let maxKec = null; let maxCount = 0;
                Object.keys(stats).forEach(kec => {
                    if (stats[kec].count > maxCount) { maxCount = stats[kec].count; maxKec = kec; }
                });

                if (maxKec && maxCount > 0) {
                    const coords = stats[maxKec].coords;
                    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
                    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
                    setHotspot({ center: { latitude: avgLat, longitude: avgLng }, radius: 1500, name: maxKec, count: maxCount });
                } else {
                    setHotspot(null);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Function saat marker dipencet
    const handleMarkerPress = (item: any) => {
        setSelectedMarker(item);
        
        // Opsional: Animate peta ke titik tersebut agar center
        mapRef.current?.animateToRegion({
            latitude: item.latitude || item.lat,
            longitude: item.longitude || item.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }, 500);
    };

    // Function menutup card
    const closeCard = () => {
        setSelectedMarker(null);
    };

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                showsUserLocation={true}
                toolbarEnabled={false}
                // Menutup card jika peta diklik di area kosong
                onPress={closeCard} 
            >
                {hotspot && (
                    <Circle center={hotspot.center} radius={hotspot.radius * 0.2} fillColor="rgba(239, 68, 68, 0.3)" strokeColor="rgba(239, 68, 68, 0.8)" strokeWidth={2} zIndex={1} />
                )}

                {/* MARKER MOTOR */}
                {locations.map((loc) => (
                    <Marker
                        key={`${loc.id}-${loc.status}`} 
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        pinColor={getStatusColor(loc.status)}
                        zIndex={2}
                        onPress={() => handleMarkerPress(loc)} // Set data ke state
                    />
                ))}

                {/* MARKER POLISI */}
                {policeStations.map((station, index) => (
                    <Marker 
                        key={`police-${index}`} 
                        coordinate={{ latitude: station.lat, longitude: station.lng }} 
                        zIndex={3}
                        onPress={() => handleMarkerPress(station)} // Set data ke state
                    >
                        <View style={styles.policeIconContainer}><Ionicons name="shield" size={20} color="#0056b3" /></View>
                    </Marker>
                ))}
            </MapView>

            {/* BANNER HOTSPOT (Hanya muncul jika tidak ada marker yang dipilih) */}
            {hotspot && !selectedMarker && (
                <View style={styles.hotspotAlert}>
                    <MaterialCommunityIcons name="alert-decagram" size={24} color="#fff" style={{marginRight: 10}} />
                    <View><Text style={styles.hotspotAlertTitle}>ZONA MERAH: {hotspot.name.toUpperCase()}</Text><Text style={styles.hotspotAlertDesc}>{hotspot.count} Kasus Aktif. Area Rawan!</Text></View>
                </View>
            )}

            {/* --- KARTU INFORMASI (POPUP CUSTOM) --- */}
            {selectedMarker && (
                <View style={styles.infoCardContainer}>
                    <View style={styles.infoCardHeader}>
                        <View style={{flexDirection:'row', alignItems:'center', flex: 1}}>
                            <Ionicons 
                                name={selectedMarker.type === 'police' ? "shield-checkmark" : "warning"} 
                                size={24} 
                                color={selectedMarker.type === 'police' ? "#0056b3" : Colors.primary} 
                                style={{marginRight: 10}}
                            />
                            <Text style={styles.infoCardTitle} numberOfLines={1}>
                                {selectedMarker.type === 'police' ? selectedMarker.name : selectedMarker.jenisMotor}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={closeCard}>
                            <Ionicons name="close-circle" size={28} color="#ccc" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCardContent}>
                        {selectedMarker.type === 'police' ? (
                            // TAMPILAN UNTUK POLISI
                            <View>
                                <Text style={styles.infoLabel}>Kategori: Kantor Polisi</Text>
                                <Text style={styles.infoDesc}>Titik koordinasi dan pelaporan resmi.</Text>
                            </View>
                        ) : (
                            // TAMPILAN UNTUK MOTOR
                            <View>
                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Plat Nomor:</Text>
                                    <Text style={styles.infoValue}>{selectedMarker.nopol}</Text>
                                </View>
                                
                                <View style={styles.row}>
                                    <Text style={styles.infoLabel}>Status:</Text>
                                    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(selectedMarker.status)}]}>
                                        <Text style={styles.statusText}>{selectedMarker.status}</Text>
                                    </View>
                                </View>

                                {/* Tombol Detail hanya untuk Motor */}
                                <TouchableOpacity 
                                    style={styles.detailButton}
                                    onPress={() => router.push(`/detail?id=${selectedMarker.id}`)}
                                >
                                    <Text style={styles.detailButtonText}>Lihat Detail Lengkap</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* LEGEND (Hanya muncul jika tidak ada marker yang dipilih) */}
            {!selectedMarker && (
                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Keterangan Peta</Text>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FF3B30' }]} /><Text style={styles.legendText}>Hilang (Proses)</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.legendText}>Ditemukan</Text></View>
                    <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#10B981' }]} /><Text style={styles.legendText}>Diambil (Selesai)</Text></View>
                    <View style={styles.legendItem}><Ionicons name="shield" size={14} color="#0056b3" style={{ marginRight: 6 }} /><Text style={styles.legendText}>Kantor Polisi</Text></View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    
    hotspotAlert: { position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 6, zIndex: 10 },
    hotspotAlertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    hotspotAlertDesc: { color: '#fff', fontSize: 11 },
    
    policeIconContainer: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 3, borderRadius: 15, borderWidth: 1.5, borderColor: '#0056b3' },
    
    // --- STYLE KARTU INFORMASI (POPUP) ---
    infoCardContainer: {
        position: 'absolute',
        bottom: 100, // Di atas Tab Bar
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 5,
        elevation: 10, // Shadow Android
        shadowColor: '#000', // Shadow iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        zIndex: 20,
    },
    infoCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    infoCardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, flex: 1 },
    infoCardContent: { padding: 15 },
    
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoLabel: { fontSize: 13, color: '#666', width: 80 },
    infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    infoDesc: { fontSize: 13, color: '#555', fontStyle: 'italic', marginTop: 2 },
    
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    
    detailButton: {
        marginTop: 10,
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginRight: 5 },

    // Legend
    legendContainer: { position: 'absolute', bottom: 100, left: 20, backgroundColor: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 12, elevation: 5 },
    legendTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendText: { fontSize: 11, fontWeight: '600', color: '#444' }
});