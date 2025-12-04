import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useAuth } from '../AuthContext';
// Komponen Reusable untuk Baris Menu
const ProfileOption = ({ icon, text, onPress, isDestructive = false }: { icon: any; text: string; onPress?: () => void, isDestructive?: boolean }) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
        <View style={[styles.optionIcon, isDestructive && { backgroundColor: '#FEE2E2' }]}>
            {icon}
        </View>
        <Text style={[styles.optionText, isDestructive && { color: '#E53E3E' }]}>{text}</Text>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={Colors.textSecondary} />
    </TouchableOpacity>
);
export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Apakah Anda yakin ingin keluar dari akun ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Ya, Keluar",
                    onPress: async () => {
                        try {
                            logout();
                            // Router akan otomatis redirect ke login karena AuthContext berubah
                        } catch (error) {
                            Alert.alert("Error", "Gagal logout.");
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil Saya</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <Image
                    source={{ uri: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=0D8ABC&color=fff&size=200` }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{user?.displayName || 'Pengguna'}</Text>
                <Text
                    style={styles.email}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {user?.email || 'email@contoh.com'}
                </Text>

            </View>

            {/* Menu Options */}
            <View style={styles.optionsContainer}>
                <ProfileOption
                    icon={<Ionicons name="person-outline" size={22} color={Colors.primary} />}
                    text="Edit Profil"
                    onPress={() => router.push('/edit-profile')}
                />

                {/* Navigasi ke Halaman Notifikasi */}
                <ProfileOption
                    icon={<Ionicons name="notifications-outline" size={22} color={Colors.primary} />}
                    text="Notifikasi"
                    onPress={() => router.push('/notifikasi')}
                />

                {/* Navigasi ke Halaman Keamanan */}
                <ProfileOption
                    icon={<Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />}
                    text="Keamanan"
                    onPress={() => router.push('/keamanan')}
                />

                <ProfileOption
                    icon={<MaterialIcons name="logout" size={22} color={'#E53E3E'} />}
                    text="Keluar"
                    onPress={handleLogout}
                    isDestructive={true}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { padding: 20, alignItems: 'center', paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    profileCard: { alignItems: 'center', padding: 30, backgroundColor: '#fff', marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: '#EBF2FF' },
    name: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
    email: { fontSize: 14, color: Colors.textSecondary, marginTop: 5 },
    optionsContainer: { paddingHorizontal: 20 },
    optionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, ...Colors.shadow },
    optionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center' },
    optionText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});