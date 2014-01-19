var run = require('./run'),
    fnRegex = /^function\s+?([_\$a-zA-Z][_\$a-zA-Z0-9]*?)\s*\((.*?)\)/;

function newKgo(){
    var tasks = {},
        results = {},
        errorHandlers;

    function kgoFn(fn){
        var details = fnRegex.exec(fn.toString());

        if(!details){
            throw "Functions must have a name";
        }

        var name = details[1],
            args = details[2].split(',');

        // We don't care about the callback
        args = args.slice(0,-1);

        for(var i = 0; i < args.length; i++) {
            args[i] = args[i].trim();
        }

        tasks[name] = {
            name: name,
            args: args,
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