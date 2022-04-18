import amqp from 'amqplib';

export class ReplyFactory {
  // 서비스 별 message-queue 대기열 이름 지정
  constructor(requestQueueName) {
    this.requestQueueName = requestQueueName;
  };

  async initialize() {
    const connection = await amqp.connect('amqp://localhost');
    this.channel = await connection.createChannel()
    const { queue } = await this.channel.assertQueue(this.requestQueueName);
    this.queue = queue;
  };

  // mq 사용 시 string/binary 데이터 주고받음. json 데이터 변환 필요
  handleRequests(handler) {
    this.channel.consume(this.queue, async (msg) => {
      const content = JSON.parse(msg.content.toString());
      const replyData = await handler(content);

      this.channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(replyData, Object.getOwnPropertyNames(replyData))),
        { correlationId: msg.properties.correlationId }
      );

      // 메시지 전송 확인
      this.channel.ack(msg);
    })
  }
};
