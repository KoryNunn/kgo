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

    kgo(function things(cb){
        setTimeout(function(){
            cb(null, 1);
        }, 100);
    })(function stuff(cb){
        setTimeout(function(){
            cb(null, 2);
        }, 100);
    })(function whatsits(things, stuff, cb){
        setTimeout(function(){
            cb(null, things + stuff);
        }, 100);
    })(function dooby(things, cb){
        setTimeout(function(){
            cb(null, things/2);
        }, 100);
    })(function majigger(whatsits, dooby, cb){
        console.log(whatsits, dooby);
        cb();
    });

The above will log 3, 0.5;

## HOW!??!?!

kgo toStrings the functions, figures out their names, and parameters, stirs over high heat, adds eye of newt and then profit.

USE WITH CAUTION!