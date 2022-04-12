import amqp from 'amqplib';
import { nanoid } from 'nanoid';

export class RequestFactory {
  constructor() {
    this.idMap = new Map();
  }

  async initialize() {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel()
    const { queue } = await this.channel.assertQueue('', { exclusive: true });
    this.replyQueue = queue;
    console.log('[AMQP] Initialize success.');

    this.channel.consume(this.replyQueue, msg => {
      const correlationId = msg.properties.correlationId;
      const handler = this.idMap.get(correlationId);
      if (handler) {
        handler(JSON.parse(msg.content.toString()));
      }
      this.channel.ack(msg);  // 정상적으로 전달 후 삭제
    }, { noAck: false });
  }

  send(queue, message) {
    return new Promise((resolve, reject) => {
      const id = nanoid();

      // 시간 초과시 초기화, 초기화 하기 위해 query rollback 추가
      const replyTimeout = setTimeout(() => {
        this.idMap.delete(id);
        reject(new Error('Request timeout!'));
      }, 20000);

      this.idMap.set(id, handler => {
        this.idMap.delete(id);
        clearTimeout(replyTimeout); // 성공하면 카운트 제거
        resolve(handler);
      });

      this.channel.sendToQueue(queue,
        Buffer.from(JSON.stringify(message)),
        { correlationId: id, replyTo: this.replyQueue }
      )
    })
  }
};

export const amqpRequest = new RequestFactory();