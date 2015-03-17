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

    })
    .on('complete', function(){
        // All dones have been called OR an error occured
    });
    .on('error', function(error, stepNames){
        // handle the error for the given step.
    });

The above will log 3, 0.5;

## Async Mapping

Removed as of version 2. Use (foreign)[https://www.npmjs.com/package/foreign] instead.

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
    });

## Defaults

You can define default data for use in later tasks by passing an object into kgo, where the keys in the objects will map to dependency names:

    kgo

    ({
        foo: 1    
    })

    ('bar', function(done){
        done(null, 2);
    })

    ('baz', ['foo', 'bar'], function(foo, bar, done){

    });

This is especially useful when you want to use named functions that need additional parameters to run:

    var fs = require('fs');

    kgo
    ({
        'sourcePath': '/foo/bar'
    })
    ('files', ['sourcePath'], fs.readdir);

### Note: You may only define defaults once in a kgo block. Extra calls will result in an error.

## Multiple results

You can return more than one result in a single task by giving your task multiple names, and returning more results in the callback

    kgo

    ('foo', 'bar', function(done){
        done(null, 2, 4);
    })

    ('baz', ['foo', 'bar'], function(foo, bar, done){
        // foo === 2
        // bar === 4
    });

## Errors

Yeah them annoying things.

kgo has EventEmitter methods on it, so you can bind to 'error'

The handler gets passed the error, and the name of the step that returned the error.

    kgo
    (task)
    (another task)
    .on('error', function(error, stepName){

    });

## Complete

the `complete` event will be emitted when either an error has been returned, or all tasks done methods have been called.

    kgo
    (task)
    (another task)
    .on('complete', function(){

    });