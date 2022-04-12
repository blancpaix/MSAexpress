// 요청 응답자 구현
import { AMQPreply } from "./AmqpReply.js";

async function main() {
  const reply = new AMQPreply('request_queue');
  await reply.initialize();

  reply.handleRequests(req => {
    console.log(`Request received`, req);
    return { sum: req.a + req.b };
  })
};

main().catch(err => console.error('err!!', err));