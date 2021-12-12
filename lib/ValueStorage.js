import { getTopologicalOrder } from './getTopologicalOrder.js';

/**
 * This class stores values and gradients of variables 
 * as two flat arrays.
 */
export class ValueStorage {
  constructor() {
    this.lastUsed = 0;
    this.lastUsedFunction = 0;
    this.dtype = 'Float64Array'; // TODO: Expose this for custom data types?

    // Variable values used in the forward pass. Initialized in `compile()`
    this.v = null;

    // Variable computed gradients are stored here in backward pass. 
    // Initialized in `compile()`
    this.gv = null;

    // Executes forward pass using currently stored variables in `this.v`
    this.forward = notCompiled;

    // Executes backward pass using currently stored variables in `this.gv`
    this.backward = notCompiled;
  }

  isCompiled() {
    return this.v !== null && this.gv !== null;
  }

  allocateSpace() {
    let name = this.lastUsed;
    this.lastUsed++;
    return name;
  }

  getVariableNameForId(id) {
    return `v[${id}]`;
  }

  getGradientNameForId(id) {
    return `gv[${id}]`;
  }

  compile(startNode) {
    // TODO: Check if compiled and throw?
    let traversalOrder = getTopologicalOrder(startNode);
    let forwardCode = [];
    let backwardCode = [];
    for (let i = traversalOrder.length - 1; i >= 0; i--) {
      // for the forward pass we want to visit all leaves first
      let node = traversalOrder[i];
      if (node.forwardCode) forwardCode.push(node.forwardCode);

      // backward pass is done in reverse order (parents first)
      let backNode = traversalOrder[traversalOrder.length - 1 - i];
      if (backNode.backwardCode) backwardCode.push(backNode.backwardCode);
    }
    // this.forwardCode = forwardCode.join('\n');
    let code = `
var v = new ${this.dtype}(${this.lastUsed});
var gv = new ${this.dtype}(${this.lastUsed});

function forward() {
  ${forwardCode.join('\n  ')}
}

function backward() {
  ${backwardCode.join('\n  ')}
}

return {
  forward: forward,
  backward: backward,
  v: v,
  gv: gv
}
`
    let result = new Function(code)();

    Object.assign(this, result);
    // `Object.assign()` is the same as:
    // 
    // this.v = result.v;
    // this.gv = result.gv;
    // this.forward = result.forward;
    // this.backward = result.backward;

    if (!this.isCompiled()) {
      // Just a sanity check
      throw new Error('Failed to compile');
    }
  }
}

function notCompiled(){
  throw new Error('The graph was not compiled yet. Make sure you call <your_var_name>.compile() before using it.');
};