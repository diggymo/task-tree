import { useCallback, useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import RestoreDialog from './components/RestoreDialog';
import TaskTree from './components/TaskTree';
import { useDebouncedSave } from './hooks/useDebouncedSave';
import { exportToFile, importFromFile } from './hooks/useFileStorage';
import type { SavedData, TaskRoot, ViewOffset } from './types/task';
import { createInitialData } from './types/task';

// 単一のstateオブジェクトとして状態を定義
type AppState =
  | { phase: 'loading' }
  | { phase: 'choose'; savedData: SavedData }
  | { phase: 'ready'; currentData: SavedData; initialData: SavedData };

function App() {
  const [appState, setAppState] = useState<AppState>({ phase: 'loading' });
  const { saveStatus, scheduleSave } = useDebouncedSave();

  const handleDataLoaded = (data: SavedData | null) => {
    if (data) {
      setAppState({ phase: 'choose', savedData: data });
    } else {
      const initial = createInitialData();
      setAppState({
        phase: 'ready',
        currentData: initial,
        initialData: initial,
      });
    }
  };

  const handleRestore = () => {
    if (appState.phase === 'choose') {
      const { savedData } = appState;
      setAppState({
        phase: 'ready',
        currentData: savedData,
        initialData: savedData,
      });
    }
  };

  const handleStartFresh = () => {
    const initial = createInitialData();
    setAppState({ phase: 'ready', currentData: initial, initialData: initial });
  };

  const handleDataChange = useCallback(
    (root: TaskRoot, viewOffset: ViewOffset, zoom: number) => {
      const newData: SavedData = {
        root,
        viewOffset,
        zoom,
        savedAt: new Date().toISOString(),
      };
      setAppState((prev) => {
        if (prev.phase !== 'ready') return prev;
        return { ...prev, currentData: newData };
      });
      scheduleSave(newData);
    },
    [scheduleSave],
  );

  const handleExport = useCallback(async () => {
    if (appState.phase === 'ready') {
      await exportToFile(appState.currentData);
    }
  }, [appState]);

  const handleImport = useCallback(async () => {
    const imported = await importFromFile();
    if (imported) {
      const confirmed = window.confirm(
        'インポートすると現在のデータは上書きされます。続行しますか？',
      );
      if (confirmed) {
        scheduleSave(imported);
        // Force re-render by temporarily transitioning through loading
        setAppState({ phase: 'loading' });
        setTimeout(() => {
          setAppState({
            phase: 'ready',
            currentData: imported,
            initialData: imported,
          });
        }, 500);
      }
    }
  }, [scheduleSave]);

  // フェーズに応じたレンダリング
  switch (appState.phase) {
    case 'loading':
      return <LoadingScreen onDataLoaded={handleDataLoaded} />;

    case 'choose':
      return (
        <RestoreDialog
          savedData={appState.savedData}
          onRestore={handleRestore}
          onStartFresh={handleStartFresh}
        />
      );

    case 'ready':
      return (
        <TaskTree
          initialData={appState.initialData}
          onDataChange={handleDataChange}
          saveStatus={saveStatus}
          onExport={handleExport}
          onImport={handleImport}
        />
      );
  }
}

export default App;
