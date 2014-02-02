var run = require('./run'),
    fnRegex = /^function.*?\((.*?)\)/;

function newKgo(){
    var returnlessId = 0,
        tasks = {},
        results = {},
        errorHandlers;

    function kgoFn(name, dependencies, fn){
        if(typeof name !== 'string'){
            fn = dependencies;
            dependencies = name;
            name = (returnlessId++).toString() + '__returnless';
        }

        if(typeof dependencies === 'function'){
            fn = dependencies;

            var details = fnRegex.exec(fn.toString());

            if(!details){
                throw "Functions must have named arguments";
            }

            dependencies = details[1].split(',');

            // We don't care about the callback
            dependencies = dependencies.slice(0,-1);

            for(var i = 0; i < dependencies.length; i++) {
                dependencies[i] = dependencies[i].trim();
            }
        }

        tasks[name] = {
            name: name,
            args: dependencies,
            fn: fn
        };

        return kgoFn
    };

    kgoFn.errors = function(handlers){
        errorHandlers = handlers;
    };

    function kgoError(name, error){
        var handler = errorHandlers[name];

        if(handler){
            handler(error);
        }
    }

    kgoFn.apply(null, arguments);

    setTimeout(function(){
        run(tasks, results, kgoError);
    },0);

    return kgoFn;
}

module.exports = newKgo;