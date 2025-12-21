import { exists, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const APP_DATA_FILE = 'data.json';

export interface AppData {
    xp: number;
    tasks: any[];
    activeTaskId: string | null;
    unlockedAchievements: string[];
    settings: any;
    focusSessions: any[];
}

export async function saveData(data: Partial<AppData>) {
    try {
        await writeTextFile(APP_DATA_FILE, JSON.stringify(data, null, 2), {
            baseDir: BaseDirectory.AppLocalData,
        });
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

export async function loadData(): Promise<Partial<AppData> | null> {
    try {
        const fileExists = await exists(APP_DATA_FILE, {
            baseDir: BaseDirectory.AppLocalData,
        });

        if (!fileExists) {
            return null;
        }

        const content = await readTextFile(APP_DATA_FILE, {
            baseDir: BaseDirectory.AppLocalData,
        });

        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to load data:', e);
        return null;
    }
}
