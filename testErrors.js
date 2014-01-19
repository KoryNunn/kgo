var kgo = require('./kgo');

kgo(function things(cb){
    setTimeout(function(){
        cb(null, 1);
    }, 100);
})(function stuff(cb){
    setTimeout(function(){
        cb('some error');
    }, 100);
})(function whatsits(things, stuff, cb){
    setTimeout(function(){
        cb(null, things + stuff);
    }, 100);
})(function dooby(things, cb){
    setTimeout(function(){
        cb(null, things/2);
    }, 100);
})(function majigger(whatsits, dooby, cb){
    console.log(whatsits, dooby);
}).errors({
    'stuff': function(error){console.log('stuff errored: ' + error)}
});