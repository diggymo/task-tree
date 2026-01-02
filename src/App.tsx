import { useState, useCallback } from 'react';
import type { SavedData, TaskRoot, ViewOffset } from './types/task';
import { createInitialData } from './types/task';
import LoadingScreen from './components/LoadingScreen';
import RestoreDialog from './components/RestoreDialog';
import TaskTree from './components/TaskTree';
import { useDebouncedSave } from './hooks/useDebouncedSave';
import { exportToFile, importFromFile } from './hooks/useFileStorage';

type AppPhase = 'loading' | 'choose' | 'ready';

function App() {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [initialData, setInitialData] = useState<SavedData | null>(null);
  const [currentData, setCurrentData] = useState<SavedData | null>(null);
  const { saveStatus, scheduleSave } = useDebouncedSave();

  const handleDataLoaded = (data: SavedData | null) => {
    if (data) {
      setSavedData(data);
      setPhase('choose');
    } else {
      const initial = createInitialData();
      setInitialData(initial);
      setCurrentData(initial);
      setPhase('ready');
    }
  };

  const handleRestore = () => {
    if (savedData) {
      setInitialData(savedData);
      setCurrentData(savedData);
      setPhase('ready');
    }
  };

  const handleStartFresh = () => {
    const initial = createInitialData();
    setInitialData(initial);
    setCurrentData(initial);
    setPhase('ready');
  };

  const handleDataChange = useCallback((root: TaskRoot, viewOffset: ViewOffset, zoom: number) => {
    const newData: SavedData = {
      root,
      viewOffset,
      zoom,
      savedAt: new Date().toISOString()
    };
    setCurrentData(newData);
    scheduleSave(newData);
  }, [scheduleSave]);

  const handleExport = useCallback(async () => {
    if (currentData) {
      await exportToFile(currentData);
    }
  }, [currentData]);

  const handleImport = useCallback(async () => {
    const imported = await importFromFile();
    if (imported) {
      const confirmed = window.confirm('インポートすると現在のデータは上書きされます。続行しますか？');
      if (confirmed) {
        setInitialData(imported);
        setCurrentData(imported);
        scheduleSave(imported);
        // Force re-render by updating phase temporarily
        setPhase('loading');
        setTimeout(() => setPhase('ready'), 500);
      }
    }
  }, [scheduleSave]);

  if (phase === 'loading') {
    return <LoadingScreen onDataLoaded={handleDataLoaded} />;
  }

  if (phase === 'choose' && savedData) {
    return (
      <RestoreDialog
        savedData={savedData}
        onRestore={handleRestore}
        onStartFresh={handleStartFresh}
      />
    );
  }

  if (phase === 'ready' && initialData) {
    return (
      <TaskTree
        initialData={initialData}
        onDataChange={handleDataChange}
        saveStatus={saveStatus}
        onExport={handleExport}
        onImport={handleImport}
      />
    );
  }

  return null;
}

export default App;
