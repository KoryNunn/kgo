var kgo = require('./kgo');

kgo('things', function(cb){
    setTimeout(function(){
        cb(null, 1);
    }, 100);
})('stuff', function(cb){
    setTimeout(function(){
        cb(null, 2);
    }, 100);
})('whatsits', function(things, stuff, cb){
    setTimeout(function(){
        cb(null, things + stuff);
    }, 100);
})('dooby', function(things, cb){
    setTimeout(function(){
        cb(null, things/2);
    }, 100);
})(function(whatsits, dooby, cb){
    console.log(whatsits, dooby);
});