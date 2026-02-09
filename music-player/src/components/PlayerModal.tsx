import { View, Text, Modal, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useAudioStore } from '../services/audio';
import { LucidePlay, LucidePause, LucideSkipBack, LucideSkipForward, LucideChevronDown } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export const PlayerModal = ({ visible, onClose }: Props) => {
    const { currentSong, isPlaying, pause, resume, next, prev, sound } = useAudioStore();
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (sound) {
            sound.getStatusAsync().then(status => {
                if (status.isLoaded) {
                    setDuration(status.durationMillis || 0);
                    setPosition(status.positionMillis || 0);
                }
            });

            const interval = setInterval(() => {
                sound.getStatusAsync().then(status => {
                    if (status.isLoaded) {
                        setPosition(status.positionMillis);
                    }
                });
            }, 1000); // Poll every second for UI update

            return () => clearInterval(interval);
        }
    }, [sound, isPlaying]);

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const min = Math.floor(totalSeconds / 60);
        const sec = Math.floor(totalSeconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleSeek = async (value: number) => {
        if (sound) {
            await sound.setPositionAsync(value);
            setPosition(value);
        }
    };

    if (!currentSong) return null;

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-white items-center justify-center px-8">
                {/* Header */}
                <TouchableOpacity onPress={onClose} className="absolute top-12 left-6">
                    <LucideChevronDown size={32} color="#374151" />
                </TouchableOpacity>

                {/* Album Art Placeholder */}
                <View className="w-full aspect-square bg-gray-200 rounded-3xl mb-12 shadow-lg items-center justify-center">
                    <Text className="text-6xl">🎵</Text>
                </View>

                {/* Title & Artist */}
                <View className="items-center mb-8">
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        {currentSong.title || currentSong.filename}
                    </Text>
                    <Text className="text-lg text-gray-500 text-center">
                        {currentSong.artist || 'Unknown Artist'}
                    </Text>
                </View>

                {/* Seek Bar */}
                <View className="w-full mb-12">
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={handleSeek}
                        minimumTrackTintColor="#6366f1"
                        maximumTrackTintColor="#e5e7eb"
                        thumbTintColor="#6366f1"
                    />
                    <View className="flex-row justify-between pt-2">
                        <Text className="text-gray-400 text-xs">{formatTime(position)}</Text>
                        <Text className="text-gray-400 text-xs">{formatTime(duration)}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center justify-between w-64">
                    <TouchableOpacity onPress={prev}>
                        <LucideSkipBack size={32} color="#1f2937" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={isPlaying ? pause : resume}
                        className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center shadow-indigo-200 shadow-xl"
                    >
                        {isPlaying ? (
                            <LucidePause size={32} color="white" fill="white" />
                        ) : (
                            <LucidePlay size={32} color="white" fill="white" className="ml-1" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={next}>
                        <LucideSkipForward size={32} color="#1f2937" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
