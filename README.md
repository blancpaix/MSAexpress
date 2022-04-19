# MSA with Express
MSA with node.js (Express)

사용 기술
======


서비스 구성
=======
![Express](https://user-images.githubusercontent.com/54240763/163981531-eeaa182b-a77c-41c7-93a5-2fc144240b29.png)

>Server List
>>Single Endpoint
>>
>>>Load Balancer
>>API Endpoint
>>>>auth-service server
>>>>
>>>>pay-service server
>>>>
>>>>file-service server


>DB List
>>RDB
>>>MYSQL
>>>
>>>>auth_msa
>>>>
>>>>pay_msa
>>>>
>>>>file_msa
>>>
>>IN MEMORY DB
>>
>>>Redis (session storage)
