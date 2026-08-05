class WordNotifier {
  events = [];
  handlers = [];

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.socket = new WebSocket(`${protocol}://${window.location.host}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(await event.data.text());
        this.receiveEvent(msg);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };
  }

  broadcastEvent(from, type, value) {
    const event = { from, type, value };
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  receiveEvent(event) {
    this.events.push(event);
    this.handlers.forEach((handler) => handler(event));
  }
}

const WordEvent = {
  WordSaved: 'wordSaved',
};

const WordNotifierInstance = new WordNotifier();
export { WordEvent, WordNotifierInstance };