# ๐ฅ MSA architecture with Express
MSA with node.js (Express)   

    ํ๋ก์ ํธ   
      ์ธ์ : 1๋ช
      ๊ธฐ๊ฐ : 2022.03. ~ 2022.04.   
      ๋ชฉ์  : Micro Service Architecture ๊ตฌํ

<br/> 

## **๋ชฉ์ฐจ**
---
- [์๊ฐ](#์๊ฐ)
- [์๋น์ค ๊ตฌ์ฑ](#์๋น์ค-๊ตฌ์ฑ)
- [์ฌ์ฉ ๊ธฐ์ ](#์ฌ์ฉ-๊ธฐ์ )
- [API ๋ชฉ๋ก](#api-๋ชฉ๋ก)
- [Database ๋ชจ๋ธ๋ง](#database-๋ชจ๋ธ๋ง)

<br/>

<br/>


## **์๊ฐ**
---
<br />

2021๋ ๋ง ["์ค๊ณ"](https://play.google.com/store/apps/details?id=com.joonggye.live "์ค๊ณ")๋ผ๋ ์ดํ๋ฆฌ์ผ์ด์์ ์ ์ํ์ฌ ๋ฐฐํฌํ์์ต๋๋ค. ์๋น์ค์ ์ฃผ์ ๋ก์ง์ Firebase๋ฅผ ์ฌ์ฉํ์์ผ๋ฉฐ, ์ฑํ์๋ฒ๋ก Express ํ๋ ์์ํฌ(with Socket.io)๋ฅผ ์ฌ์ฉํ์ฌ ๋ชจ๋๋ฆฌ์ ์๋น์ค๋ฅผ ๊ตฌํํ์์ต๋๋ค.

์ฑํ์์ ๋ฐ์ํ๋ ์ค๋ฒํค๋๋ฅผ ์ค์ด๊ณ  ๋ณด๋ค ์พ์ ํ ์๋น์ค๋ฅผ ์ ๊ณตํ  ๋ฐฉ๋ฒ์ ๋ชจ์ํ๊ธฐ ์ํด ["Node.js ๋์์ธ ํจํด ๋ฐ์ด๋ธ"](https://book.naver.com/bookdb/book_detail.nhn?bid=20517112 "Node.js Design Patterns: Design and implement production-grade Node.js applications using proven patterns and techniques")๋ก ํ์ตํ์์ต๋๋ค. ์ต๋ํ ๋ด์ฉ์ ๋ฐํ์ผ๋ก node.js์ ์ฅ์ ์ ํ์ฉํ๊ณ ์ ๊ฐ๋จํ ์ปค๋จธ์ ์๋น์ค API ๊ตฌํ ํ๋ก์ ํธ๋ฅผ ์งํํ์์ต๋๋ค.

์๋ฒ์ ํ์ฅ์ฑ์ ๊ณ ๋ คํ์ฌ Micro Service Architecture๋ฅผ ์ฑํํ์๊ณ  ๋ก๋๋ฐธ๋ฐ์ฑ์ ํตํด ํ ๊ณณ์ ์ง์ค๋๋ ๋ถํ๋ฅผ ๋ถ์ฐ์ํฌ ์ ์์์ต๋๋ค. ์ญ๋ฐฉํฅ ํ๋ก์๋ฅผ ์ ์ฉํ์ฌ ์๋ฒ ๊ตฌ์กฐ๋ฅผ ์ธ๋ถ๋ก๋ถํฐ ๊ฐ์ถ์์ผ๋ฉฐ, ๋ถ์ฐ๋ ์๋น์ค ๊ฐ ํต์ ์ ์ํด Message Queue Service๋ฅผ ์ฌ์ฉํ์ฌ API ์๋น์ค๋ฅผ ๊ตฌํํ์์ต๋๋ค.

<br/>

<br/>


## **์๋น์ค ๊ตฌ์ฑ**
---
<br/>

![Express](https://user-images.githubusercontent.com/54240763/163981531-eeaa182b-a77c-41c7-93a5-2fc144240b29.png)
<br/>

### **์๋ฒ ๋ชฉ๋ก**
>Single Endpoint  
>>Load Balancer  
>
>API Endpoint
>>auth-service server  
>>pay-service server  
>>file-service server  

<br/>

### **๋ฐ์ดํฐ๋ฒ ์ด์ค ๋ชฉ๋ก**
>RDB  
>>MySQL
>>>auth_msa  
>>>pay_msa  
>>>file_msa  
>
>In-Memory DB  
>>Redis  

<br/>

### **์ ํธ๋ฆฌํฐ**
>Service Mesh  
>>Consul  
>
>Message Queue
>>RabbitMQ

<br/>

<br/>


## **์ฌ์ฉ ๊ธฐ์ **
---
<br/>

|**ํ์**|**์ด๋ฆ**|**๋น๊ณ **|
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

<br/>

### ํ์ํ ํจํค์ง ํ์ผ ๋ค์ด๋ก๋
+ [Download Node.js](https://nodejs.org/en/download/current/ "nodejs")
+ [Download Mysql](https://www.mysql.com/downloads/ "Mysql")
+ [Download Redis](https://redis.io/download/ "Redis"   )
+ [Download RabbitMQ](https://www.rabbitmq.com/download.html "RabbitMQ")
+ [Download Consul](https://www.consul.io/downloads "Consul")

<br/>

### ์๋น์ค ์์
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

## **API ๋ชฉ๋ก**
---

๋ฐ๋ก๊ฐ๊ธฐ ๐ [API List](https://raw.githubusercontent.com/blancpaix/MSAexpress/main/04_api.txt "API List")

<br />

<br />

## **Database ๋ชจ๋ธ๋ง**
---

๋ฐ๋ก๊ฐ๊ธฐ ๐ [DB Modeling](https://raw.githubusercontent.com/blancpaix/MSAexpress/main/03_db_modeling.txt "DB Modeling")

<br />

<br />

