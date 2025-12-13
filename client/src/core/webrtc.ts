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

  // callback executed when the dataChannel successfully opens, indicating the peer-to-peer connection is ready for data transfer.
  onConnected: (() => void) | null = null;

  // callback to track sending progress (0–100)
  onSendProgress: ((percent: number) => void) | null = null;

  // callback to track receiving progress (0–100)
  onReceiveProgress: ((percent: number) => void) | null = null;

  // callback fired when the full file is received
  onFileReceived: ((file: File) => void) | null = null;

  // internal buffers for receiving file chunks
  private receivedBuffers: Uint8Array[] = [];
  private receivedSize = 0;
  private incomingMeta: FileMeta | null = null;

  constructor() {
    // Initialize RTCPeerConnection
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // Handle local ICE candidate generation
    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Handle remote peer creating a Data Channel (Receiver setup)
    this.peer.ondatachannel = (event) => {
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
      this.onConnected?.();
    };
  }

  setupReceiverChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.binaryType = "arraybuffer";

    // handle incoming messages (metadata, chunks, completion signal)
    this.dataChannel.onmessage = (event) => {
      // metadata & control messages are sent as JSON strings
      if (typeof event.data === "string") {
        const message = JSON.parse(event.data);

        // META message initializes file reception
        if (message.type === "META") {
          this.incomingMeta = message.meta;
          this.receivedBuffers = [];
          this.receivedSize = 0;
        }

        // DONE message indicates file transfer completion
        if (message.type === "DONE" && this.incomingMeta) {
          //@ts-ignore
          const blob = new Blob(this.receivedBuffers, {
            type: this.incomingMeta.type,
          });

          const file = new File([blob], this.incomingMeta.name, {
            type: this.incomingMeta.type,
          });

          this.onFileReceived?.(file);

          // reset internal state
          this.receivedBuffers = [];
          this.incomingMeta = null;
        }

        return;
      }

      // binary chunk received
      const chunk = new Uint8Array(event.data);
      this.receivedBuffers.push(chunk);
      this.receivedSize += chunk.byteLength;

      // calculate receive progress
      if (this.incomingMeta && this.onReceiveProgress) {
        const percent = Math.floor(
          (this.receivedSize / this.incomingMeta.size) * 100
        );
        this.onReceiveProgress(percent);
      }
    };

    this.dataChannel.onopen = () => {
      this.onConnected?.();
    };
  }

  async createOffer() {
    this.createDataChannel();
    const offer: RTCSessionDescriptionInit = await this.peer.createOffer();
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

  // sends a file over the data channel using chunk-based transfer
  async sendFile(file: File) {
    if (!this.dataChannel) return;

    const meta: FileMeta = {
      name: file.name,
      size: file.size,
      type: file.type,
    };

    // send file metadata first
    this.dataChannel.send(JSON.stringify({ type: "META", meta }));

    const chunkSize = 64 * 1024; // 64KB
    const buffer = await file.arrayBuffer();
    let offset = 0;

    while (offset < buffer.byteLength) {
      const chunk = buffer.slice(offset, offset + chunkSize);
      this.dataChannel.send(chunk);
      offset += chunk.byteLength;

      if (this.onSendProgress) {
        const percent = Math.floor((offset / buffer.byteLength) * 100);
        this.onSendProgress(percent);
      }
    }

    // notify receiver that transfer is complete
    this.dataChannel.send(JSON.stringify({ type: "DONE" }));
  }
}
