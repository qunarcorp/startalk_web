import { Strophe } from './strophe';

class Ping {
  constructor(stropheConnection, pingInterval = 20) {
    this.stropheConnection = stropheConnection;
    this.pingInterval = pingInterval;
  }

  register() {
    const self = this;
    const { disco, ping } = self.stropheConnection;

    disco.addFeature(Strophe.NS.PING);
    ping.addPingHandler((pi) => {
      self.lastStanzaDate = new Date();
      ping.pong(pi);
      return true;
    });

    if (self.pingInterval > 0) {
      this.stropheConnection.addHandler(() => {
        self.lastStanzaDate = new Date();
        return true;
      });
      this.stropheConnection.addTimedHandler(1000, () => {
        const now = new Date();
        if (!self.lastStanzaDate) {
          self.lastStanzaDate = now;
        }
        const interval = (now - self.lastStanzaDate) / 1000;
        if (interval > self.pingInterval) {
          return self.ping();
        }
        return true;
      });
    }
  }

  ping(jid) {
    this.lastStanzaDate = new Date();
    if (jid === undefined) {
      const bareJid = Strophe.getBareJidFromJid(this.stropheConnection.jid);
      jid = Strophe.getDomainFromJid(bareJid);
    }
    this.stropheConnection.ping.ping(jid, null, null, null);
    return true;
  }
}

export default Ping;
