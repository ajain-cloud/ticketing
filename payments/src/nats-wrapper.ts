import nats, { Stan } from 'node-nats-streaming';

// NatsWrapper is a singleton-style wrapper around the NATS Streaming client.
// - It stores the client instance privately (_client) and only exposes it via a getter,
//   which throws an error if accessed before connect() is called (safety check).
// - The connect() method establishes the connection to the NATS server and returns a Promise
//   so it can be awaited. It resolves once the client is connected, or rejects if an error occurs.
// This ensures that any service depending on NATS connects reliably before using the client.
class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();