import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Song } from '../db';
import { create } from 'zustand';

interface AudioState {
    currentSong: Song | null;
    isPlaying: boolean;
    sound: Audio.Sound | null;
    queue: Song[];
    currentIndex: number;
    playSong: (song: Song, queue?: Song[]) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    addToQueue: (song: Song) => void;
    setupAudio: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    sound: null,
    queue: [],
    currentIndex: -1,

    setupAudio: async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            });
        } catch (e) {
            console.error("Audio Setup Failed", e);
        }
    },

    playSong: async (song: Song, newQueue?: Song[]) => {
        const { sound, queue } = get();

        // Unload previous sound
        if (sound) {
            await sound.unloadAsync();
        }

        const activeQueue = newQueue || queue;
        const index = activeQueue.findIndex(s => s.id === song.id);

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: song.uri },
                { shouldPlay: true }
            );

            // Handle song finish (auto-next)
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    get().next();
                }
            });

            set({
                currentSong: song,
                sound: newSound,
                isPlaying: true,
                queue: activeQueue,
                currentIndex: index,
            });
        } catch (error) {
            console.error("Error playing song", error);
        }
    },

    pause: async () => {
        const { sound } = get();
        if (sound) {
            await sound.pauseAsync();
            set({ isPlaying: false });
        }
    },

    resume: async () => {
        const { sound } = get();
        if (sound) {
            await sound.playAsync();
            set({ isPlaying: true });
        }
    },

    next: async () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
            const nextSong = queue[currentIndex + 1];
            await get().playSong(nextSong);
        }
    },

    prev: async () => {
        const { queue, currentIndex } = get();
        if (currentIndex > 0) {
            const prevSong = queue[currentIndex - 1];
            await get().playSong(prevSong);
        } else {
            // Restart song if it's the first one
            const { sound } = get();
            if (sound) await sound.replayAsync();
        }
    },

    addToQueue: (song: Song) => {
        const { queue } = get();
        // Avoid duplicates if desired, or allow them. tailored for "Queue" usually means append.
        set({ queue: [...queue, song] });
    },
}));
