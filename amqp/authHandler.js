import { ReplyFactory } from '../utils/mq/ReplyFactory.js';
import { AuthLogics } from '../logics/authLogic.js';

const main = async () => {
  const amqpReplier = new ReplyFactory('auth_queue');
  await amqpReplier.initialize().then(() => {
    console.log('[AMQP] Auth Queue Replier connected!');
  });

  amqpReplier.handleRequests(async req => {
    switch (req.event) {
      case 'purchase':
        const { type, remark, pay, purchaseUID, userUID } = req.value;
        return await AuthLogics.createPurchaseRecord(type, remark, pay, purchaseUID, userUID);

      default:
        return;
    }
  })
};

main().catch(err => {
  console.log('Error in authHandler', err);
});



