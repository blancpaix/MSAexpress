import amqp from 'amqplib';

export class AMQPreply {
  constructor(requestsQueueName) {
    this.requestsQueueName = requestsQueueName;   // 응답받은거 하나만 처리하면 되니까 그런거인듯?
  }

  async initialize() {
    const conneciton = await amqp.connect('amqp://localhost');
    this.channel = await conneciton.createChannel();

    const { queue } = await this.channel.assertQueue(this.requestsQueueName);    // 들어오는 요청을 수신할 큐를 만듦
    this.queue = queue;
  }

  handleRequests(handler) {                 // handler 는 새로운 응답을 보내기 윟나 요청 핸들러 등록
    this.channel.consume(this.queue, async msg => {
      const content = JSON.parse(msg.content.toString());
      const replyData = await handler(content);

      this.channel.sendToQueue(
        msg.properties.replyTo,   // 응답 보낼때 replyTo 에 지정된 큐에 메시지를 직접 게시, 
        Buffer.from(JSON.stringify(replyData)),
        { correlationId: msg.properties.correlationId }    // 요청과의 매칭을 위해 correlation Id 같이 설정
      );

      this.channel.ack(msg);    // 완전 처리 후, 모든 메시지에 응답을 확인
    })
  }
};