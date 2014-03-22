function Step(task, args, done){
    this._task = task;
    this._args = args;
    this._done = done;
}
Step.prototype._count = 1;
Step.prototype._runs = 0;
Step.prototype.run = function(){
    var step = this,
        results = [],
        didError;

    this._task.fn.apply(this, this._args.concat([function(error, result){
        results.push(result);
        step._runs++;
        if(error){
            didError = true;
            step.done(error);
        }else if(!didError && step._runs === step._count){
            step.done(null, results);
        }
    }]));
};
Step.prototype.count = function(number){
    this._parallel = true;
    this._count = number;
};
Step.prototype.done = function(error, results){
    if(error){
        return this._done(error);
    }
    this._done(null, this._parallel ? results : results[0]);
};

function runTask(task, results, aboutToRun, done){
    var name = task.name,
        dependants = task.args,
        taskFunction = task.fn,
        args = [];

    if(dependants){
        for(var i = 0; i < dependants.length; i++) {
            if(!(dependants[i] in results)){
                return;
            }

            args.push(results[dependants[i]]);
        }
    }

    var step = new Step(task, args, function(error, result){
        done(name, error, result);
    });

    aboutToRun(name);
    step.run();
}

function run(tasks, results, emitter){
    var currentTask;

    for(var key in tasks){
        currentTask = tasks[key];

        runTask(
            currentTask,
            results,
            function(name){
                delete tasks[name];
            },
            function(name, error, result){
                if(error){
                    emitter.emit('error', error, name);
                    return;
                }

                results[name] = result;
                run(tasks, results, emitter);
            }
        );
    }
}

function cloneAndRun(tasks, results, emitter){
    var todo = {};

    for(var key in tasks){
        todo[key] = tasks[key];
    }

    run(todo, results, emitter);
}

module.exports = cloneAndRun;