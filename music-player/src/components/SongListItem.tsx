import { View, Text, TouchableOpacity } from 'react-native';
import { Song } from '../db';
import { LucideMusic } from 'lucide-react-native';

interface Props {
    song: Song;
    onPress: () => void;
    isActive: boolean;
}

export const SongListItem = ({ song, onPress, isActive }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center p-4 border-b border-gray-100 ${isActive ? 'bg-gray-50' : 'bg-white'}`}
        >
            <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4 ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
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
    );
};

const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};
