export class WSClient {
  ws: WebSocket;
  constructor(name?: string) {
    const baseUrl = import.meta.env.VITE_REACT_APP_WS_URL;
    const url = new URL(baseUrl);
    if (name) url.searchParams.set("name", name);
    this.ws = new WebSocket(url.toString());
  }

  send(type: string, payload: any) {
    this.ws.send(JSON.stringify({ type, ...payload }));
  }
}
