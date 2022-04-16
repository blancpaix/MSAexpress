import { ReplyFactory } from '../utils/mq/ReplyFactory.js';
import { FileLogics } from '../logics/fileLogic.js';

const main = async () => {
  const amqpReplier = new ReplyFactory('file_queue');
  await amqpReplier.initialize().then(() => {
    console.log('[AMQP] File Queue Replier connected!');
  });

  amqpReplier.handleRequests(async req => {
    console.log('## request in File-handler ##', req);

    switch (req.event) {
      case 'postItem':
        const { itemUID, img } = req.value;
        const record = await FileLogics.updateReference(itemUID, img);
        return record;
      default:
        return;
    }

  })
};

main().catch(err => {
  console.log('Error in fileHandler', err);
});



