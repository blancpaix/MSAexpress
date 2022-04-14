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
    consulClient.agent.service.register({
      id: this.id,
      name: this.name,
      address: this.address,
      port: this.port,
      tags: this.tags,
      check: this.check,
    }, () => {
      console.log(`[Consul] ${this.name} registered successfully!`);
    })
  };

  // 프로세스 강제 종료 시 실행확률이 굉장히 적습니다. 그래서 외부로 뺐습니다.
  unregisterService(err) {
    err && console.error('|Consul| Unregister service!', err, this.tags);
    consulClient.agent.service.deregister(this.id, () => {
      process.exit(err ? 1 : 0);
    });
  };


}