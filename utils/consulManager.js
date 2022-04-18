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

  // 옵션 추가 시 함수 호출
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

  // 클래스 내부 함수로는 프로세스 강제 종료 시 함수 실행 확률이 낮아서 외부로 뺐습니다...
  unregisterService(err) {
    err && console.error('|Consul| Unregister service!', err, this.tags);
    consulClient.agent.service.deregister(this.id, () => {
      process.exit(err ? 1 : 0);
    });
  };


}