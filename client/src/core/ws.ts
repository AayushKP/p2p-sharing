export class WSClient {
  ws: WebSocket;
  constructor(name?: string) {
    let baseUrl = import.meta.env.VITE_REACT_APP_WS_URL || "ws://localhost:5000";
    
    // If accessed via local network IP (e.g., from phone), replace localhost with the actual IP
    if (baseUrl.includes("localhost") && window.location.hostname !== "localhost") {
      baseUrl = baseUrl.replace("localhost", window.location.hostname);
    }
    
    const url = new URL(baseUrl);
    if (name) url.searchParams.set("name", name);
    this.ws = new WebSocket(url.toString());
  }

  send(type: string, payload: any) {
    this.ws.send(JSON.stringify({ type, ...payload }));
  }
}
