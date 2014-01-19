function runTask(task, results, done){
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

    taskFunction.apply(null, args);
}

function run(tasks, results, throwError){
    var currentTask;

    for(var key in tasks){
        if(key in results){
            continue;
        }

        currentTask = tasks[key];

        runTask(currentTask, results, function(name, error, result){
            if(error){
                throwError(name, error);
                return;
            }

            results[name] = result;
            run(tasks, results, throwError);
        });
    }
}

module.exports = run;