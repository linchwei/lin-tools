export type TaskKey = string;
type Task = { fn: () => Promise<void>; key?: TaskKey };

export class Scheduler {
  private maxConcurrent: number;
  private running = 0;
  private queue: Task[] = [];

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  add(taskFn: () => Promise<void>, key?: TaskKey) {
    return new Promise<void>((resolve, reject) => {
      const wrappedTask: Task = {
        fn: async () => {
          try {
            await taskFn();
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            this.running--;
            this.next();
          }
        },
        key,
      };
      this.queue.push(wrappedTask);
      this.next();
    });
  }

  removeByKey(key: TaskKey) {
    this.queue = this.queue.filter((task) => task.key !== key);
  }

  clear() {
    this.queue = [];
  }

  private next() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.running++;
        task.fn();
      }
    }
  }

  getPendingCount() {
    return this.queue.length;
  }

  getRunningCount() {
    return this.running;
  }
}
