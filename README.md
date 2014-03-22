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

kgo returns its-self, so it can be chained:

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

You can do an async map over items by setting the count of the items in the callback:

    var items = [1,2,3,4];

    kgo('items', function(cb){
        cb(null, items);
    })('doubled', ['items'], function(items, cb){

        // Here we tell kgo that we will be returning an array of results, not just one.
        this.count(items.length);

        for(var i = 0; i < items.length; i++){

            // Call the callback as usual, but make sure it is called as many times as you said it would be.
            cb(null, items[i]*2);
        }
    })(['doubled'], function(doubled){
        // Our doubled numbers
    });

## Errors

Yeah them annoying things.

kgo has EventEmitter methods on it, so you can bind to 'error'

The handler gets passed the error, and the name of the step that returned the error.

    kgo
    (calls)
    (more calls)
    .on('error', function(error, stepName){

    });