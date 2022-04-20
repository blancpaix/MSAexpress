# 🔥 MSA architecture with Express
MSA with node.js (Express)   

    프로젝트
      인원 : 1명
      기간 : 2022.03. ~ 2022.04.   
      목적 : Micro Service Architecture 구현

<br/> 

## **목차**
---
- [소개](#소개)
- [서비스 구성](#서비스-구성)
- [사용 기술](#사용-기술)
- [API 목록](#api-목록)
- [Database 모델링](#database-모델링)

<br/>

<br/>


## **소개**
---
<br />

2021년 말 ["중계"](https://play.google.com/store/apps/details?id=com.joonggye.live, "중계")라는 어플리케이션을 제작하여 배포하였습니다. 서비스의 주요 로직은 Firebase로 활용하였으며 채팅서버만 Express 프레임워크(with Socket.io)를 사용하여 모놀리식 서비스로 구현하였습니다.

채팅에서 발생하는 오버헤드를 줄이고 보다 쾌적한 서비스를 제공하기 위해 ["Node.js 디자인 패턴 바이블"](https://book.naver.com/bookdb/book_detail.nhn?bid=20517112, "Node.js Design Patterns: Design and implement production-grade Node.js applications using proven patterns and techniques")을 참고하였습니다. 습득한 내용을 바탕으로 node.js의 장점을 활용해보고자 간단한 커머셜 서비스 API 구현 프로젝트를 진행하였습니다.

서버의 확장을 염두에 두고 Micro Service Architecture를 채택하였고 로드밸런싱을 통해 한 곳에 집중되던 부하를 분산시킬 수 있었습니다. 분산된 서버에 접속하기 위해 역방향 프록시를 적용하여 서버 구조를 감추었으며, 분산된 서비스간 통신을 위해 Message Queue Service를 사용하였습니다.

<br/>

<br/>


## **서비스 구성**
---
<br/>

![Express](https://user-images.githubusercontent.com/54240763/163981531-eeaa182b-a77c-41c7-93a5-2fc144240b29.png)
<br/>

### **서버 목록**
>Single Endpoint  
>>Load Balancer  
>
>API Endpoint
>>auth-service server  
>>pay-service server  
>>file-service server  

<br/>

### **데이터베이스 목록**
>RDB  
>>MySQL
>>>auth_msa  
>>>pay_msa  
>>>file_msa  
>
>In-Memory DB  
>>Redis  

<br/>

### **유틸리티**
>Service Mesh  
>>Consul  
>
>Message Queue
>>RabbitMQ

<br/>

<br/>


## **사용 기술**
---
<br/>

|**타입**|**이름**|**비고**|
|---|---|---|
|Backend|Express||
|Database|Mysql|Relational DB|
||Redis|In-Memory DB|
|Service Mesh|Consul||
|MQ Service|RabbitMQ||
|Tools|VS Code||
||SourceTree||
||Postman||
|OS|Windows / Ubuntu ||
|||

<br/>

### 필요한 패키지 파일 다운로드
+ [Download Node.js](https://nodejs.org/en/download/current/, "nodejs")
+ [Download Mysql](https://www.mysql.com/downloads/, "Mysql")
+ [Download Redis](https://redis.io/download/, "Redis"   )
+ [Download RabbitMQ](https://www.rabbitmq.com/download.html,"RabbitMQ")
+ [Download Consul](https://www.consul.io/downloads, "Consul")

<br/>

### 서비스 시작
> (Windows) In command line : $ consul agent -dev

> (Project directory) In command line :
>> $ npm run loadbalancer_pro   
>>
>> $ npm run fvauth    
>>
>> $ npm run fvpay   
>>
>> $ npm run fvfile   

<br/>

<br/>

## **API 목록**
---

바로가기 👉 [API List](https://github.com/blancpaix/MSAexpress/blob/main/04_api.txt, "API List")

<br />

<br />

## **Database 모델링**
---

바로가기 👉 [DB Modeling](https://github.com/blancpaix/MSAexpress/blob/main/03_db_modeling.txt, "DB Modeling")

<br />

<br />

