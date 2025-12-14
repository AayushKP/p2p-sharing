export class WSClient {
  ws: WebSocket;
  constructor() {
    this.ws = new WebSocket(import.meta.env.VITE_REACT_APP_WS_URL);
  }

  send(type: string, payload: any) {
    this.ws.send(JSON.stringify({ type, ...payload }));
  }
}
