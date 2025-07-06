// 上传状态
export type UploadStatus =
  | "preparing"
  | "pending"
  | "uploading"
  | "paused"
  | "completed"
  | "failed";

// 文件分片信息
export interface FileChunk {
  index: number;
  start: number;
  end: number;
  hash: string;
  size: number;
  status: UploadStatus;
}

// 上传文件信息

// 仅内存用，含 file 字段
export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  hash: string;
  chunks: FileChunk[];
  status: UploadStatus;
  progress: number;
  uploadedSize: number;
}

// 用于 IndexedDB 持久化，不含 file 字段
export interface UploadFilePersist {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  chunks: FileChunk[];
  status: UploadStatus;
  progress: number;
  uploadedSize: number;
}

// API请求类型
export interface UploadChunkRequest {
  fileId: string;
  chunkIndex: number;
  chunkHash: string;
  chunkData: Blob;
}

export interface CompleteUploadRequest {
  fileId: string;
  fileName: string;
  chunks: number;
}
