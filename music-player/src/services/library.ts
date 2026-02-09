import * as MediaLibrary from 'expo-media-library';
import { addSong, Song, initDatabase } from '../db';

export const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
};

export const scanLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
        console.warn('Permission denied for media library');
        return;
    }

    // Ensure DB is ready
    try {
        initDatabase();
    } catch (e) {
        console.error("DB Init Error", e);
    }

    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
        const assets = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.audio,
            first: 50,
            after,
        });

        for (const asset of assets.assets) {
            // Basic check to filter out tiny clips/ringtones if needed (e.g. < 30s)
            if (asset.duration < 10) continue;

            const song: Song = {
                id: asset.id,
                filename: asset.filename,
                uri: asset.uri,
                duration: asset.duration,
                title: asset.filename.replace(/\.[^/.]+$/, ""), // Fallback title
                // MediaLibrary doesn't always give artist/album directly on Android without deeper parsing
                // We will store what we have for now. 
                // Future improvement: Use expo-music-metadata-reader or similar if needed.
            };

            try {
                addSong(song);
            } catch (e) {
                console.error("Error adding song", asset.filename, e);
            }
        }

        hasNextPage = assets.hasNextPage;
        after = assets.endCursor;
    }

    console.log("Library Scan Complete");
};
