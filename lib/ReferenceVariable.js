import { BaseVariable } from './BaseVariable.js';

/**
 * Allows to create a dynamic reference to another variable.
 * For example when you compute a log-loss you can reference the
 * positive class probability and propagate gradient to the correct variable
 */
export class ReferenceVariable extends BaseVariable {
  constructor(vs, children) {
    super(vs, children);
    this.uiName = 'Ref(var)'

    // Instead of storying the value in memory, we store the id of the variable
    // to which we point. This changes how the variable is accessed
    this.name = `v[v[${this.id}]]`;
    this.gradName = `gv[v[${this.id}]]`;
  }

  setReference(value) {
    this.vs.v[this.id] = value.id;
  }

  getValue() {
    let v = this.vs.v;
    return v[v[id]];
  }

  setValue(value) {
    let v = this.vs.v;
    v[v[this.id]] = value;
  }
}