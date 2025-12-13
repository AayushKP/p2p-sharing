export class WebRTCManager {
  peer: RTCPeerConnection;
  dataChannel: RTCDataChannel | null = null;
  // callback function to be executed when a new ICE candidate is generated
  onIceCandidate: ((c: RTCIceCandidate) => void) | null = null;
  // callback executed when the dataChannel successfully opens, indicating the peer-to-peer connection is ready for data transfer.
  onConnected: (() => void) | null = null;

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
}
