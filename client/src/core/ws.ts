export class WSClient {
  ws: WebSocket;
  constructor() {
    this.ws = new WebSocket("ws://localhost:5000");
  }

  send(type: string, payload: any) {
    this.ws.send(JSON.stringify({ type, ...payload }));
  }
}
