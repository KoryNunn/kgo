kgo
===

Stupidly easy flow control.

## Depricated

While kgo still works fine, I've since moved my efforts over to the much cleaner, faster, better tested, more flexible, and better maintained, [righto](https://github.com/korynunn/righto), to which you can easily and incrementally migrate to if you want.

## Why

flow contol should be seamless, you should be able to say what you want done, and say kgo.

## Usage

``` javascript
kgo(result name, [dependencies], asynchronous function); // -> self
```

where `result name` is an arbitrary string that represents the result of the function,

`dependencies` is an array of strings that map to the result of another function,

and `asynchronous function` is a function that, when complete, calls a callback with it's results.

kgo returns its-self, so it can be chained:

``` javascript
kgo
(name, deps, fn)
(name, deps, fn)
(name, deps, fn);
```

## Example

require kgo:

``` javascript
var kgo = require('./kgo');
```

use kgo:

``` javascript
kgo
('things', function(done){

    //Something async
    setTimeout(function(){
        done(null, 1);
    }, 100);

})
('stuff', function(done){

    //Something async
    setTimeout(function(){
        done(null, 2);
    }, 100);

})
('whatsits', ['things', 'stuff'], function(things, stuff, done){

    //Something async
    setTimeout(function(){
        done(null, things + stuff);
    }, 100);

})
('dooby', ['things'], function(things, done){

    //Something async
    setTimeout(function(){
        done(null, things/2);
    }, 100);

})
(['whatsits', 'dooby'], function(whatsits, dooby, done){

    //Done
    console.log(whatsits, dooby);

});
```

The above will log 3, 0.5;

## Async Mapping

Removed as of version 2. Use [foreign](https://www.npmjs.com/package/foreign) instead.

## Ignoring dependency results

You will often not need the result of a dependency, and it's annoying to have unused parameters in your functions.
You can specify that you have a dependency, whos result you don't want, by prefixing the dependency name with an exclamation mark:

``` javascript
kgo

('a', function(done){
    done(null, 'foo');
})

('b', ['!a'], function(done){
    done(null, 'bar');
})

(['b'],  function(b){
    // here b will be "bar"
});
```

#### Note: Anonymous tasks will not be passed a `done` function:

```
kgo
('foo', getFoo) // getFoo will be passed (callback)
('bar', ['foo'], getFoo) // getFoo will be passed (bar, callback)
(['*', 'bar'], function(error, bar){
    // arguments.length will be 2
})
```

## Defaults

You can define default data for use in later tasks by passing an object into kgo, where the keys in the objects will map to dependency names:

``` javascript
kgo

({
    foo: 1
})

('bar', function(done){
    done(null, 2);
})

('baz', ['foo', 'bar'], function(foo, bar, done){

});
```

This is especially useful when you want to use named functions that need additional parameters to run:

``` javascript
var fs = require('fs');

kgo
({
    'sourcePath': '/foo/bar'
})
('files', ['sourcePath'], fs.readdir);
```

### Note: You may only define defaults once in a kgo block. Extra calls will result in an error.

## Multiple results

You can return more than one result in a single task by giving your task multiple names, and returning more results in the callback

``` javascript
kgo

('foo', 'bar', function(done){
    done(null, 2, 4);
})

('baz', ['foo', 'bar'], function(foo, bar, done){
    // foo === 2
    // bar === 4
});
```

## kgo.sync

Sometimes you want to just run a synchonous function as a step in kgo, to do this you can use `kgo.sync`, which will return a callback-passing-style version.

``` javascript

kgo
('task1', task1);
('task2', ['task1'], kgo.sync(function(x){ return x + 1 }))
('task3', ['task2'], task3);

```

## Errors

You can handler errors from specific tasknames by prefixing the taskname with an astrix (*)

any task that has a dependency on any error task will resolve if any error dependency is resolved.

``` javascript
kgo
('task1', task1)
('task2', task2)
(['*task1'], function(tast1error){
    // Called if task1 errored
})
(['*task2'], function(tast2error){
    // Called if task2 errored
})
(['task1', 'task2'], function(result1, result2){
    // Called if task1 and task2 succeded.
});
```

there is an implicit error task, `*`, that will resolve to the first of any error that occurs.

``` javascript
kgo
(task)
(another task)
(['*'], function(error){
    // Called if any error occurs in any task
});
```

You can combine this with other dependencies to build a callback task:

``` javascript
function doThings(callback){

    kgo
    ('task1', ...)
    ('task2', ...)
    ('result', ['task1', 'task2'], ...)
    (['*', 'result'], callback); // Will be called either if any task errors, OR if result resolves.

}
```
