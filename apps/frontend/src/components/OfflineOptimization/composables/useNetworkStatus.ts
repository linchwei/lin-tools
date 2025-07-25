import { ref, reactive, onMounted, onUnmounted } from "vue";

// 网络连接信息接口
interface ConnectionInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// 网络状态类型
export type NetworkStatus = "online" | "offline" | "slow";

// 网络状态管理composable
export function useNetworkStatus() {
  // 响应式状态
  const networkStatus = ref<NetworkStatus>("online");
  const connectionInfo = ref<ConnectionInfo | null>(null);
  const networkQuality = ref(80);

  const networkInfo = reactive<ConnectionInfo>({
    type: "unknown",
    effectiveType: "4g",
    downlink: 10,
    rtt: 100,
    saveData: false,
  });

  const networkMetrics = reactive({
    stability: 95,
    availability: 98,
    latency: 50,
  });

  // 更新网络状态
  const updateNetworkStatus = () => {
    networkStatus.value = navigator.onLine ? "online" : "offline";
  };

  // 更新连接信息
  const updateConnectionInfo = () => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connectionInfo.value = connection;

      networkInfo.type = connection.type || "unknown";
      networkInfo.effectiveType = connection.effectiveType || "4g";
      networkInfo.downlink = connection.downlink || 10;
      networkInfo.rtt = connection.rtt || 100;
      networkInfo.saveData = connection.saveData || false;

      // 计算网络质量
      let quality = 100;
      if (connection.effectiveType === "slow-2g") quality = 20;
      else if (connection.effectiveType === "2g") quality = 40;
      else if (connection.effectiveType === "3g") quality = 60;
      else if (connection.effectiveType === "4g") quality = 80;

      if (connection.rtt > 300) quality -= 20;
      if (connection.downlink < 1) quality -= 20;

      networkQuality.value = Math.max(0, quality);

      // 根据网络状况调整状态
      if (quality < 40) {
        networkStatus.value = "slow";
      }
    }
  };

  // 获取网络状态文本
  const getNetworkStatusText = () => {
    switch (networkStatus.value) {
      case "online":
        return "在线";
      case "offline":
        return "离线";
      case "slow":
        return "网络较慢";
      default:
        return "未知";
    }
  };

  // 获取网络质量文本
  const getNetworkQualityText = () => {
    if (networkQuality.value >= 80) return "优秀";
    if (networkQuality.value >= 60) return "良好";
    if (networkQuality.value >= 40) return "一般";
    return "较差";
  };

  // 监控网络状态
  const startMonitoring = () => {
    updateNetworkStatus();
    updateConnectionInfo();

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    if ("connection" in navigator) {
      (navigator as any).connection.addEventListener(
        "change",
        updateConnectionInfo
      );
    }
  };

  // 停止监控
  const stopMonitoring = () => {
    window.removeEventListener("online", updateNetworkStatus);
    window.removeEventListener("offline", updateNetworkStatus);

    if ("connection" in navigator) {
      (navigator as any).connection.removeEventListener(
        "change",
        updateConnectionInfo
      );
    }
  };

  // 生命周期管理
  onMounted(() => {
    startMonitoring();
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    // 状态
    networkStatus,
    connectionInfo,
    networkInfo,
    networkQuality,
    networkMetrics,

    // 方法
    getNetworkStatusText,
    getNetworkQualityText,
    updateNetworkStatus,
    updateConnectionInfo,
    startMonitoring,
    stopMonitoring,
  };
}
