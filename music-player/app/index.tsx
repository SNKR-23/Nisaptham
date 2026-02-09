import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { scanLibrary } from "../src/services/library";
import { getSongs, Song, initDatabase } from "../src/db";
import { SongListItem } from "../src/components/SongListItem";
import { useAudioStore } from "../src/services/audio";
import { LucideRefreshCw, LucideMusic, LucidePlay, LucidePause } from "lucide-react-native";
import { PlayerModal } from "../src/components/PlayerModal";

export default function Library() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [playerVisible, setPlayerVisible] = useState(false);
    const { playSong, currentSong, isPlaying, setupAudio } = useAudioStore();

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
                    {/* @ts-expect-error - Lucide icons accept color prop at runtime */}
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
                            onQueue={() => {
                                useAudioStore.getState().addToQueue(item);
                                // Optional: Show toast
                            }}
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
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex-row items-center justify-between shadow-lg" style={{ paddingBottom: 24 }}>
                {currentSong && (
                    <TouchableOpacity onPress={() => setPlayerVisible(true)} className="flex-1 flex-row items-center">
                        <View className="w-10 h-10 bg-gray-100 rounded mr-3 items-center justify-center">
                            {/* @ts-expect-error - Lucide icons accept color prop at runtime */}
                            <LucideMusic size={20} color="#6366f1" />
                        </View>
                        <View>
                            <Text numberOfLines={1} className="font-semibold text-gray-900">{currentSong.title || currentSong.filename}</Text>
                            <Text numberOfLines={1} className="text-xs text-gray-500">{currentSong.artist || 'Unknown'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {currentSong && (
                    <TouchableOpacity onPress={isPlaying ? useAudioStore.getState().pause : useAudioStore.getState().resume} className="p-2">
                        {/* @ts-expect-error - Lucide icons accept color prop at runtime */}
                        {isPlaying ? <LucidePause size={24} color="#1f2937" /> : <LucidePlay size={24} color="#1f2937" />}
                    </TouchableOpacity>
                )}
            </View>

            <PlayerModal visible={playerVisible} onClose={() => setPlayerVisible(false)} />
        </SafeAreaView>
    );
}
