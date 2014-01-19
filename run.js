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

    args.push(function(error, result){
        done(name, error, result);
    });

    aboutToRun(name);

    taskFunction.apply(null, args);
}

function run(tasks, results, throwError){
    var currentTask;

    for(var key in tasks){
        currentTask = tasks[key];

        runTask(currentTask, results, function(name){
                delete tasks[name];
            },
            function(name, error, result){

                if(error){
                    throwError(name, error);
                    return;
                }

                results[name] = result;
                run(tasks, results, throwError);
            }
        );
    }
}

function cloneAndRun(tasks, results, throwError){
    var todo = {};

    for(var key in tasks){
        todo[key] = tasks[key];
    }

    run(todo, results, throwError);
}

module.exports = cloneAndRun;