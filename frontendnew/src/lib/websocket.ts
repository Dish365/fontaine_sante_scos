type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private subscribers: Map<string, WebSocketCallback[]> = new Map();
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && this.subscribers.has(data.type)) {
            this.subscribers.get(data.type)?.forEach(callback => callback(data.payload));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectTimeout *= 2; // Exponential backoff
      this.connect();
    }, this.reconnectTimeout);
  }

  subscribe(type: string, callback: WebSocketCallback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);
  }

  unsubscribe(type: string, callback: WebSocketCallback) {
    if (this.subscribers.has(type)) {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        this.subscribers.set(
          type,
          callbacks.filter(cb => cb !== callback)
        );
      }
    }
  }

  send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance
const wsService = new WebSocketService('ws://localhost:8001/ws/environmental');

export default wsService; 