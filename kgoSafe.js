var run = require('./run');

function newKgo(){
    var tasks = {},
        results = {},
        errorHandlers;

    function kgoFn(name){
        tasks[name] = {
            name: name,
            args: [].slice.call(arguments, 1, -1).pop(),
            fn: arguments[arguments.length - 1]
        }

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