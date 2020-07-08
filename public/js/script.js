const socket = io('/nordine');
socket.on('message',function(message){
    console.log(message);
})
console.log(window.location.href);