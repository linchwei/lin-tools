interface User {
  id: string;
  name: string;
  color: string;
}

interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

interface DrawingOperation {
  id: string;
  type: "draw" | "erase" | "shape" | "text" | "clear";
  tool: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  timestamp: number;
  userId: string;
}

export class WebRTCManager {
  public userId: string;
  private localConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isHost = false;
  private roomId = "";

  // 事件回调
  public onUserJoined?: (user: User) => void;
  public onUserLeft?: (userId: string) => void;
  public onDrawingReceived?: (operation: DrawingOperation) => void;
  public onCursorMoved?: (cursor: Cursor) => void;
  public onConnectionStatusChanged?: (
    status: "disconnected" | "connecting" | "connected"
  ) => void;

  constructor() {
    this.userId = this.generateUserId();
  }

  async createRoom(): Promise<string> {
    this.roomId = this.generateRoomId();
    this.isHost = true;

    await this.setupPeerConnection();
    this.onConnectionStatusChanged?.("connected");

    return this.roomId;
  }

  async joinRoom(roomId: string): Promise<void> {
    this.roomId = roomId;
    this.isHost = false;

    await this.setupPeerConnection();
    await this.connectToHost();
  }

  private async setupPeerConnection() {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    this.localConnection = new RTCPeerConnection(configuration);

    // 设置数据通道
    if (this.isHost) {
      this.dataChannel = this.localConnection.createDataChannel("whiteboard", {
        ordered: true,
      });
      this.setupDataChannel(this.dataChannel);
    } else {
      this.localConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };
    }

    // ICE候选处理
    this.localConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // 连接状态监听
    this.localConnection.onconnectionstatechange = () => {
      const state = this.localConnection?.connectionState;
      if (state === "connected") {
        this.onConnectionStatusChanged?.("connected");
      } else if (state === "disconnected" || state === "failed") {
        this.onConnectionStatusChanged?.("disconnected");
      }
    };
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log("数据通道已打开");
      this.sendUserInfo();
    };

    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("解析消息失败:", error);
      }
    };

    channel.onerror = (error) => {
      console.error("数据通道错误:", error);
    };
  }

  private async connectToHost() {
    if (!this.localConnection) return;

    // 创建offer
    const offer = await this.localConnection.createOffer();
    await this.localConnection.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: "offer",
      offer: offer,
    });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case "user-joined":
        this.onUserJoined?.(message.user);
        break;
      case "user-left":
        this.onUserLeft?.(message.userId);
        break;
      case "drawing-operation":
        this.onDrawingReceived?.(message.operation);
        break;
      case "cursor-position":
        this.onCursorMoved?.(message.cursor);
        break;
    }
  }

  sendDrawingOperation(operation: DrawingOperation) {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(
        JSON.stringify({
          type: "drawing-operation",
          operation,
        })
      );
    }
  }

  sendCursorPosition(position: { x: number; y: number }) {
    if (this.dataChannel?.readyState === "open") {
      const cursor: Cursor = {
        userId: this.userId,
        userName: this.getUserName(),
        x: position.x,
        y: position.y,
        color: this.getUserColor(),
      };

      this.dataChannel.send(
        JSON.stringify({
          type: "cursor-position",
          cursor,
        })
      );
    }
  }

  private sendUserInfo() {
    if (this.dataChannel?.readyState === "open") {
      const user: User = {
        id: this.userId,
        name: this.getUserName(),
        color: this.getUserColor(),
      };

      this.dataChannel.send(
        JSON.stringify({
          type: "user-joined",
          user,
        })
      );
    }
  }

  private sendSignalingMessage(message: any) {
    // 在实际应用中，这里应该通过信令服务器发送消息
    // 现在我们使用简化的本地实现
    console.log("发送信令消息:", message);
  }

  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.localConnection) {
      this.localConnection.close();
      this.localConnection = null;
    }

    this.onConnectionStatusChanged?.("disconnected");
  }

  private generateUserId(): string {
    return "user_" + Math.random().toString(36).substr(2, 9);
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private getUserName(): string {
    return `用户${this.userId.slice(-4)}`;
  }

  private getUserColor(): string {
    const colors = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
    ];
    const index = parseInt(this.userId.slice(-2), 36) % colors.length;
    return colors[index];
  }
}
