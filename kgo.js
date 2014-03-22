var run = require('./run'),
    EventEmitter = require('events').EventEmitter,
    fnRegex = /^function.*?\((.*?)\)/;

function newKgo(){
    var returnlessId = 0,
        tasks = {},
        results = {},
        errorHandlers = {};

    function kgoFn(name, dependencies, fn){
        if(typeof name !== 'string'){
            fn = dependencies;
            dependencies = name;
            name = (returnlessId++).toString() + '__returnless';
        }

        if(typeof dependencies === 'function'){
            fn = dependencies;
            dependencies = [];
        }

        tasks[name] = {
            name: name,
            args: dependencies,
            fn: fn
        };

        return kgoFn
    };
    for(var key in EventEmitter.prototype){
        kgoFn[key] = EventEmitter.prototype[key];
    }

    kgoFn.apply(null, arguments);

    setTimeout(function(){
        run(tasks, results, kgoFn);
    },0);

    return kgoFn;
}

module.exports = newKgo;