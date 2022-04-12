import { AMQPrequest } from "./AmqpRequest.js";
import delay from 'delay';

async function main() {
  const request = new AMQPrequest();
  await request.initialize();
  // 외부에[서 실행시켜놓고 인스턴스 부러와서 전송을 하면 되는거 아닐까 싶네??]

  async function sendRandomRequest() {
    const a = 123;
    const b = 321;

    const reply = await request.send('requests_queue', { a, b });
    console.log(`${a} + ${b} = ${reply.sum}`);
  }

  sendRandomRequest();

  request.destroy();
};

main().catch(err => console.error('error!', err));