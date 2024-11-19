export class WebSocketHandler {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectTimeout = 3000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.handlers = new Map();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      this.emit('connection-status', 'connected');
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.emit('connection-status', 'disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('connection-status', 'error');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectTimeout);
  }

  handleMessage(message) {
    const handlers = this.handlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.push(handler);
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  emit(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}