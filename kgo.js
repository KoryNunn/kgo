var run = require('./run'),
    EventEmitter = require('events').EventEmitter;

var defer = typeof setImmediate === 'function' ? setImmediate : setTimeout;

function newKgo(){
    var returnlessId = 0,
        tasks = {},
        results = {},
        inFlight,
        defaultsDefined;

    function kgoFn(){
        if(!arguments.length){
            throw new Error('kgo must must be called with a task or defaults');
        }

        if(inFlight){
            throw new Error('No tasks or defaults may be set after kgo is in flight');
        }

        var argIndex = 0;

        while(typeof arguments[argIndex] === 'string'){
            argIndex++;
        }

        var names = Array.prototype.slice.call(arguments, 0, argIndex),
            dependencies,
            fn;

        if(!names.length){
            names.push((returnlessId++).toString() + '__returnless');
        }

        if(typeof arguments[argIndex] === 'object' && !Array.isArray(arguments[argIndex])){
            var defaults = arguments[argIndex];

            if(defaultsDefined){
                throw new Error('Defaults may be defined only once per kgo');
            }

            for(var key in defaults){
                if(key in tasks){
                    throw new Error('A task is already defined for ' + key);
                }
                results[key] = defaults[key];
            }
            defaultsDefined = true;
            return kgoFn;
        }

        if(Array.isArray(arguments[argIndex])){
            dependencies = arguments[argIndex];
            argIndex++;
        }

        if(typeof arguments[argIndex] === 'function'){
            fn = arguments[argIndex];
        }

        if(typeof fn !== 'function'){
            throw new Error('No function provided for task number ' + Object.keys(tasks).length + ' (' + names + ')');
        }

        for(var i = 0; i < names.length; i++){
            if(names[i] in results){
                throw new Error('A default with the same name as this task (' + names[i] + ') has already been set');
            }
        }

        if(!dependencies){
            dependencies = [];
        }

        dependencies.map(function(dependency){
            if(typeof dependency !== 'string'){
                throw new Error('dependency was not a string: ' + dependency + ' in task: ' + names);
            }
        });

        names.map(function(name){
            if(name in tasks){
                throw new Error('A task with the same name (' + name + ') is aready defined');
            }

            tasks[name] = {
                names: names,
                args: dependencies,
                fn: fn
            };
        });

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