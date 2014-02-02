kgo
===

A stupidly easy flow control function.

## Why

flow contol should be seamless, you should be able to say what you want done, and say kgo.

## Usage

kgo is black magic, use it with caution.

    kgo(result name, asynchronous function);

where result name is an arbitrary string that can be concidered a name for the output of the function

and asynchronous function is a function that, when complete, calls a callback with its results.

kgo returns itsself, so it can be chained:

    kgo(name, fn)(name, fn)(name, fn)

## Example

require kgo:

    var kgo = require('./kgo');

use kgo:

note: functions ****MUST**** have argument names that match the named result of other functions!

another note: functions ****MUST**** define a callback as the last argument.

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

    })('whatsits', function(things, stuff, cb){

        //Something async
        setTimeout(function(){
            cb(null, things + stuff);
        }, 100);

    })('dooby', function(things, cb){

        //Something async
        setTimeout(function(){
            cb(null, things/2);
        }, 100);

    })(function(whatsits, dooby, cb){

        //Done
        console.log(whatsits, dooby);

    });

The above will log 3, 0.5;

## HOW!??!?!

kgo toStrings the functions, figures out their parameters, stirs over high heat, adds eye of newt and then profit.

USE WITH CAUTION!

## Errors

Yeah them annoying things.

You can assign error handlers to your functions by name, if you want to.

    kgo('things', function(cb){

        //Something async
        setTimeout(function(){
            cb(null, 1);
        }, 100);

    })('stuff', function(cb){

        //Something async
        setTimeout(function(){
            cb(new Error('Whoops'));
        }, 100);

    })(function(things, stuff, cb){

        //Something async
        setTimeout(function(){
            console.log(things, stuff);
            cb()
        }, 100);

    }).errors({
        'stuff':function(error){
            // will recieve the Whoops error.
        }
    });





You can also use the totally safe implementation.

The syntax is slightly different:

    kgo(name, [named results], function);

But that's boring.