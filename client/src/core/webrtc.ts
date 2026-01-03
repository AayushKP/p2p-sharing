type FileMeta = {
  name: string;
  size: number;
  type: string;
};

export class WebRTCManager {
  peer: RTCPeerConnection;
  dataChannel: RTCDataChannel | null = null;

  // callback function to be executed when a new ICE candidate is generated
  onIceCandidate: ((c: RTCIceCandidate) => void) | null = null;

  // callback executed ONLY when DataChannel is OPEN
  onConnected: (() => void) | null = null;

  // callback to track sending progress (0–100)
  onSendProgress: ((percent: number) => void) | null = null;

  // callback to track receiving progress (0–100)
  onReceiveProgress: ((percent: number) => void) | null = null;

  // callback fired when the connection fails
  onConnectionFailed: (() => void) | null = null;

  // callback fired when the full file is received
  onFileReceived: ((file: File) => void) | null = null;

  // callback fired when the client is disconnected
  onDisconnected: (() => void) | null = null;

  //callback fired when the DataChannel is closed
  onClose: (() => void) | null = null;

  private wasEverConnected: boolean = false; // to track failure of connections

  // internal buffers for receiving file chunks
  private receivedBuffers: Uint8Array[] = [];
  private receivedSize = 0;
  private incomingMeta: FileMeta | null = null;

  // IMPORTANT: track real DataChannel readiness
  isChannelOpen = false;

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // ICE candidates
    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Connection state (INFO ONLY – not used for sending)
    this.peer.onconnectionstatechange = () => {
      console.log("[RTC] PeerConnection state:", this.peer.connectionState);
    };

    // Receiver side DataChannel
    this.peer.ondatachannel = (event) => {
      console.log("[RTC] DataChannel received");
      this.dataChannel = event.channel;
      this.setupReceiverChannel();
    };

    // Disconnection or failed cases handling
    this.peer.onconnectionstatechange = () => {
      const state = this.peer.connectionState;
      console.log("[RTC] PC state:", state);

      if (state === "failed" || state === "closed") {
        if (this.wasEverConnected) {
          this.isChannelOpen = false;
          this.onDisconnected?.();
        } else {
          this.onConnectionFailed?.();
        }
      }
    };
  }

  // Caller creates DataChannel
  createDataChannel() {
    this.dataChannel = this.peer.createDataChannel("file");
    this.setupSenderChannel();
  }

  setupSenderChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.binaryType = "arraybuffer";

    this.dataChannel.onopen = () => {
      console.log("[RTC] Sender DataChannel OPEN");
      this.isChannelOpen = true;
      this.wasEverConnected = true;
      this.onConnected?.();
    };

    this.dataChannel.onclose = () => {
      console.log("[RTC] Sender DataChannel CLOSED");

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
      console.log("[RTC] Receiver DataChannel OPEN");
      this.isChannelOpen = true;
      this.wasEverConnected = true;
      this.onConnected?.();
    };

    this.dataChannel.onmessage = (event) => {
      console.log("[RTC] Message received:", event.data);

      // Control messages
      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);

        if (msg.type === "META") {
          console.log("[RTC] META received:", msg.meta);
          this.incomingMeta = msg.meta;
          this.receivedBuffers = [];
          this.receivedSize = 0;
        }

        if (msg.type === "DONE" && this.incomingMeta) {
          console.log("[RTC] DONE received");

          //@ts-ignore
          const blob = new Blob(this.receivedBuffers, {
            type: this.incomingMeta.type,
          });

          const file = new File([blob], this.incomingMeta.name, {
            type: this.incomingMeta.type,
          });

          console.log("[RTC] File reconstructed:", file);
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

    this.dataChannel.onclose = () => {
      console.log("[RTC] Receiver DataChannel CLOSED");

      if (this.wasEverConnected) {
        this.isChannelOpen = false;
        this.onDisconnected?.();
      }
    };
  }

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

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // SAFE file sending (only when DataChannel is open)
  async sendFile(file: File) {
    if (!this.dataChannel || !this.isChannelOpen) {
      throw new Error("DataChannel not open");
    }

    const channel = this.dataChannel;

    // Send metadata first
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
          // Resume ONLY when buffer drains below LOW_WATER
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
