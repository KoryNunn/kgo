var ignoreDependency = /^\!.+/,
    errorDependency = /^\*/,
    errorSymbol = '*';

function Step(task, args, done){
    this._task = task;
    this._args = args;
    this._done = done;
}
Step.prototype.run = function(){
    var step = this;

    this._task.fn.apply(this, this._args.concat([function(error){
        var result = Array.prototype.slice.call(arguments, 1);
        step.done(error, result);
    }]));
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
        passError,
        error = errors[errorSymbol],
        numDeps = 0,
        metDeps = 0,
        allDepsMet;

    if(dependants){
        var useError,
            hasError;

        for(var i = 0; i < dependants.length; i++) {
            var dependantName = dependants[i],
                isErrorDep = dependantName.match(errorDependency),
                ignore = dependantName.match(ignoreDependency);

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
                isErrorDep = dependantName.match(errorDependency),
                ignore = dependantName.match(ignoreDependency);

            if(isErrorDep){
                args.push(errors[dependantName]);
                continue;
            }

            if(hasError){
                args.push(undefined);
                continue;
            }

            if(ignore){
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
                if(taskError && !errors[errorSymbol]){
                    errors[errorSymbol] = taskError;
                }

                for(var i = 0; i < names.length; i++){
                    if(taskError){
                        errors[errorSymbol + names[i]] = taskError;
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

        if(dependencyName !== errorSymbol && !(taskName in tasks) && !(taskName in results)){
            throw new Error('No task or result has been defined for dependency: ' + taskName);
        }
    }

    for(var key in tasks){
        todo[key] = tasks[key];
        kgo._taskCount ++;

        tasks[key].args.map(checkDependencyIsDefined);
    }

    run(todo, results, errors, kgo);
}

module.exports = cloneAndRun;