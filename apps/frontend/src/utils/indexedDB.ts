// IndexedDB 工具类 - 离线数据存储管理

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string;
  unique?: boolean;
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: DBConfig;

  constructor(config: DBConfig) {
    this.config = config;
  }

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new Error(`数据库打开失败: ${request.error?.message}`));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log(`数据库 ${this.config.name} 初始化成功`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        for (const storeConfig of this.config.stores) {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement
            });

            // 创建索引
            if (storeConfig.indexes) {
              for (const indexConfig of storeConfig.indexes) {
                store.createIndex(indexConfig.name, indexConfig.keyPath, {
                  unique: indexConfig.unique || false
                });
              }
            }

            console.log(`对象存储 ${storeConfig.name} 创建成功`);
          }
        }
      };
    });
  }

  // 添加数据
  async add(storeName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 更新数据
  async put(storeName: string, data: any): Promise<any> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取单条数据
  async get(storeName: string, key: any): Promise<any> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有数据
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除数据
  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 清空存储
  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 计数
  async count(storeName: string): Promise<number> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通过索引查询
  async getByIndex(storeName: string, indexName: string, key: any): Promise<any> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 通过索引获取所有数据
  async getAllByIndex(storeName: string, indexName: string, key?: any): Promise<any[]> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = key ? index.getAll(key) : index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 游标遍历
  async iterate(
    storeName: string, 
    callback: (cursor: IDBCursorWithValue) => void,
    direction: IDBCursorDirection = 'next'
  ): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor(null, direction);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          callback(cursor);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 批量操作
  async batch(operations: Array<{
    type: 'add' | 'put' | 'delete';
    storeName: string;
    data?: any;
    key?: any;
  }>): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    const storeNames = [...new Set(operations.map(op => op.storeName))];
    const transaction = this.db.transaction(storeNames, 'readwrite');

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const operation of operations) {
        const store = transaction.objectStore(operation.storeName);
        
        switch (operation.type) {
          case 'add':
            store.add(operation.data);
            break;
          case 'put':
            store.put(operation.data);
            break;
          case 'delete':
            store.delete(operation.key);
            break;
        }
      }
    });
  }

  // 获取存储信息
  async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    usageDetails: Record<string, number>;
  }> {
    const info = {
      usage: 0,
      quota: 0,
      usageDetails: {} as Record<string, number>
    };

    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.usage = estimate.usage || 0;
        info.quota = estimate.quota || 0;
      }

      // 估算各个存储的大小
      for (const storeConfig of this.config.stores) {
        const data = await this.getAll(storeConfig.name);
        const size = new Blob([JSON.stringify(data)]).size;
        info.usageDetails[storeConfig.name] = size;
      }
    } catch (error) {
      console.error('获取存储信息失败:', error);
    }

    return info;
  }

  // 导出数据
  async exportData(): Promise<string> {
    const exportData: Record<string, any[]> = {};

    for (const storeConfig of this.config.stores) {
      exportData[storeConfig.name] = await this.getAll(storeConfig.name);
    }

    return JSON.stringify({
      version: this.config.version,
      timestamp: Date.now(),
      data: exportData
    }, null, 2);
  }

  // 导入数据
  async importData(jsonData: string): Promise<void> {
    const importData = JSON.parse(jsonData);
    
    if (!importData.data) {
      throw new Error('无效的导入数据格式');
    }

    const operations: Array<{
      type: 'put';
      storeName: string;
      data: any;
    }> = [];

    for (const [storeName, records] of Object.entries(importData.data)) {
      if (Array.isArray(records)) {
        for (const record of records) {
          operations.push({
            type: 'put',
            storeName,
            data: record
          });
        }
      }
    }

    await this.batch(operations);
  }

  // 关闭数据库
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log(`数据库 ${this.config.name} 已关闭`);
    }
  }

  // 删除数据库
  static async deleteDatabase(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      
      request.onsuccess = () => {
        console.log(`数据库 ${name} 已删除`);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn(`数据库 ${name} 删除被阻塞，请关闭其他标签页`);
      };
    });
  }
}

// 默认配置
export const defaultDBConfig: DBConfig = {
  name: 'OfflineOptimizationDB',
  version: 1,
  stores: [
    {
      name: 'cache_data',
      keyPath: 'key',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'type', keyPath: 'type' }
      ]
    },
    {
      name: 'user_data',
      keyPath: 'key',
      indexes: [
        { name: 'userId', keyPath: 'userId' },
        { name: 'lastModified', keyPath: 'lastModified' }
      ]
    },
    {
      name: 'sync_queue',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'status', keyPath: 'status' },
        { name: 'priority', keyPath: 'priority' },
        { name: 'createdAt', keyPath: 'createdAt' }
      ]
    }
  ]
};

// 创建默认实例
export const dbManager = new IndexedDBManager(defaultDBConfig);
