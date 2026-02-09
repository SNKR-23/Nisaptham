import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { scanLibrary } from "../src/services/library";
import { getSongs, Song, initDatabase } from "../src/db";
import { SongListItem } from "../src/components/SongListItem";
import { useAudioStore } from "../src/services/audio";
import { LucideRefreshCw } from "lucide-react-native";

export default function Library() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const { playSong, currentSong, setupAudio } = useAudioStore();

    const loadSongs = async () => {
        setLoading(true);
        // Ensure DB is ready and fetch
        try {
            const data = await getSongs();
            setSongs(data);
        } catch (e) {
            console.error("Failed to load songs", e);
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async () => {
        setLoading(true);
        await scanLibrary();
        await loadSongs();
    };

    useEffect(() => {
        initDatabase();
        setupAudio();
        loadSongs();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />

            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Nisaptham</Text>
                <TouchableOpacity onPress={handleScan} disabled={loading}>
                    <LucideRefreshCw size={24} color="#374151" className={loading ? "opacity-50" : ""} />
                </TouchableOpacity>
            </View>

            {loading && songs.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text className="text-gray-500 mt-4">Scanning Library...</Text>
                </View>
            ) : (
                <FlatList
                    data={songs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SongListItem
                            song={item}
                            isActive={currentSong?.id === item.id}
                            onPress={() => playSong(item, songs)}
                        />
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-gray-400">No songs found.</Text>
                            <Text className="text-gray-400 text-sm">Tap refresh to scan device.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
