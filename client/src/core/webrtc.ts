type FileMeta = {
  name: string;
  size: number;
  type: string;
};

export class WebRTCManager {
  peer: RTCPeerConnection;
  dataChannel: RTCDataChannel | null = null;

  // callbacks
  onIceCandidate: ((c: RTCIceCandidate) => void) | null = null;
  onConnected: (() => void) | null = null;
  onSendProgress: ((percent: number) => void) | null = null;
  onReceiveProgress: ((percent: number) => void) | null = null;
  onConnectionFailed: (() => void) | null = null;
  onFileReceived: ((file: File) => void) | null = null;
  onReset: (() => void) | null = null;
  onDisconnected: (() => void) | null = null;
  onClose: (() => void) | null = null;
  onPromptSend: (() => void) | null = null;

  private wasEverConnected: boolean = false;
  private receivedBuffers: Uint8Array[] = [];
  private receivedSize = 0;
  private incomingMeta: FileMeta | null = null;
  isChannelOpen = false;

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],
    });

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.peer.onconnectionstatechange = () => {
      const state = this.peer.connectionState;
      console.log("[RTC] PC state:", state);
      
      // If we've already fallen back to Relay Mode, ignore WebRTC connection failures
      if (this.relayMode) return;
      
      if (state === "failed" || state === "closed") {
        if (this.wasEverConnected) {
          this.isChannelOpen = false;
          this.onDisconnected?.();
        } else {
          this.onConnectionFailed?.();
        }
      }
    };

    this.peer.ondatachannel = (event) => {
      console.log("[RTC] DataChannel received");
      this.dataChannel = event.channel;
      this.setupReceiverChannel();
    };
  }

  createDataChannel() {
    this.dataChannel = this.peer.createDataChannel("file");
    this.setupSenderChannel();
  }

  setupSenderChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.binaryType = "arraybuffer";

    this.dataChannel.onopen = () => {
      this.isChannelOpen = true;
      this.wasEverConnected = true;
      this.onConnected?.();
    };

    this.dataChannel.onmessage = this.handleDataChannelMessage;

    this.dataChannel.onclose = () => {
      if (this.relayMode) return;
      if (this.wasEverConnected) {
        this.isChannelOpen = false;
        this.onDisconnected?.();
      }
    };
  }

  setupReceiverChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.binaryType = "arraybuffer";

    this.dataChannel.onopen = () => {
      this.isChannelOpen = true;
      this.wasEverConnected = true;
      this.onConnected?.();
    };

    this.dataChannel.onmessage = this.handleDataChannelMessage;

    this.dataChannel.onclose = () => {
      if (this.relayMode) return;
      if (this.wasEverConnected) {
        this.isChannelOpen = false;
        this.onDisconnected?.();
      }
    };
  }

  private handleDataChannelMessage = (event: MessageEvent) => {
    if (typeof event.data === "string") {
      const msg = JSON.parse(event.data);

      if (msg.type === "META") {
        this.incomingMeta = msg.meta;
        this.receivedBuffers = [];
        this.receivedSize = 0;
        this.onReceiveProgress?.(0);
      } else if (msg.type === "PROMPT_SEND") {
        this.onPromptSend?.();
      } else if (msg.type === "RESET") {
        this.onReset?.();
      } else if (msg.type === "DONE" && this.incomingMeta) {
        //@ts-ignore
        const blob = new Blob(this.receivedBuffers, {
          type: this.incomingMeta.type,
        });

        const file = new File([blob], this.incomingMeta.name, {
          type: this.incomingMeta.type,
        });

        this.onFileReceived?.(file);
        this.receivedBuffers = [];
        this.incomingMeta = null;
      }
      return;
    }

    // Binary chunk
    const chunk = new Uint8Array(event.data);
    this.receivedBuffers.push(chunk);
    this.receivedSize += chunk.byteLength;

    if (this.incomingMeta && this.onReceiveProgress) {
      const percent = Math.floor(
        (this.receivedSize / this.incomingMeta.size) * 100
      );
      this.onReceiveProgress(percent);
    }
  };

  async createOffer() {
    this.createDataChannel();
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  async createAnswer() {
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  private pendingCandidates: RTCIceCandidateInit[] = [];

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
    for (const candidate of this.pendingCandidates) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("[RTC] Pending ICE error:", e));
    }
    this.pendingCandidates = [];
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peer.remoteDescription) {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("[RTC] ICE error:", e));
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  relayMode: boolean = false;
  sendRelayMessage: ((msg: any) => void) | null = null;

  switchToRelayMode(isInitiator: boolean = true) {
    if (this.relayMode) return;
    this.relayMode = true;
    this.isChannelOpen = true;
    if (isInitiator) {
      this.sendRelayMessage?.({ type: "relay-init" });
    }
    this.onConnected?.();
  }

  handleRelayMessage(msg: any) {
    if (msg.type === "relay-init") {
      this.switchToRelayMode(false);
      return;
    } else if (msg.type === "relay-meta") {
      this.incomingMeta = msg.meta;
      this.receivedBuffers = [];
      this.receivedSize = 0;
      this.onReceiveProgress?.(0);
    } else if (msg.type === "relay-prompt-send") {
      this.onPromptSend?.();
    } else if (msg.type === "relay-reset") {
      this.onReset?.();
    } else if (msg.type === "relay-chunk") {
      const binaryString = atob(msg.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      this.receivedBuffers.push(bytes);
      this.receivedSize += bytes.byteLength;

      if (this.incomingMeta && this.onReceiveProgress) {
        const percent = Math.floor(
          (this.receivedSize / this.incomingMeta.size) * 100
        );
        this.onReceiveProgress(percent);
      }
    } else if (msg.type === "relay-done" && this.incomingMeta) {
      const blob = new Blob(this.receivedBuffers, {
        type: this.incomingMeta.type,
      });

      const file = new File([blob], this.incomingMeta.name, {
        type: this.incomingMeta.type,
      });

      this.onFileReceived?.(file);
      this.receivedBuffers = [];
      this.incomingMeta = null;
    }
  }

  async sendFile(file: File) {
    if (!this.isChannelOpen) {
      throw new Error("Channel not open");
    }

    if (this.relayMode) {
      this.sendRelayMessage?.({
        type: "relay-meta",
        meta: { name: file.name, size: file.size, type: file.type }
      });
      
      let offset = 0;
      const CHUNK_SIZE = 64 * 1024;
      
      const pump = async () => {
        while (offset < file.size) {
          const slice = file.slice(offset, offset + CHUNK_SIZE);
          const buffer = await slice.arrayBuffer();
          
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          this.sendRelayMessage?.({
            type: "relay-chunk",
            data: base64
          });
          
          offset += buffer.byteLength;
          this.onSendProgress?.(Math.floor((offset / file.size) * 100));
          
          // Yield to event loop to prevent blocking UI during large encodes
          await new Promise(r => setTimeout(r, 0)); 
        }
        this.sendRelayMessage?.({ type: "relay-done" });
      };
      
      await pump();
      return;
    }

    const channel = this.dataChannel!;

    channel.send(
      JSON.stringify({
        type: "META",
        meta: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      })
    );

    let offset = 0;
    const CHUNK_SIZE = 64 * 1024; // 64 KB
    const LOW_WATER = 1 * 1024 * 1024; // 1 MB
    const HIGH_WATER = 8 * 1024 * 1024; // 8 MB

    channel.bufferedAmountLowThreshold = LOW_WATER;

    return new Promise<void>((resolve) => {
      const pump = async () => {
        while (offset < file.size && channel.bufferedAmount < HIGH_WATER) {
          const slice = file.slice(offset, offset + CHUNK_SIZE);
          const buffer = await slice.arrayBuffer();

          channel.send(buffer);
          offset += buffer.byteLength;

          this.onSendProgress?.(Math.floor((offset / file.size) * 100));
        }

        if (offset < file.size) {
          channel.onbufferedamountlow = pump;
        } else {
          channel.send(JSON.stringify({ type: "DONE" }));
          channel.onbufferedamountlow = null;
          resolve();
        }
      };

      pump();
    });
  }
}
