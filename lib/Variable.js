import { BaseVariable } from './BaseVariable.js';

export class Variable extends BaseVariable {
  constructor(vs, children, uiName) {
    super(vs, children);
    this.uiName = uiName;
  }

  get value() {
    return this.vs.v[this.id];
  }

  set value(x) {
    this.vs.v[this.id] = x;
  }

  get gradient() {
    return this.vs.gv[this.id];
  }

  set gradient(x) {
    this.vs.gv[this.id] = x;
  }

  setValue(value) {
    if (!this.vs.isCompiled()) throw new Error('Variable not compiled');
    this.vs.v[this.id] = value;
  }

  getValue() {
    if (!this.vs.isCompiled()) throw new Error('Variable not compiled');
    return this.vs.v[this.id];
  }

  setGradient(value) {
    if (!this.vs.isCompiled()) throw new Error('Variable not compiled');
    return this.vs.gv[this.id] = value;
  }

  getGradient() {
    if (!this.vs.isCompiled) throw new Error('Variable not compiled');
    return this.vs.gv[this.id];
  }

  gradientStep(learningRate) {
    // todo: need clamping?
    this.vs.v[this.id] -= learningRate * this.vs.gv[this.id];
  }
  
  // These are mathematical functions, add yours.
  add(other) {
    if (other instanceof BaseVariable) {
      let result = new Variable(this.vs, new Set([this, other]), '+');
      result.setForwardCode(`${result.name} = ${this.name} + ${other.name};`);
      result.setBackwardCode(
        `${this.gradName} += ${result.gradName}; ${other.gradName} += ${result.gradName}`
      )
      return result;
    }
    if (Number.isNaN(other)) {
      throw new Error('Cannot add NaN');
    }

    let safeValue = Number.parseFloat(other);
    let result = new Variable(this.vs, new Set([this]), `+ ${safeValue}`);

    result.setForwardCode(`${result.name} = ${this.name} + ${safeValue};`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName};`)
    return result;
  }

  sub(other) {
    if (other instanceof BaseVariable) {
      let result = new Variable(this.vs, new Set([this, other]), '-');
      result.setForwardCode(`${result.name} = ${this.name} - ${other.name};`);
      result.setBackwardCode(
        `${this.gradName} += ${result.gradName}; ${other.gradName} -= ${result.gradName}`
      )
      return result;
    }
    if (Number.isNaN(other)) {
      throw new Error('Cannot sub NaN');
    }

    let safeValue = Number.parseFloat(other);
    let result = new Variable(this.vs, new Set([this]), `- ${safeValue}`);

    result.setForwardCode(`${result.name} = ${this.name} - ${safeValue};`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName};`)
    return result;
  }

  mul(other) {
    if (other instanceof BaseVariable) {
      let result = new Variable(this.vs, new Set([this, other]), '*');
      result.setForwardCode(`${result.name} = ${this.name} * ${other.name};`);
      result.setBackwardCode(
        `${this.gradName} += ${other.name} * ${result.gradName}; ${other.gradName} += ${this.name} * ${result.gradName}`
      )
      return result;
    } 
    if (Number.isNaN(other)) {
      throw new Error('Cannot multiply by NaN');
    }

    let safeValue = Number.parseFloat(other);
    let result = new Variable(this.vs, new Set([this]), '* ' + safeValue);

    result.setForwardCode(`${result.name} = ${this.name} * ${safeValue};`);
    result.setBackwardCode(`${this.gradName} += ${safeValue} * ${result.gradName};`)
    return result;
  }

  div(other) {
    if (other instanceof BaseVariable) {
      let result = new Variable(this.vs, new Set([this, other]), '/');
      result.setForwardCode(`${result.name} = ${this.name} / ${other.name};`);
      result.setBackwardCode(
        `${this.gradName} += ${result.gradName} / ${other.name}; ` +
        `${other.gradName} -= ${this.name} * ${result.gradName} / (${other.name} * ${other.name});`
      );
      return result;
    }
    if (Number.isNaN(other)) {
      throw new Error('Cannot divide by NaN');
    }
    let safeValue = Number.parseFloat(other);
    let result = new Variable(this.vs, new Set([this]), '/ ' + safeValue);

    result.setForwardCode(`${result.name} = ${this.name} / ${safeValue};`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} / ${safeValue};`);
    return result;
  }

  pow(degree) {
     if (degree instanceof BaseVariable) {
      let result = new Variable(this.vs, new Set([this, degree]), '^');
      result.setForwardCode(`${result.name} = Math.pow(${this.name}, ${degree.name});`);
      // https://www.wolframalpha.com/input/?i=partial+derivative+of+a+%5Eb
      result.setBackwardCode(
        `${this.gradName} += ${degree.name} * Math.pow(${this.name}, ${degree.name} - 1) * ${result.gradName}; ` + 
        `${degree.gradName} += ${result.name} * Math.log(${this.name}) * ${result.gradName};`
      )
      return result;
    }
    if (Number.isNaN(degree)) {
      throw new Error('Cannot pow NaN');
    }

    let safeValue = Number.parseFloat(degree);
    let result = new Variable(this.vs, new Set([this]), '^ ' + safeValue);

    result.setForwardCode(`${result.name} = Math.pow(${this.name}, ${safeValue});`);
    result.setBackwardCode(`${this.gradName} += ${safeValue} * Math.pow(${this.name}, ${safeValue} - 1) * ${result.gradName};`);
    return result;
  }

  sin() {
    let result = new Variable(this.vs, new Set([this]), 'sin()');
    result.setForwardCode(`${result.name} = Math.sin(${this.name});`);
    result.setBackwardCode(`${this.gradName} += Math.cos(${this.name}) * ${result.gradName};`);
    return result;
  }

  cos() {
    let result = new Variable(this.vs, new Set([this]), 'cos()');
    result.setForwardCode(`${result.name} = Math.cos(${this.name});`);
    result.setBackwardCode(`${this.gradName} -= Math.sin(${this.name}) * ${result.gradName};`);
    return result;
  }

  abs() {
    let result = new Variable(this.vs, new Set([this]), 'abs()');
    result.setForwardCode(`${result.name} = Math.abs(${this.name});`);
    result.setBackwardCode(`${this.gradName} += Math.sign(${this.name}) * ${result.gradName};`);
    return result;
  }

  exp() {
    let result = new Variable(this.vs, new Set([this]), 'exp()');
    result.setForwardCode(`${result.name} = Math.exp(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.name} * ${result.gradName};`);
    return result;
  }

  log() {
    let result = new Variable(this.vs, new Set([this]), 'log()');
    result.setForwardCode(`${result.name} = Math.log(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} / ${this.name};`);
    return result;
  }

  ReLU() {
    let result = new Variable(this.vs, new Set([this]), 'ReLU()');
    result.setForwardCode(`${result.name} = Math.max(0, ${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * (${this.name} > 0);`);
    return result;
  }

  ELU() {
    let result = new Variable(this.vs, new Set([this]), 'ELU()');
    result.setForwardCode(`${result.name} = ${this.name} > 0 ? ${this.name} : (Math.exp(${this.name}) - 1);`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * (${this.name} > 0 ? 1 : Math.exp(${this.name}));`);
    return result;
  }

  sign() {
    let result = new Variable(this.vs, new Set([this]), 'sign()');
    result.setForwardCode(`${result.name} = Math.sign(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * ${result.name};`);
    return result;
  }

  ParametricReLU(min = 0, scale = 1, shift = 0) {
    let safeMin = Number.parseFloat(min);
    let safeScale = Number.parseFloat(scale);
    let safeShift = Number.parseFloat(shift);

    let result = new Variable(this.vs, new Set([this]), 'ParametricReLU()');
    result.setForwardCode(`${result.name} = Math.max(${safeMin}, ${safeScale} * ${this.name} + ${safeShift});`);
    result.setBackwardCode(
      `${this.gradName} += ${result.gradName} * (${this.name} > ${safeMin} ? ${safeScale} : 0);`
    );
    return result;
  }

  atan() {
    let result = new Variable(this.vs, new Set([this]), 'atan()');
    result.setForwardCode(`${result.name} = Math.atan(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} / (1 + ${this.name} * ${this.name}) ;`);
    return result;
  }

  acos() {
    let result = new Variable(this.vs, new Set([this]), 'acos()');
    result.setForwardCode(`${result.name} = Math.acos(${this.name});`);
    result.setBackwardCode(`${this.gradName} += - ${result.gradName} / (Math.sqrt(1 - ${this.name} * ${this.name})) ;`);
    return result;
  }

  sigmoid() {
    let result = new Variable(this.vs, new Set([this]), 'sigmoid()');
    result.setForwardCode(`${result.name} = 1 / (1 + Math.exp(-${this.name}));`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * ${result.name} * (1 - ${result.name});`);
    return result;
  }

  tanh() {
    let result = new Variable(this.vs, new Set([this]), 'tanh()');
    result.setForwardCode(`${result.name} = Math.tanh(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * (1 - ${result.name} * ${result.name});`);
    return result;
  }

  cosh() {
    let result = new Variable(this.vs, new Set([this]), 'chos()');
    result.setForwardCode(`${result.name} = Math.cosh(${this.name});`);
    result.setBackwardCode(`${this.gradName} += ${result.gradName} * Math.sinh(${this.name});`);
    return result;
  }
}