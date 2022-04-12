import amqp from 'amqplib';

export class ReplyFactory {
  constructor(requestQueueName) {
    this.requestQueueName = requestQueueName;
  };

  async initialize() {
    const connection = await amqp.connect('amqp://localhost');
    this.channel = await connection.createChannel()
    const { queue } = await this.channel.assertQueue(this.requestQueueName);
    this.queue = queue;
  };

  handleRequests(handler) {
    this.channel.consume(this.queue, async (msg) => {
      const content = JSON.parse(msg.content.toString());
      const replyData = await handler(content);

      this.channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(replyData, Object.getOwnPropertyNames(replyData))),
        { correlationId: msg.properties.correlationId }
      );

      this.channel.ack(msg);
    })
  }
};
