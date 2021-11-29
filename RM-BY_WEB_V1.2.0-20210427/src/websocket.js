//通用多 webSocket请求
var importWs0=null,importWs1=null,importWs2=null,importWs3=null,importWs4=null,importWs5=null,importWs6=null,importWs7=null,importWs8=null,importWs9=null;
var dddd = "";
function publicWebsocket(status,index,url,data){
  console.log(status)
  if(status){
    switch(Number(index)){
      case 0 :
          setTimeout(function(){
            dddd = {"AAAA":123};
            return dddd;
            console.log("进来了")
          },5000);
         importWs0 = new WebSocket(url); //连接服务器
         importWs0.onopen = function(event){importWs0.send(data);};
         importWs0.onmessage = function(event){var wsData = {"event":event,"index":0};return wsData;};
         importWs0.onclose = function(event){};
         importWs0.onerror = function(event){};
         break;
      case 1 :
         importWs1 = new WebSocket(url); //连接服务器
         importWs1.onopen = function(event){importWs1.send(data);};
         importWs1.onmessage = function(event){var wsData = {"event":event,"index":1};return wsData;};
         importWs1.onclose = function(event){};
         importWs1.onerror = function(event){};
         break;
      case 2 :
         importWs2 = new WebSocket(url); //连接服务器
         importWs2.onopen = function(event){importWs2.send(data);};
         importWs2.onmessage = function(event){var wsData = {"event":event,"index":2};return wsData;};
         importWs2.onclose = function(event){};
         importWs2.onerror = function(event){};
         break;
      case 3 :
         importWs3 = new WebSocket(url); //连接服务器
         importWs3.onopen = function(event){importWs3.send(data);};
         importWs3.onmessage = function(event){var wsData = {"event":event,"index":3};return wsData;};
         importWs3.onclose = function(event){};
         importWs3.onerror = function(event){};
         break;
      case 4 :
         importWs4 = new WebSocket(url); //连接服务器
         importWs4.onopen = function(event){importWs4.send(data);};
         importWs4.onmessage = function(event){var wsData = {"event":event,"index":4};return wsData;};
         importWs4.onclose = function(event){};
         importWs4.onerror = function(event){};
         break;
      case 5 :
         importWs5 = new WebSocket(url); //连接服务器
         importWs5.onopen = function(event){importWs5.send(data);};
         importWs5.onmessage = function(event){var wsData = {"event":event,"index":5};return wsData;};
         importWs5.onclose = function(event){};
         importWs5.onerror = function(event){};
         break;
      case 6 :
         importWs6 = new WebSocket(url); //连接服务器
         importWs6.onopen = function(event){importWs6.send(data);};
         importWs6.onmessage = function(event){var wsData = {"event":event,"index":6};return wsData;};
         importWs6.onclose = function(event){};
         importWs6.onerror = function(event){};
         break;
      case 7 :
         importWs7 = new WebSocket(url); //连接服务器
         importWs7.onopen = function(event){importWs7.send(data);};
         importWs7.onmessage = function(event){var wsData = {"event":event,"index":7};return wsData;};
         importWs7.onclose = function(event){};
         importWs7.onerror = function(event){};
         break;
      case 8 :
         importWs8 = new WebSocket(url); //连接服务器
         importWs8.onopen = function(event){importWs8.send(data);};
         importWs8.onmessage = function(event){var wsData = {"event":event,"index":8};return wsData;};
         importWs8.onclose = function(event){};
         importWs8.onerror = function(event){};
         break;
      case 9 :
         importWs9 = new WebSocket(url); //连接服务器
         importWs9.onopen = function(event){importWs9.send(data);};
         importWs9.onmessage = function(event){var wsData = {"event":event,"index":9};return wsData;};
         importWs9.onclose = function(event){};
         importWs9.onerror = function(event){};
         break;
    }
  }else{
    if(importWs0 !== null){importWs0.close()};
    if(importWs1 !== null){importWs1.close()}
    if(importWs2 !== null){importWs2.close()}
    if(importWs3 !== null){importWs3.close()}
    if(importWs4 !== null){importWs4.close()}
    if(importWs5 !== null){importWs5.close()}
    if(importWs6 !== null){importWs6.close()}
    if(importWs7 !== null){importWs7.close()}
    if(importWs8 !== null){importWs8.close()}
    if(importWs9 !== null){importWs9.close()}
  }
}

//通用单websockt请求
function onlyPublicWebsocket(status,url,data){
  if(status){
    importWs = new WebSocket(url); //连接服务器
    importWs.onopen = function(event){importWs.send(data);};
    importWs.onmessage = function(event){var wsData = {"event":event};return wsData;};
    importWs.onclose = function(event){};
    importWs.onerror = function(event){};
  }else{
    if(importWs !== null){importWs.close()};
  }
}

export default {
  publicWebsocket,
  onlyPublicWebsocket
};
