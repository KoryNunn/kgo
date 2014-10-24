kgo
===

Stupidly easy flow control.

## Why

flow contol should be seamless, you should be able to say what you want done, and say kgo.

## Usage

    kgo(result name, [dependencies], asynchronous function);

where result name is an arbitrary string that can be concidered a name for the output of the function,

dependencies is an array of strings that map to the output of another function,

and asynchronous function is a function that, when complete, calls a callback with its results.

kgo returns its-self, so it can be chained:

    kgo
    (name, deps, fn)
    (name, deps, fn)
    (name, deps, fn);

## Example

require kgo:

    var kgo = require('./kgo');

use kgo:

    kgo
    ('things', function(done){

        //Something async
        setTimeout(function(){
            done(null, 1);
        }, 100);

    })
    ('stuff', function(done){

        //Something async
        setTimeout(function(){
            done(null, 2);
        }, 100);

    })
    ('whatsits', ['things', 'stuff'], function(things, stuff, done){

        //Something async
        setTimeout(function(){
            done(null, things + stuff);
        }, 100);

    })
    ('dooby', ['things'], function(things, done){

        //Something async
        setTimeout(function(){
            done(null, things/2);
        }, 100);

    })
    (['whatsits', 'dooby'], function(whatsits, dooby, done){

        //Done
        console.log(whatsits, dooby);

    });

The above will log 3, 0.5;

## Async Mapping

You can do an async map over items by setting the count of the items in the callback:

    var items = [1,2,3,4];

    kgo('items', function(done){
        done(null, items);
    })('doubled', ['items'], function(items, done){

        // Here we tell kgo that we will be returning an array of results, not just one.
        this.count(items.length);

        for(var i = 0; i < items.length; i++){

            // Call the callback as usual, but make sure it is called as many times as you said it would be.
            done(null, items[i]*2);
        }
    })(['doubled'], function(doubled){
        // Our doubled numbers
    });

## Ignoring dependency results

You will often not need the result of a dependency, and it's annoying to have unused parameters in your functions.
You can specify that you have a dependancy, whos result you don't want, by prefixing the dependancy name with an exclamation mark:

    kgo

    ('a', function(done){
        done(null, 'foo');
    })

    ('b', ['!a'], function(done){
        done(null, 'bar');
    })

    (['b'],  function(b){
        // here b will be "bar"
    })

## Defaults

You can define default data for use in later tasks by passing an object into kgo, where the keys in the objects will map to dependency names:

    kgo

    ({
        foo: 1    
    })

    ('bar', function(done){
        done(null, 2);
    });

    ('baz', ['foo', 'bar'], function(foo, bar, done){

    })

This is especially useful when you want to use named functions that need additional parameters to run:

    var fs = require('fs');

    kgo
    ({
        'sourcePath': '/foo/bar'
    })
    ('files', ['sourcePath'], fs.readdir)

### Note: You may only define defaults once in a kgo block. Extra calls will result in an error.

## Multiple results

You can return more than one result in a single task by giving your task multiple names, and returning more results in the callback

    kgo

    ('foo', 'bar', function(done){
        done(null, 2, 4);
    });

    ('baz', ['foo', 'bar'], function(foo, bar, done){
        // foo === 2
        // bar === 4
    })

## Errors

Yeah them annoying things.

kgo has EventEmitter methods on it, so you can bind to 'error'

The handler gets passed the error, and the name of the step that returned the error.

    kgo
    (task)
    (another task)
    .on('error', function(error, stepName){

    });