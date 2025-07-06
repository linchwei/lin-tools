import type { UploadFilePersist } from "@/types";

const LS_KEY = "uploads";

// 保存所有上传记录
export const saveAllUploads = (uploads: UploadFilePersist[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(uploads));
};

// 获取所有上传记录
export const getAllUploads = (): UploadFilePersist[] => {
  const data = localStorage.getItem(LS_KEY);
  return data ? JSON.parse(data) : [];
};

// 保存单条（会合并）
export const saveUpload = (file: UploadFilePersist) => {
  const uploads = getAllUploads();
  const idx = uploads.findIndex((u) => u.id === file.id);
  if (idx > -1) uploads[idx] = file;
  else uploads.push(file);
  saveAllUploads(uploads);
};

// 获取单个上传记录
export const getUpload = (id: string): UploadFilePersist | undefined => {
  return getAllUploads().find((u) => u.id === id);
};

// 删除上传记录
export const deleteUpload = (id: string) => {
  const uploads = getAllUploads().filter((u) => u.id !== id);
  saveAllUploads(uploads);
};
