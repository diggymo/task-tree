import { invoke } from '@tauri-apps/api/core';
import { useCallback, useState } from 'react';
import type { TaskImage } from '../types/task';
import { generateId } from '../utils/taskOperations';

interface UploadImageResponse {
  s3_key: string;
  presigned_url: string;
}

export interface UseImageUploadReturn {
  uploadImage: (
    taskId: string,
    file: File,
    currentImageCount: number,
  ) => Promise<TaskImage>;
  isUploading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (
      taskId: string,
      file: File,
      currentImageCount: number,
    ): Promise<TaskImage> => {
      setIsUploading(true);
      setError(null);

      try {
        // ファイルをBase64に変換
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(
          uint8Array.reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );

        // 拡張子を取得
        const extension = file.name.split('.').pop()?.toLowerCase() || 'png';

        // 連番を計算
        const sequenceNumber = currentImageCount + 1;

        // Rust側でS3にアップロード
        const response = await invoke<UploadImageResponse>(
          'upload_image_to_s3',
          {
            taskId,
            imageDataBase64: base64,
            fileExtension: extension,
            sequenceNumber,
          },
        );

        const taskImage: TaskImage = {
          id: generateId(),
          s3Key: response.s3_key,
          presignedUrl: response.presigned_url,
          uploadedAt: new Date().toISOString(),
        };

        return taskImage;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    uploadImage,
    isUploading,
    error,
  };
}
