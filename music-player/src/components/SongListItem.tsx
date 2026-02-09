import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Song } from '../db';
import { LucideMusic, LucideListPlus } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useRef } from 'react';

interface Props {
    song: Song;
    onPress: () => void;
    onQueue: () => void;
    isActive: boolean;
}

export const SongListItem = ({ song, onPress, onQueue, isActive }: Props) => {
    const swipeableRef = useRef<Swipeable>(null);

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        return (
            <View className="bg-indigo-500 justify-center items-start px-6 flex-1">
                <Animated.View style={{ transform: [{ scale }] }} className="flex-row items-center">
                    {/* @ts-expect-error - Lucide icons accept color prop at runtime */}
                    <LucideListPlus color="white" size={24} />
                    <Text className="text-white font-bold ml-2">Add to Queue</Text>
                </Animated.View>
            </View>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            onSwipeableLeftOpen={() => {
                onQueue();
                swipeableRef.current?.close();
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 border-b border-gray-100 ${isActive ? 'bg-gray-50' : 'bg-white'}`}
            >
                <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4 ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    {/* @ts-expect-error - Lucide icons accept color prop at runtime */}
                    <LucideMusic size={24} color={isActive ? '#6366f1' : '#9ca3af'} />
                </View>

                <View className="flex-1">
                    <Text numberOfLines={1} className={`font-semibold text-base ${isActive ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {song.title || song.filename}
                    </Text>
                    <Text numberOfLines={1} className="text-gray-500 text-sm mt-0.5">
                        {song.artist || 'Unknown Artist'}
                    </Text>
                </View>

                <Text className="text-gray-400 text-xs ml-2">
                    {formatDuration(song.duration)}
                </Text>
            </TouchableOpacity>
        </Swipeable>
    );
};

const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};
