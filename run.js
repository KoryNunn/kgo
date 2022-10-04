var symbols = require('./symbols'),
    cleanErrorRegex = /((?:\n.*__kgoRunStep__[^]+|\n.*__kgoDeferredCallback__)[^]+?\n[^]+?(?:\n|$))/;

function cleanError(stack, error){
    var currentStack = '';
    if(error instanceof Error){
        currentStack = error.stack ? error.stack.replace(cleanErrorRegex, '') : currentStack;
    }else{
        error = new Error(error);
        error.stack = '';
    }
    error.stack = 'Error: ' + error.message + currentStack + stack;
    return error;
}

function Step(task, args, done){
    this._task = task;
    this._args = args;
    this._done = done;
}
Step.prototype.run = function __kgoRunStep__(){
    var step = this;

    function complete(error){

        if(step._complete){
            throw cleanError(step._task.stack, 'Step callback called more than once for task: ' + step._task.names);
        }

        step._complete = true;

        var result = Array.prototype.slice.call(arguments, 1);

        if(error instanceof Error){
            error = cleanError(step._task.stack, error);
        }

        step.done(error, result);
    }

    try{
        var args = this._args.slice();
        if(!this._task.returnless){
            args.push(complete);
        }
        this._task.fn.apply(this, args);
    }catch(error){
        throw cleanError(step._task.stack, error);
    }
};
Step.prototype.done = function(error, result){

    if(error){
        return this._done(error);
    }
    this._done(null, result);
};

function runTask(task, results, errors, aboutToRun, done){
    var names = task.names,
        dependants = task.args,
        args = [],
        error = errors[symbols.errorSymbol],
        numDeps = 0,
        metDeps = 0,
        allDepsMet;

    if(dependants){
        var useError,
            hasError;

        for(var i = 0; i < dependants.length; i++) {
            var dependantName = dependants[i],
                isErrorDep = dependantName.match(symbols.errorDependency),
                ignore = dependantName.match(symbols.ignoreDependency);

            if(isErrorDep){
                useError = true;
                hasError = hasError || dependantName in errors;
                continue;
            }

            if(ignore){
                dependantName = dependantName.slice(1);
            }

            numDeps++;

            if(dependantName in results){
                metDeps++;
            }
        }

        allDepsMet = numDeps === metDeps;

        if(!allDepsMet && !hasError || !numDeps && useError && !hasError || !hasError && error){
            return;
        }

        for(var i = 0; i < dependants.length; i++) {
            var dependantName = dependants[i],
                isErrorDep = dependantName.match(symbols.errorDependency),
                ignore = dependantName.match(symbols.ignoreDependency);

            if(isErrorDep){
                args.push(errors[dependantName]);
                continue;
            }

            if(ignore){
                continue;
            }

            if(hasError){
                args.push(undefined);
                continue;
            }

            args.push(results[dependantName]);
        }
    }

    var step = new Step(task, args, function(error, results){
        done(names, error, results);
    });

    aboutToRun(names);
    step.run();
}

function run(tasks, results, errors, kgo){
    var currentTask,
        noMoreTasks = true;

    for(var key in tasks){
        noMoreTasks = false;
        currentTask = tasks[key];

        runTask(
            currentTask,
            results,
            errors,
            function(names){
                names.map(function(name){
                    delete tasks[name];
                });
            },
            function(names, taskError, taskResults){
                if(taskError && !errors[symbols.errorSymbol]){
                    errors[symbols.errorSymbol] = taskError;
                }

                for(var i = 0; i < names.length; i++){
                    if(taskError){
                        errors[symbols.errorSymbol + names[i]] = taskError;
                    }else{
                        results[names[i]] = taskResults[i];
                    }
                }

                run(tasks, results, errors, kgo);
            }
        );
    }
}

function cloneAndRun(tasks, results, kgo){
    var todo = {},
        errors = {};

    kgo._taskCount = Object.keys(results).length;

    function checkDependencyIsDefined(dependencyName){
        var taskName = dependencyName.match(/[!*]?(.*)/)[1];

        if(dependencyName !== symbols.errorSymbol && !(taskName in tasks) && !(taskName in results)){
            throw cleanError(this.stack, 'No task or result has been defined for dependency: ' + taskName);
        }
    }

    for(var key in tasks){
        todo[key] = tasks[key];
        kgo._taskCount ++;

        tasks[key].args.map(checkDependencyIsDefined, tasks[key]);
    }

    run(todo, results, errors, kgo);
}

module.exports = cloneAndRun;