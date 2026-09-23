'use client';

import mqtt, { MqttClient } from 'mqtt';
import { BeloteGameState } from '../belote/types';

export interface MqttMessage {
  type: 'STATE_SYNC' | 'JOIN_REQUEST' | 'PLAYER_ACTION' | 'HEARTBEAT';
  senderId: string;
  gameCode: string;
  payload?: any;
  timestamp: number;
}

const BROKERS = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt'
];

export class BeloteMqttSync {
  private client: MqttClient | null = null;
  private gameCode: string = '';
  private playerId: string = '';
  private isHost: boolean = false;
  private onStateUpdate?: (state: BeloteGameState) => void;
  private onJoinRequest?: (playerName: string, playerId: string) => void;
  private brokerIndex: number = 0;

  constructor(
    gameCode: string,
    playerId: string,
    isHost: boolean,
    onStateUpdate?: (state: BeloteGameState) => void,
    onJoinRequest?: (playerName: string, playerId: string) => void
  ) {
    this.gameCode = gameCode.toUpperCase().trim();
    this.playerId = playerId;
    this.isHost = isHost;
    this.onStateUpdate = onStateUpdate;
    this.onJoinRequest = onJoinRequest;
  }

  public connect() {
    if (!this.gameCode) return;
    this.disconnect();

    const brokerUrl = BROKERS[this.brokerIndex % BROKERS.length];
    const topic = `jouons-belote/v1/room/${this.gameCode}`;
    const clientId = `belote_${this.playerId}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        keepalive: 30,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000,
      });

      this.client.on('connect', () => {
        this.client?.subscribe(topic, { qos: 0 }, (err) => {
          if (err) {
            console.warn('[MQTT Subscribe Error]:', err);
            return;
          }

          // Si non-hôte qui vient de se connecter, demander l'état au salon
          if (!this.isHost) {
            this.send({
              type: 'HEARTBEAT',
              senderId: this.playerId,
              gameCode: this.gameCode,
              timestamp: Date.now()
            });
          }
        });
      });

      this.client.on('message', (_topic, messageBuffer) => {
        try {
          const msg: MqttMessage = JSON.parse(messageBuffer.toString());
          if (msg.gameCode !== this.gameCode) return;
          if (msg.senderId === this.playerId) return; // Ignorer ses propres messages

          if (msg.type === 'STATE_SYNC' && msg.payload) {
            if (this.onStateUpdate) {
              this.onStateUpdate(msg.payload as BeloteGameState);
            }
          }

          if (msg.type === 'JOIN_REQUEST' && this.isHost) {
            if (this.onJoinRequest && msg.payload?.name && msg.payload?.id) {
              this.onJoinRequest(msg.payload.name, msg.payload.id);
            }
          }

          if (msg.type === 'HEARTBEAT' && this.isHost) {
            // L'hôte répond avec le dernier état connu
            if (typeof window !== 'undefined' && (window as any).__lastBeloteState) {
              this.broadcastState((window as any).__lastBeloteState);
            }
          }
        } catch (e) {
          console.warn('[MQTT parse error]:', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('[MQTT Error]:', err);
        // Basculer sur le broker de secours en cas d'erreur
        this.brokerIndex++;
      });
    } catch (e) {
      console.warn('[MQTT Connect Exception]:', e);
    }
  }

  public broadcastState(state: BeloteGameState) {
    if (typeof window !== 'undefined') {
      (window as any).__lastBeloteState = state;
    }
    this.send({
      type: 'STATE_SYNC',
      senderId: this.playerId,
      gameCode: this.gameCode,
      payload: state,
      timestamp: Date.now()
    });
  }

  public requestJoin(playerName: string) {
    this.send({
      type: 'JOIN_REQUEST',
      senderId: this.playerId,
      gameCode: this.gameCode,
      payload: { name: playerName, id: this.playerId },
      timestamp: Date.now()
    });
  }

  private send(msg: MqttMessage) {
    if (!this.client || !this.client.connected) return;
    const topic = `jouons-belote/v1/room/${this.gameCode}`;
    this.client.publish(topic, JSON.stringify(msg), { qos: 0 });
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {}
      this.client = null;
    }
  }
}
