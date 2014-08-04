var test = require('grape'),
    kgo = require('../');

function doAsync(done, error, result){
    setTimeout(function(){
        done(error, result);
    }, 100);
}

test('no function', function(t){
    t.plan(1);

    t.throws(function(){
        kgo('things');
    });
});

test('waterfall', function(t){
    t.plan(1);

    kgo('things', function(done){
        doAsync(done, null, 1);
    })('stuff', ['things'], function(things, done){
        doAsync(done, null, 2 + things);
    })(['stuff'], function(stuff, done){
        t.equal(stuff, 3);
    });
});

test('parallel', function(t){
    t.plan(2);

    kgo('things', function(done){
        doAsync(done, null, 1);
    })('stuff', function(done){
        doAsync(done, null, 2);
    })(['things', 'stuff'], function(things, stuff, done){
        t.equal(things, 1);
        t.equal(stuff, 2);
    });
});

test('map-parallel', function(t){
    t.plan(3);

    var items = [1,2,3,4];

    kgo('items', function(done){
        doAsync(done, null, items);
    })('doubled', ['items'], function(items, done){
        this.count(items.length);
        for(var i = 0; i < items.length; i++){
            doAsync(done, null, items[i]*2);
        }
    })(['doubled'], function(doubled){
        t.equal(doubled.length, 4);
        t.equal(doubled[0], 2);
        t.equal(doubled[3], 8);
    });
});

test('errors', function(t){
    t.plan(2);

    kgo('things', function(done){
        doAsync(done, null, 1);
    })('stuff', ['things'], function(things, done){
        done(new Error('stuff screwed up'));
    })(['stuff'], function(stuff, done){
        t.equal(stuff, 3);
    }).on('error', function(error, name){
        t.equal(name, 'stuff');
        t.equal(error.message, 'stuff screwed up');
    });
});

test('returnless', function(t){
    t.plan(2);

    kgo

    ('a', function(done){
        doAsync(done, null, 1);
    })

    ('b', ['a'], function(a, done){
        doAsync(done, null, 1);
    })

    (['b'],  function(b){
        t.pass('got first task');
    })

    (['b'], function(b){
        t.pass('got second task');
    });
});

test('ignore dependencies', function(t){
    t.plan(1);

    kgo

    ('a', function(done){
        doAsync(done, null, 1);
    })

    ('b', ['!a'], function(done){
        doAsync(done, null, 1);
    })

    (['b'],  function(b){
        t.equal(b, 1, 'got correct parameter');
    })
});