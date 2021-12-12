# simplegrad

This library implements efficient automatic differentiation of scalar valued functions.
It is lightweight and fast.

Similar to existing educational libraries like [micrograd](https://github.com/karpathy/micrograd),
this library operate on computational graphs. Unlike existing educational libraries,
this library compiles computational graphs into efficient javascript code at runtime,
which results in extremely fast forward/backward passes, making this library quite
useful for quick prototyping and even real world applications.

## How to use it?

First, you need to install it from [npm](https://www.npmjs.com/package/simplegrad).

```
npm install --save simplegrad
```

Now let's create a simple function `f(a, b) = (a + b) * a`, and compute its value
at point `a = 2, b = 3`:

``` js
import {Variable, ValueStorage} from 'simplegrad';

// First, let's construct computational graph of our f(a, b) function:
let valueStorage = new ValueStorage();

let a = new Variable(vs);
let b = new Variable(vs);
let f = a.add(b).mul(a);

// The graph is ready, let's produce efficient code for
// function computation:
f.compile();

// At this point we are ready to compute f(2, 3), but how do we
// assign concrete values to variables? Use `setValue()` method:
a.setValue(2);
b.setValue(3);

// The values are set, let's propagate them forward in the computational graph:
f.forward();

// If we want to know the value of f(2, 3), we can call `getValue()`:
// Note: performance of `getValue()` is O(1), as all values are already computed
// in `f.forward()` call.
assert(f.getValue() === (2 + 3) * 2);

// To learn value of the `df_da` and `df_db` at point (2, 3)
// let's propagate gradient backward.
// First, we need to tell what the value df_df is, as it could be
// coming from external source. Most of the time however it should be just `1`:
f.setGradient(1);

// Propagate gradient backward:
f.backward();

// Remember our f(a, b) = (a + b) * a, so df_da = 2 * a + b, df_db = a:
assert(a.getGradient() === 2 * a.getValue() + b.getValue());
assert(b.getGradient() === a.getValue());
```

### Under the hood

If you open the hood of this library you'll notice a beautiful engine.
Each `Variable` instance upon creation reserves a slot in the `ValueStorage`.
`ValueStorage` is a simple object that stores values of variables in typed array:

```
// somewhere inside ValueStorage
// `v` variable stores values of all variables for the forward pass:
v = new Float64Array(variablesCount);
// `gv` variable stores gradient values for the backward pass:
gv = new Float64Array(variablesCount);
```

When you call `compile()`, the computational graph is traversed in topological
order only once. The [topological traversal implementation](lib/getTopologicalOrder.js) 
is non-recursive, which allows to traverse huge graphs without `Maximum call stack size exceeded` error.

Once traversal is done, each variable has an opportunity to produce code for
forward/backward passes, and `ValueStorage` creates and returns dynamic functions
that can be reused for different values without re-compilation, graph traversal, or 
memory allocations.

For example, function `f(a, b) = (a + b) * a` will be compiled by `f.compile()` call, which
in turn will ask `ValueStorage` to produce `f.forward()` and `f.backward()` functions:

``` js
// This code is dynamically compiled by `ValueStorage`:
var v = new Float64Array(4);
var gv = new Float64Array(4);

function forward() {
  v[2] = v[0] + v[1];
  v[3] = v[2] * v[0];
}

function backward() {
  gv[2] += v[0] * gv[3]; gv[0] += v[2] * gv[3]
  gv[0] += gv[2]; gv[1] += gv[2]
}

return {
  forward: forward,
  backward: backward,
  v: v,
  gv: gv
}
```

As you can see the produced code is extremely efficient, each variable is
computed only once, no new objects are allocated, and the code can be optimized
by javascript engines.

Each operation that can be performed on `Variable` instance is implemented in
[Variable.js](lib/Variable.js) file. You can easily extend it with your own custom
functions.

## Feedback

Please [let me](https://twitter.com/anvaka) know how it goes. 
You can also sponsor my projects [here](https://github.com/sponsors/anvaka) - your funds will
be dedicated to more libraries and data visualizations.

## License
MIT License