import {getDot} from './getDot.js';

const emptySet = new Set();

/**
 * Base variable allocates space in the ValueStorage instance.
 */
export class BaseVariable {
  constructor(vs, children) {
    this.vs = vs;
    this.children = children || emptySet;
    this.parentCount = 0; // we use this for non-recursive topological sort
    this.forwardCode = null;
    this.backwardCode = null;

    this.id = vs.allocateSpace();
    this.name = vs.getVariableNameForId(this.id);
    this.gradName = vs.getGradientNameForId(this.id);
  }

  forward() {
    this.vs.forward();
  }

  backward() {
    this.vs.backward();
  }

  compile() {
    if (this.vs.isCompiled()) return;
    this.vs.compile(this);
  }

  setBackwardCode(code) {
    this.backwardCode = code;
  }

  setForwardCode(code) {
    this.forwardCode = code;
  }

  getDot(options) {
    return getDot(this, options);
  }
}