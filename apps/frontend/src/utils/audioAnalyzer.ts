export interface AudioVisualizerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source:
    | MediaElementAudioSourceNode
    | AudioBufferSourceNode
    | MediaStreamAudioSourceNode
    | null = null;
  private dataArray: Uint8Array | null = null;
  private frequencyData: Uint8Array | null = null;
  private animationId: number | null = null;

  public isInitialized = false;
  public isPlaying = false;

  private options: AudioVisualizerOptions;

  constructor(options: AudioVisualizerOptions = {}) {
    this.options = {
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      minDecibels: -90,
      maxDecibels: -10,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();

      this.analyser.fftSize = this.options.fftSize!;
      this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant!;
      this.analyser.minDecibels = this.options.minDecibels!;
      this.analyser.maxDecibels = this.options.maxDecibels!;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      throw error;
    }
  }

  connectAudioElement(audioElement: HTMLAudioElement): void {
    if (!this.audioContext || !this.analyser) {
      throw new Error("AudioAnalyzer not initialized");
    }

    if (this.source) {
      this.source.disconnect();
    }

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  async connectMicrophone(): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      throw new Error("AudioAnalyzer not initialized");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.source) {
        this.source.disconnect();
      }

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
    } catch (error) {
      console.error("Failed to access microphone:", error);
      throw error;
    }
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser || !this.frequencyData) {
      throw new Error("AudioAnalyzer not initialized");
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyser || !this.dataArray) {
      throw new Error("AudioAnalyzer not initialized");
    }

    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getAverageFrequency(): number {
    const frequencyData = this.getFrequencyData();
    const sum = frequencyData.reduce((acc, value) => acc + value, 0);
    return sum / frequencyData.length;
  }

  getBassLevel(): number {
    const frequencyData = this.getFrequencyData();
    const bassRange = Math.floor(frequencyData.length * 0.1); // 低频部分
    const bassSum = frequencyData
      .slice(0, bassRange)
      .reduce((acc, value) => acc + value, 0);
    return bassSum / bassRange;
  }

  getTrebleLevel(): number {
    const frequencyData = this.getFrequencyData();
    const trebleStart = Math.floor(frequencyData.length * 0.7); // 高频部分
    const trebleData = frequencyData.slice(trebleStart);
    const trebleSum = trebleData.reduce((acc, value) => acc + value, 0);
    return trebleSum / trebleData.length;
  }

  startAnalysis(
    callback: (data: {
      frequencyData: Uint8Array;
      timeDomainData: Uint8Array;
      averageFrequency: number;
      bassLevel: number;
      trebleLevel: number;
    }) => void
  ): void {
    if (!this.isInitialized) {
      throw new Error("AudioAnalyzer not initialized");
    }

    this.isPlaying = true;

    const analyze = () => {
      if (!this.isPlaying) return;

      const frequencyData = this.getFrequencyData();
      const timeDomainData = this.getTimeDomainData();
      const averageFrequency = this.getAverageFrequency();
      const bassLevel = this.getBassLevel();
      const trebleLevel = this.getTrebleLevel();

      callback({
        frequencyData,
        timeDomainData,
        averageFrequency,
        bassLevel,
        trebleLevel,
      });

      this.animationId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  stopAnalysis(): void {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  destroy(): void {
    this.stopAnalysis();

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.isInitialized = false;
  }
}
