var test = require('grape'),
    kgo = require('../');

function doAsync(cb, error, result){
    setTimeout(function(){
        cb(error, result);
    }, 100);
}

test('waterfall', function(t){
    t.plan(1);

    kgo('things', function(cb){
        doAsync(cb, null, 1);
    })('stuff', ['things'], function(things, cb){
        doAsync(cb, null, 2 + things);
    })(['stuff'], function(stuff, cb){
        t.equal(stuff, 3);
    });
});

test('parallel', function(t){
    t.plan(2);

    kgo('things', function(cb){
        doAsync(cb, null, 1);
    })('stuff', function(cb){
        doAsync(cb, null, 2);
    })(['things', 'stuff'], function(things, stuff, cb){
        t.equal(things, 1);
        t.equal(stuff, 2);
    });
});

test('map-parallel', function(t){
    t.plan(3);

    var items = [1,2,3,4];

    kgo('items', function(cb){
        doAsync(cb, null, items);
    })('doubled', ['items'], function(items, cb){
        this.count(items.length);
        for(var i = 0; i < items.length; i++){
            doAsync(cb, null, items[i]*2);
        }
    })(['doubled'], function(doubled){
        t.equal(doubled.length, 4);
        t.equal(doubled[0], 2);
        t.equal(doubled[3], 8);
    });
});

test('errors', function(t){
    t.plan(2);

    kgo('things', function(cb){
        doAsync(cb, null, 1);
    })('stuff', ['things'], function(things, cb){
        cb(new Error('stuff screwed up'));
    })(['stuff'], function(stuff, cb){
        t.equal(stuff, 3);
    }).on('error', function(error, name){
        t.equal(name, 'stuff');
        t.equal(error.message, 'stuff screwed up');
    });
});