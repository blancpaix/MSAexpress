import amqp from 'amqplib';
import nanoid from 'nanoid';

export class AMQPrequest {
  constructor() {
    this.idMap = new Map();
  };

  async initialize() {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
    const { queue } = await this.channel.assertQueue('', { exclusive: true });
    this.replyQueue = queue;

    // 응답 들어온거 저장하는거임
    this.channel.consume(this.replyQueue, msg => {
      const correlationId = msg.properties.correlationId;;
      const handler = this.idMap.get(correlationId);
      if (handler) {
        handler(JSON.parse(msg.content.toString()));
      }
    }, { noAck: false });   // 확인 응답하는게 필요없음?
  }

  send(queue, message) {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      const replyTimeout = setTimeout(() => {
        this.idMap.delete(id);
        // 외부에서 롤백 처리
        reject(new Error('요청 시간 초과'));
      }, 10000);

      this.idMap.set(id, (replyData) => {
        this.idMap.delete(id);
        clearTimeout(replyTimeout);
        resolve(replyData);
      });

      // 메시지를 보내기, 목적지의 대기열로 바로 전달하는 p2p 통신
      this.channel.sendToQueue(queue,
        Buffer.from(JSON.stringify(message)),
        { correlationId: id, replyTo: this.replyQueue },   // 메타 데이터
      )
    })
  }

  destroy() {
    this.channel.close();
    this.connection.close();
  }
};