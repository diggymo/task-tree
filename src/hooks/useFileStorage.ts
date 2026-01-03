import type { SavedData } from '../types/task';

const APP_DATA_FILE = 'tasktree-data.json';
const isWebMode = __GITHUB_PAGES__;

// Tauri APIs are dynamically imported only in non-web mode
const getTauriApis = async () => {
  const fs = await import('@tauri-apps/plugin-fs');
  const dialog = await import('@tauri-apps/plugin-dialog');
  const path = await import('@tauri-apps/api/path');
  return { fs, dialog, path };
};

export const saveToAppData = async (data: SavedData): Promise<boolean> => {
  if (isWebMode) {
    // Web mode: use localStorage
    try {
      localStorage.setItem(APP_DATA_FILE, JSON.stringify(data));
      console.log('Saved to localStorage:', APP_DATA_FILE);
      return true;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      return false;
    }
  }

  // Tauri mode
  try {
    const { fs, path } = await getTauriApis();
    const appData = await path.appDataDir();
    const dirExists = await fs.exists(appData);
    if (!dirExists) {
      await fs.mkdir(appData, { recursive: true });
    }

    await fs.writeTextFile(APP_DATA_FILE, JSON.stringify(data, null, 2), {
      baseDir: fs.BaseDirectory.AppData,
    });
    console.log('Saved to AppData:', APP_DATA_FILE);
    return true;
  } catch (err) {
    console.error('Failed to save to AppData:', err);
    return false;
  }
};

export const loadFromAppData = async (): Promise<SavedData | null> => {
  if (isWebMode) {
    // Web mode: use localStorage
    try {
      const content = localStorage.getItem(APP_DATA_FILE);
      if (!content) {
        console.log('No saved data found in localStorage');
        return null;
      }
      console.log('Loaded from localStorage:', APP_DATA_FILE);
      return JSON.parse(content) as SavedData;
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
      return null;
    }
  }

  // Tauri mode
  try {
    const { fs } = await getTauriApis();
    const fileExists = await fs.exists(APP_DATA_FILE, {
      baseDir: fs.BaseDirectory.AppData,
    });

    if (!fileExists) {
      console.log('No saved data found');
      return null;
    }

    const content = await fs.readTextFile(APP_DATA_FILE, {
      baseDir: fs.BaseDirectory.AppData,
    });
    console.log('Loaded from AppData:', APP_DATA_FILE);
    return JSON.parse(content) as SavedData;
  } catch (err) {
    console.error('Failed to load from AppData:', err);
    return null;
  }
};

export const exportToFile = async (data: SavedData): Promise<boolean> => {
  const filename = `task-tree-${new Date().toISOString().slice(0, 10)}.json`;

  if (isWebMode) {
    // Web mode: use Blob and download link
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Exported via download:', filename);
      return true;
    } catch (err) {
      console.error('Failed to export:', err);
      return false;
    }
  }

  // Tauri mode
  try {
    const { fs, dialog } = await getTauriApis();
    const filePath = await dialog.save({
      defaultPath: filename,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!filePath) return false;

    await fs.writeTextFile(filePath, JSON.stringify(data, null, 2));
    console.log('Exported to:', filePath);
    return true;
  } catch (err) {
    console.error('Failed to export:', err);
    return false;
  }
};

export const importFromFile = async (): Promise<SavedData | null> => {
  if (isWebMode) {
    // Web mode: use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const content = await file.text();
          const data = JSON.parse(content) as SavedData;

          // Validate the imported data structure
          if (!data.root || !data.root.id || !Array.isArray(data.root.children)) {
            throw new Error('Invalid file format');
          }

          console.log('Imported from file:', file.name);
          resolve(data);
        } catch (err) {
          console.error('Failed to import:', err);
          resolve(null);
        }
      };

      input.oncancel = () => {
        resolve(null);
      };

      input.click();
    });
  }

  // Tauri mode
  try {
    const { fs, dialog } = await getTauriApis();
    const filePath = await dialog.open({
      multiple: false,
      directory: false,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!filePath || typeof filePath !== 'string') return null;

    const content = await fs.readTextFile(filePath);
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
