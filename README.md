kgo
===

A stupidly easy flow control function.

## Why

flow contol should be seamless, you should be able to say what you want done, and say kgo.

## Usage

    kgo(result name, [dependencies], asynchronous function);

where result name is an arbitrary string that can be concidered a name for the output of the function,

dependencies is an array of strings that map to the output of another function,

and asynchronous function is a function that, when complete, calls a callback with its results.

kgo returns itsself, so it can be chained:

    kgo(name, deps, fn)(name, deps, fn)(name, deps, fn)

## Example

require kgo:

    var kgo = require('./kgo');

use kgo:

    kgo('things', function(cb){

        //Something async
        setTimeout(function(){
            cb(null, 1);
        }, 100);

    })('stuff', function(cb){

        //Something async
        setTimeout(function(){
            cb(null, 2);
        }, 100);

    })('whatsits', ['things', 'stuff'], function(things, stuff, cb){

        //Something async
        setTimeout(function(){
            cb(null, things + stuff);
        }, 100);

    })('dooby', ['things'], function(things, cb){

        //Something async
        setTimeout(function(){
            cb(null, things/2);
        }, 100);

    })(['whatsits', 'dooby'], function(whatsits, dooby, cb){

        //Done
        console.log(whatsits, dooby);

    });

The above will log 3, 0.5;

## Errors

Yeah them annoying things.

You can assign error handlers to your functions by name, if you want to.

    kgo
    (calles)
    (more calles)
    .errors({
        'stuff':function(error){
            // will recieve the Whoops error.
        }
    });