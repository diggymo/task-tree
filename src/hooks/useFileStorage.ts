import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';
import { appDataDir } from '@tauri-apps/api/path';
import type { SavedData } from '../types/task';

const APP_DATA_FILE = 'tasktree-data.json';

export const saveToAppData = async (data: SavedData): Promise<boolean> => {
  try {
    // Ensure AppData directory exists
    const appData = await appDataDir();
    const dirExists = await exists(appData);
    if (!dirExists) {
      await mkdir(appData, { recursive: true });
    }

    await writeTextFile(APP_DATA_FILE, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppData,
    });
    console.log('Saved to AppData:', APP_DATA_FILE);
    return true;
  } catch (err) {
    console.error('Failed to save to AppData:', err);
    return false;
  }
};

export const loadFromAppData = async (): Promise<SavedData | null> => {
  try {
    const fileExists = await exists(APP_DATA_FILE, {
      baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) {
      console.log('No saved data found');
      return null;
    }

    const content = await readTextFile(APP_DATA_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    console.log('Loaded from AppData:', APP_DATA_FILE);
    return JSON.parse(content) as SavedData;
  } catch (err) {
    console.error('Failed to load from AppData:', err);
    return null;
  }
};

export const exportToFile = async (data: SavedData): Promise<boolean> => {
  try {
    const filePath = await save({
      defaultPath: `task-tree-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!filePath) return false;

    await writeTextFile(filePath, JSON.stringify(data, null, 2));
    console.log('Exported to:', filePath);
    return true;
  } catch (err) {
    console.error('Failed to export:', err);
    return false;
  }
};

export const importFromFile = async (): Promise<SavedData | null> => {
  try {
    const filePath = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!filePath || typeof filePath !== 'string') return null;

    const content = await readTextFile(filePath);
    const data = JSON.parse(content) as SavedData;

    // Validate the imported data structure
    if (!data.root || !data.root.id || !Array.isArray(data.root.children)) {
      throw new Error('Invalid file format');
    }

    console.log('Imported from:', filePath);
    return data;
  } catch (err) {
    console.error('Failed to import:', err);
    return null;
  }
};
