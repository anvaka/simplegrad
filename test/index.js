import {test} from 'tap';
import {Variable, ReferenceVariable, ValueStorage} from '../index.js'

test('it can multiply stuff', (t) => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let b = new Variable(vs);
  let f = a.add(b).mul(a);

  f.compile();
  a.setValue(2);
  b.setValue(3);

  f.forward();
  t.equal(f.getValue(), 10);

  f.setGradient(1)
  f.backward();

  t.equal(f.getGradient(), 1);
  // out = (a + b) * a;
  // a.grad = 2 * a + b;
  t.equal(a.getGradient(), 2 * a.getValue() + b.getValue());
  // b.grad = a;
  t.equal(b.getGradient(), a.getValue());
  t.end();
});

test('it can subtract variable', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let b = new Variable(vs);
  let out = a.sub(b);
  out.compile();
  a.setValue(2); b.setValue(3);

  out.forward();
  t.equal(out.getValue(), -1);
  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2);
  t.equal(b.getGradient(), -2);
  t.end();
});

test('it can subtract constant', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.sub(3);
  out.compile();
  a.setValue(2);

  out.forward();
  t.equal(out.getValue(), -1);
  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2);
  t.end();
});

test('it can mul constant', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.mul(3);
  out.compile();
  a.setValue(2);
  out.forward();

  t.equal(out.getValue(), 6);
  out.setGradient(2);
  out.backward();

  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * 3);

  t.end();
});

test('it can add constant', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.add(3);
  out.compile();
  a.setValue(2);

  out.forward();
  t.equal(out.getValue(), 5);
  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2);
  t.end();
});

test('it can pow variable', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let b = new Variable(vs);
  let out = a.pow(b);
  out.compile();
  a.setValue(2); b.setValue(3);

  out.forward();
  t.equal(out.getValue(), 2 ** 3);

  let globalGradient = 2;
  out.setGradient(globalGradient);
  out.backward();

  t.equal(out.getGradient(), 2);
  // gradient of (a ^ b) by a is (b * a ^ (b - 1))
  t.equal(a.getGradient(), 3 * (2 ** (3 - 1)) * globalGradient);
  // gradient of (a ^ b) by b is (log(a) * a ^ b)
  t.equal(b.getGradient(), Math.log(2) * (2 ** 3) * globalGradient);
  t.end();
})

test('it can pow constant', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.pow(3);
  out.compile();
  a.setValue(2);
  out.forward();
  t.equal(out.getValue(), 2 ** 3);

  let globalGradient = 2;
  out.setGradient(globalGradient);
  out.backward();

  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 3 * (2 ** (3 - 1)) * globalGradient);
  t.end();
})

test('it can divide by variable', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let b = new Variable(vs);
  let out = a.div(b);
  out.compile();
  a.setValue(2); b.setValue(3);

  out.forward();
  t.equal(out.getValue(), 2 / 3);

  let globalGradient = 2;
  out.setGradient(globalGradient);
  out.backward();

  t.equal(out.getGradient(), 2);
  // gradient of (a / b) by a is (1 / b)
  t.equal(a.getGradient(), 1 / 3 * globalGradient);
  // gradient of (a / b) by b is (-a / b ^ 2)
  t.equal(b.getGradient(), -2 / (3 * 3) * globalGradient);
  t.end();
});

test('it can divide by constant', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.div(3);
  out.compile();
  a.setValue(2);

  out.forward();
  t.equal(out.getValue(), 2 / 3);

  let globalGradient = 2;
  out.setGradient(globalGradient);
  out.backward();

  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 1 / 3 * globalGradient);
  t.end();
});

test('it can get cosine', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.cos();
  out.compile();
  a.setValue(Math.PI / 2);

  out.forward();
  t.equal(out.getValue(), Math.cos(Math.PI / 2));

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), -2 * Math.sin(Math.PI / 2));
  t.end();
})

test('it can get sine', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.sin();
  out.compile();
  a.setValue(Math.PI / 2);

  out.forward();
  t.equal(out.getValue(), Math.sin(Math.PI / 2));

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * Math.cos(Math.PI / 2));
  t.end();
})

test('it can get abs', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.abs();
  out.compile();
  a.setValue(-2);

  out.forward();
  t.equal(out.getValue(), 2);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * Math.sign(-2));
  t.end();
});

test('it can get exp()', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.exp();
  out.compile();
  a.setValue(2);

  out.forward();
  t.equal(out.getValue(), Math.exp(2));

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * Math.exp(2));
  t.end();
});

test('it can get ReLU()', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.ReLU();
  out.compile();
  a.setValue(-2);

  out.forward();
  t.equal(out.getValue(), 0);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 0);
  t.end();
})

test('it can get ELU', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.ELU();
  out.compile();
  a.setValue(-2);

  out.forward();
  t.equal(out.getValue(), Math.exp(-2) - 1);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), Math.exp(-2) * 2);
  t.end();
});

test('it can get sigmoid', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.sigmoid();
  out.compile();
  a.setValue(-2);

  out.forward();

  let expected = 1 / (1 + Math.exp(2)); 
  t.equal(out.getValue(), expected);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * expected * (1 - expected));
  t.end();
});

test('it can get tanh', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let out = a.tanh();
  out.compile();
  a.setValue(-2);

  out.forward();

  let expected = Math.tanh(-2); 
  t.equal(out.getValue(), expected);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 2 * (1 - expected * expected));
  t.end();
});

test('it can reference another variable', t => {
  let vs = new ValueStorage();
  let a = new Variable(vs);
  let b = new Variable(vs);
  let aRef = new ReferenceVariable(vs);

  let out = b.mul(aRef);
  out.compile();
  aRef.setReference(a);
  aRef.setValue(2);
  b.setValue(3);

  t.equal(a.getValue(), 2);

  out.forward();
  t.equal(out.getValue(), 6);

  out.setGradient(2);
  out.backward();
  t.equal(out.getGradient(), 2);
  t.equal(a.getGradient(), 3*2);
  t.equal(b.getGradient(), 2*2);
  t.end();
});

test('it can get dot file', t => {
  let vs = new ValueStorage();

  // use `uiName` to customize variable name in the dot
  let a = new Variable(vs); a.uiName = 'a';
  let b = new Variable(vs); b.uiName = 'b';

  // Create and compile graph:
  let f = a.add(b).mul(a); f.compile();

  // Set initial values
  a.setValue(2); b.setValue(3);

  // Compute forward and backward:
  f.forward();
  f.setGradient(1);
  f.backward();

  // Print the dot file:
  t.same(f.getDot(), `digraph G {
0 [label="*\\n10.00 | 1.00"]
1 [label="+\\n5.00 | 2.00"]
2 [label="a\\n2.00 | 7.00"]
3 [label="b\\n3.00 | 2.00"]
0 -> 1
0 -> 2
1 -> 2
1 -> 3
}`);
  t.end();
})