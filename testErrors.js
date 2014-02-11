var kgo = require('./kgo');

kgo('things', function(cb){
    setTimeout(function(){
        cb(null, 1);
    }, 100);
})('stuff', function(cb){
    setTimeout(function(){
        cb('some error');
    }, 100);
})('whatsits', ['things', 'stuff'], function(things, stuff, cb){
    setTimeout(function(){
        cb(null, things + stuff);
    }, 100);
})('dooby', ['things'], function(things, cb){
    setTimeout(function(){
        cb(null, things/2);
    }, 100);
})('majigger', ['whatsits', 'dooby'], function(whatsits, dooby, cb){
    console.log(whatsits, dooby);
}).errors({
    'stuff': function(error){console.log('stuff errored: ' + error)}
});