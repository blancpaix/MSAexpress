import consul from 'consul';

const consulClient = consul();

export default class ConsulManger {
  constructor(name, id, address, port) {
    this.name = name;
    this.id = id;
    this.address = address;
    this.port = port;
    this.tags = [name];
  }

  withCheckOptions(checkOptsObj) {
    this.check = checkOptsObj;
  }

  registerService() {
    console.log('this??', this);
    consulClient.agent.service.register({
      id: this.id,
      name: this.name,
      address: this.address,
      port: this.port,
      tags: this.tags,
      check: this.check,
    }, () => {
      console.log(`${this.name} registered successfully!`);
    })
  };

  unregisterService(err) {
    err && console.error('unregisterService! Occured!', err, this);
    consulClient.agent.service.deregister(this.id, () => {
      process.exit(err ? 1 : 0);
    });
  };
}