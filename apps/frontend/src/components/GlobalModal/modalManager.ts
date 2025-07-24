import { createApp, type App } from "vue";
import { ElButton, ElDialog, ElIcon } from "element-plus";
import GlobalModal, { type ModalConfig } from "./GlobalModal.vue";

interface ModalInstance {
  id: string;
  app: App;
  container: HTMLElement;
  component: any;
}

class ModalManager {
  private instances: Map<string, ModalInstance> = new Map();
  private zIndex = 2000;

  private createModalInstance(config: ModalConfig): ModalInstance {
    const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const container = document.createElement("div");
    container.id = id;
    document.body.appendChild(container);

    const app = createApp(GlobalModal, {
      config: {
        ...this.getDefaultConfig(),
        ...config,
      },
    });

    // 注册Element Plus组件
    app.component("ElButton", ElButton);
    app.component("ElDialog", ElDialog);
    app.component("ElIcon", ElIcon);

    const component = app.mount(container);

    const instance: ModalInstance = {
      id,
      app,
      container,
      component,
    };

    this.instances.set(id, instance);
    return instance;
  }

  private getDefaultConfig(): Partial<ModalConfig> {
    return {
      width: "500px",
      top: "15vh",
      modal: true,
      lockScroll: true,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      showClose: true,
      destroyOnClose: true,
      center: false,
      alignCenter: true,
      draggable: false,
    };
  }

  private destroyInstance(id: string) {
    const instance = this.instances.get(id);
    if (instance) {
      instance.app.unmount();
      document.body.removeChild(instance.container);
      this.instances.delete(id);
    }
  }

  // 显示模态框
  show(config: ModalConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      const instance = this.createModalInstance({
        ...config,
        onConfirm: async () => {
          try {
            const result = await config.onConfirm?.();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        onCancel: () => {
          config.onCancel?.();
          reject(new Error("User cancelled"));
        },
        onClosed: () => {
          config.onClosed?.();
          this.destroyInstance(instance.id);
        },
      });

      // 显示模态框
      nextTick(() => {
        instance.component.show();
      });
    });
  }

  // 确认对话框
  confirm(options: {
    title?: string;
    message: string;
    type?: "warning" | "info" | "error";
    confirmText?: string;
    cancelText?: string;
  }): Promise<void> {
    return this.show({
      type: "confirm",
      title: options.title || "确认",
      message: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      width: "420px",
    });
  }

  // 信息提示
  info(message: string, title?: string): Promise<void> {
    return this.show({
      type: "info",
      title: title || "提示",
      message,
      showCancel: false,
      width: "420px",
    });
  }

  // 成功提示
  success(message: string, title?: string): Promise<void> {
    return this.show({
      type: "success",
      title: title || "成功",
      message,
      showCancel: false,
      width: "420px",
    });
  }

  // 警告提示
  warning(message: string, title?: string): Promise<void> {
    return this.show({
      type: "warning",
      title: title || "警告",
      message,
      showCancel: false,
      width: "420px",
    });
  }

  // 错误提示
  error(message: string, title?: string): Promise<void> {
    return this.show({
      type: "error",
      title: title || "错误",
      message,
      showCancel: false,
      width: "420px",
    });
  }

  // 自定义组件模态框
  component(
    component: any,
    props?: Record<string, any>,
    options?: Partial<ModalConfig>
  ): Promise<any> {
    return this.show({
      component,
      props,
      showFooter: false,
      ...options,
    });
  }

  // 销毁所有实例
  destroyAll() {
    this.instances.forEach((_, id) => {
      this.destroyInstance(id);
    });
  }
}

export const modalManager = new ModalManager();

// Vue插件
export default {
  install(app: App) {
    app.config.globalProperties.$modal = modalManager;
    app.provide("$modal", modalManager);
  },
};
