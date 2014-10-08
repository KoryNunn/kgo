var run = require('./run'),
    EventEmitter = require('events').EventEmitter,
    fnRegex = /^function.*?\((.*?)\)/;

var defer = typeof setImmediate === 'function' ? setImmediate : setTimeout;

function newKgo(){
    var returnlessId = 0,
        tasks = {},
        results = {},
        errorHandlers = {},
        inFlight,
        defaultsDefined;

    function kgoFn(name, dependencies, fn){
        if(inFlight){
            throw "No tasks or defaults may be set after kgo is in flight";
        }

        if(arguments.length === 1 && name !== null && typeof name === 'object'){
            if(defaultsDefined){
                throw "Defaults may be defined only once per kgo";
            }

            for(var key in name){
                if(key in tasks){
                    throw "A task is already defined for " + key;
                }
                results[key] = name[key];
            }
            defaultsDefined = true;
            return kgoFn;
        }

        if(typeof name !== 'string'){
            fn = dependencies;
            dependencies = name;
            name = (returnlessId++).toString() + '__returnless';
        }

        if(typeof dependencies === 'function'){
            fn = dependencies;
            dependencies = [];
        }

        if(typeof fn !== 'function'){
            throw new Error('No function provided for task number ' + Object.keys(tasks).length + ' (' + name + ')');
        }

        if(name in results){
            throw "A default with the same name as this task (" + name + ") has already been set";
        }

        tasks[name] = {
            name: name,
            args: dependencies,
            fn: fn
        };

        return kgoFn;
    }

    for(var key in EventEmitter.prototype){
        kgoFn[key] = EventEmitter.prototype[key];
    }

    kgoFn.apply(null, arguments);

    defer(function(){
        inFlight = true;
        run(tasks, results, kgoFn);
    });

    return kgoFn;
}

module.exports = newKgo;