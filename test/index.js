var test = require('tape'),
    kgo = require('../');

function doAsync(done){
    var args = Array.prototype.slice.call(arguments, 1);
    setTimeout(function(){
        done.apply(null, args);
    }, 100);
}

test('no function', function(t){
    t.plan(1);

    t.throws(function(){
        kgo('things');
    });
});

test('waterfall', function(t){
    t.plan(2);

    kgo('things', function(done){
        doAsync(done, null, 1);

    })
    ('stuff', ['things'], function(things, done){
        doAsync(done, null, 2 + things);

    })
    (['stuff'], function(stuff){
        t.equal(stuff, 3);
        t.pass();
    });
});

test('parallel', function(t){
    t.plan(3);

    kgo('things', function(done){
        doAsync(done, null, 1);

    })
    ('stuff', function(done){
        doAsync(done, null, 2);

    })
    (['things', 'stuff'], function(things, stuff){
        t.equal(things, 1);
        t.equal(stuff, 2);
        t.pass();
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
    (['b'],  function(){
        t.pass('got first task');
    })
    (['b'], function(){
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
    });
});

test('defaults', function(t){
    t.plan(2);

    kgo
    ({
        things: 1,
        stuff: 2
    })
    (['things', 'stuff'], function(things, stuff){
        t.equal(things, 1);
        t.equal(stuff, 2);
    });
});

test('defaults with same taskname', function(t){
    t.plan(1);

    t.throws(function(){
        kgo
        ({
            things: 1,
            stuff: 2
        })
        ('stuff', function(done){
            doAsync(done, null, 2);
        })
        (['things', 'stuff'], function(things, stuff, done){
            t.fail('task ran but should not have');
            done();
        });
    }, 'cannot define a task with the same name as that of a default');
});

test('defaults with same taskname, after task', function(t){
    t.plan(1);

    t.throws(function(){
        kgo
        ('stuff', function(done){
            doAsync(done, null, 2);
        })
        ({
            things: 1,
            stuff: 2
        })
        (['things', 'stuff'], function(things, stuff, done){
            t.fail('task ran but should not have');
            done();
        });
    }, 'set defaults containing a key that conflicts with a task name');
});

test('double defaults', function(t){
    t.plan(1);

    t.throws(function(){
        kgo
        ({
            things: 1
        })
        ({
            stuff: 2
        })
        (['things', 'stuff'], function(things, stuff, done){
            t.fail('task ran but should not have');
            done();
        });
    }, 'cannot define defaults twice');
});

test('double tasks', function(t){
    t.plan(1);

    t.throws(function(){
        kgo
        ('foo', function(done){
            done();
        })
        ('foo', function(done){
            done();
        });
    }, 'cannot define tasks twice');
});

test('multiple datas', function(t){
    t.plan(2);

    kgo
    ('foo', 'bar', function(done){
        done(null, 1,2);
    })
    (['foo'], function(foo){
        t.equal(foo, 1);
    })
    (['bar'], function(bar){
        t.equal(bar, 2);
    });
});

test('error handler pass', function(t){
    t.plan(2);

    kgo
    ('result', function(done){
        setTimeout(function(){
            done(null, true);
        }, 100);
    })
    (['*', 'result'], function(error, result){
        t.notOk(error);
        t.ok(result);
    });
});

test('error handler fail', function(t){
    t.plan(2);

    kgo
    ('result', function(done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*', 'result'], function(error, result){
        t.ok(error);
        t.notOk(result);
    });
});

test('error handler fail different step', function(t){
    t.plan(4);

    kgo
    ('initial', function(done){
        setTimeout(function(){
            done(null, true);
        }, 100);
    })
    ('result', ['initial'], function(initial, done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*', 'initial'], function(error, initial){
        t.ok(initial);
        t.notOk(error);
    })
    (['*', 'result'], function(error, result){
        t.ok(error);
        t.notOk(result);
    });
});

test('error handler fail not passed successful results', function(t){
    t.plan(3);

    kgo
    ('initial', function(done){
        setTimeout(function(){
            done(null, true);
        }, 100);
    })
    ('result', ['initial'], function(initial, done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*', 'initial', 'result'], function(error, initial, result){
        t.ok(error);
        t.notOk(initial);
        t.notOk(result);
    });
});

test('multiple error handlers', function(t){
    t.plan(2);

    kgo
    ('result', function(done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*', 'result'], function(error){
        t.ok(error, 'result handler got error');
    })
    (['*'], function(error){
        t.ok(error, 'error only handler got error');
    });
});

test('generic error handlers', function(t){
    t.plan(1);

    kgo
    ('initial', function(done){
        setTimeout(function(){
            done(null, true);
        }, 100);
    })
    ('result', ['initial'], function(initial, done){
        setTimeout(function(){
            done(null, initial);
        }, 100);
    })
    (['result'], function(result){
        t.ok(result);
    })
    (['*'], function(){
        t.fail();
    });
});

test('complete style error handling', function(t){
    t.plan(2);

    kgo
    ('initial', function(done){
        setTimeout(function(){
            done(null, true);
        }, 100);
    })
    ('result', ['initial'], function(initial, done){
        setTimeout(function(){
            done(null, initial);
        }, 100);
    })
    (['*', '!result'], function(error){
        t.notOk(error);
        t.equal(arguments.length, 1, 'no result, no done');
    });
});

test('task after error', function(t){
    t.plan(2);

    kgo
    ('initial', function(done){
        done();
    })
    ('result', ['initial'], function(initial, done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*', 'result'], function(error, result){
        t.ok(error);
        t.notOk(result);
    })
    ('foo', ['initial'], function(initial, done){
        setTimeout(function(){
            done();
        }, 200);
    })
    (['foo'], function(){
        t.fail();
    });
});

test('multiple named errors', function(t){
    t.plan(2);

    kgo
    ('task1', function(done){
        done();
    })
    ('task2', function(done){
        done();
    })
    ('result', ['task1'], function(task1, done){
        setTimeout(function(){
            done(true);
        }, 100);
    })
    (['*task1','*task2','result'], function(){
        t.fail();
    })
    (['*task1','*result'], function(task1error, resultError){
        t.notOk(task1error);
        t.ok(resultError);
    });
});

test('multiple named errors 2', function(t){
    t.plan(3);

    kgo
    ('task1', function(done){
        done(true);
    })
    ('task2', function(done){
        done();
    })
    ('result', ['task1'], function(){
        t.fail();
    })
    (['*task1','*task2','result'], function(task1error, task2error, result){
        t.ok(task1error);
        t.notOk(task2error);
        t.notOk(result);
    });
});

test('stupid dep list', function(t){
    t.plan(1);

    t.throws(
        function(){
            kgo
            ('foo', 'bar', function(done) {
                done(null, 1, 2);
            })
            (['foo', ['bar']], function(){});
        },
        /dependency was not a string: bar in task: 0__returnless/
    );
});

test('stupid dep list 2', function(t){
    t.plan(1);

    t.throws(
        function(){
            kgo
            ('*foo', function(done) {
                done(null, 1, 2);
            })
            (['*foo'], function(){});
        },
        /Task names can not begin with */
    );
});

test('task with missing dependency', function(t){
    t.plan(2);

    var d = require('domain').create();

    d.on('error', function(error){
        t.ok(error instanceof Error, 'error is instance of Error');
        t.equal(error.message, 'No task or result has been defined for dependency: foo');
    });

    d.run(function(){
        kgo
        (['foo'], function(){});
    });
});

test('after in flight', function(t){
    t.plan(2);

    var d = require('domain').create();

    d.on('error', function(error){
        t.ok(error instanceof Error, 'error is instance of Error');
        t.equal(error.message, 'No tasks or defaults may be set after kgo is in flight');
    });

    d.run(function(){
        var x = kgo
        ('foo', function(done){
            setTimeout(done, 100);
        });

        setTimeout(function(){
            x('bar', function(done){
                done();
            });
        }, 50);
    });
});

test('tasks with ! in dependency name', function(t){
    t.plan(2);

    kgo
    ('fo!o', function(done){
        done(null, 'foo');
    })
    ('ba!r', ['fo!o'], function(foo, done){
        t.equal(foo, 'foo');
        done(null, 'bar');
    })
    (['!fo!o', 'ba!r'], function(bar){
        t.equal(bar, 'bar');
    });
});

test('must have arguments', function(t){
    t.plan(2);

    t.throws(
        function(){
            kgo();
        },
        /kgo must must be called with a task or defaults/
    );
    t.throws(
        function(){
            kgo({})();
        },
        /kgo must must be called with a task or defaults/
    );
});

test('stack is not poluted with kgo', function(t){
    t.plan(1);

    function someTask(done){
        done(new Error('bang'));
    }

    kgo
    ('someTask', someTask)
    (['*'], function(error){
        t.notOk(~error.stack.indexOf('kgo/run.js'));
    });
});

test('throw stack is not poluted with kgo', function(t){
    t.plan(3);

    function someTask(done){
        throw 'ETOOMUCHFOO';
    }

    var d = require('domain').create();

    d.on('error', function(error){
        t.ok(~error.stack.indexOf('ETOOMUCHFOO'));
        t.ok(~error.stack.indexOf('aboutToFoo'));
        t.notOk(~error.stack.indexOf('kgo/run.js'));
    });

    function aboutToFoo(){
        d.run(function(){
            kgo
            ('someTask', someTask);
        });
    }

    aboutToFoo();
});

test('done called more than once', function(t){
    t.plan(2);

    var d = require('domain').create();

    d.on('error', function(error){
        t.ok(error instanceof Error, 'error is instance of Error');
        t.equal(error.message, 'Step callback called more than once for task: someTask');
    });

    d.run(function(){
        kgo
        ('someTask', function(done){
            done();
            done();
        });
    });
});

test('error steps with a !dependency dont mess with argument length when error is async', function(t){
    t.plan(1);

    kgo
    ({foo: 'foo'})
    ('bar', function(done){
        doAsync(done, 'barError');
    })
    (['*bar', '!foo'], function(){
        t.equal(arguments.length, 1, 'correct number of arguments');
    });
});

test('error steps with a !dependency dont mess with argument length when error is synchronous', function(t){
    t.plan(1);

    kgo
    ({foo: 'foo'})
    ('bar', function(done){
        done('barError');
    })
    (['*', '!foo'], function(){
        t.equal(arguments.length, 1, 'correct number of arguments');
    });
});