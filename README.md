kgo
===

A stupidly easy flow control function.

## Why

flow contol should be seamless, you should be able to say what you want done, and say kgo.

## Usage

kgo is black magic, use it with caution.

require kgo:

    var kgo = require('./kgo');

use kgo:

note: functions ****MUST**** have function names!

another note: functions ****MUST**** have argument names that match the names of other functions!

and another note: functions ****MUST**** define a callback as the last argument.

    kgo(function things(cb){

        //Something async
        setTimeout(function(){
            cb(null, 1);
        }, 100);

    })(function stuff(cb){

        //Something async
        setTimeout(function(){
            cb(null, 2);
        }, 100);

    })(function whatsits(things, stuff, cb){

        //Something async
        setTimeout(function(){
            cb(null, things + stuff);
        }, 100);

    })(function dooby(things, cb){

        //Something async
        setTimeout(function(){
            cb(null, things/2);
        }, 100);

    })(function majigger(whatsits, dooby, cb){

        //Done
        console.log(whatsits, dooby);

    });

The above will log 3, 0.5;

## HOW!??!?!

kgo toStrings the functions, figures out their names, and parameters, stirs over high heat, adds eye of newt and then profit.

USE WITH CAUTION!

## Errors

Yeah them anoying things.

You can assign error handlers to your functions by name, if you want to.

    kgo(function things(cb){

        //Something async
        setTimeout(function(){
            cb(null, 1);
        }, 100);

    })(function stuff(cb){

        //Something async
        setTimeout(function(){
            cb(new Error('Whoops'));
        }, 100);

    })(function whatsits(things, stuff, cb){

        //Something async
        setTimeout(function(){
            console.log(things, stuff);
            cb()
        }, 100);

    }).errors({
        "stuff":function(error){
            // will recieve the Whoops error.
        }
    });