import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('nisaptham.db');

export interface Song {
    id: string; // File URI or unique ID
    filename: string;
    uri: string;
    duration: number; // in seconds
    title?: string;
    artist?: string;
    album?: string;
    albumId?: string;
    isFavorite?: boolean; // 0 or 1
}

export const initDatabase = () => {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      filename TEXT NOT NULL,
      uri TEXT NOT NULL,
      duration REAL,
      title TEXT,
      artist TEXT,
      album TEXT,
      albumId TEXT,
      isFavorite INTEGER DEFAULT 0
    );
  `);
};

export const addSong = (song: Song) => {
    db.runSync(
        `INSERT OR REPLACE INTO songs (id, filename, uri, duration, title, artist, album, albumId, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT isFavorite FROM songs WHERE id = ?), 0))`,
        song.id,
        song.filename,
        song.uri,
        song.duration,
        song.title,
        song.artist,
        song.album,
        song.albumId,
        song.id // Check persistence of favorite status
    );
};

export const getSongs = (): Song[] => {
    return db.getAllSync<Song>('SELECT * FROM songs ORDER BY title ASC');
};

export const toggleFavorite = (id: string) => {
    db.runSync(
        'UPDATE songs SET isFavorite = NOT isFavorite WHERE id = ?',
        id
    );
};
