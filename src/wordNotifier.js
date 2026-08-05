class WordNotifier {
  events = [];
  handlers = [];

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    this.socket = new WebSocket(`${protocol}://${window.location.host}`);

    // Set binaryType to arraybuffer for instant synchronous decoding
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        let textData;

        if (typeof event.data === 'string') {
          textData = event.data;
        } else if (event.data instanceof ArrayBuffer) {
          // Synchronously decode binary ArrayBuffer into string
          textData = new TextDecoder('utf-8').decode(event.data);
        } else if (event.data instanceof Blob) {
          // Fallback if Blob is received
          event.data.text().then((text) => {
            const msg = JSON.parse(text);
            console.log('📡 Received WS Event (Blob):', msg);
            this.receiveEvent(msg);
          });
          return;
        }

        if (textData) {
          const msg = JSON.parse(textData);
          console.log('📡 Received WS Event:', msg);
          this.receiveEvent(msg);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  broadcastEvent(from, type, value) {
    const event = { from, type, value };
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not open. ReadyState:', this.socket.readyState);
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