import amqp from 'amqplib';
import { nanoid } from 'nanoid';

export class RequestFactory {
  constructor() {
    // request 반환 주소를 위해 Map 사용
    this.idMap = new Map();
  }

  async initialize() {
    this.connection = await amqp.connect('amqp://localhost');   // mq 서비스 사용 프로토콜 지정 port : 5672
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

      // 시간 초과 시 message 삭제, Error 외부 전파
      const replyTimeout = setTimeout(() => {
        this.idMap.delete(id);
        reject(new Error('Request timeout!'));
      }, 20000);

      this.idMap.set(id, handler => {
        this.idMap.delete(id);
        clearTimeout(replyTimeout); // 성공 시 카운트 제거
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