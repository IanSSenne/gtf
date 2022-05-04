// command.js
import { BlockLocation as U, world as b } from "mojang-minecraft";
import { Vector as v, Location as I } from "mojang-minecraft";
var O = /^([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?)/;
function y(t) {
  let e = t.startsWith("^") ? "local" : t.startsWith("~") ? "relative" : "absolute", s = t.substring(e === "absolute" ? 0 : 1);
  return { type: e, value: parseFloat(s || "0") };
}
function V(t) {
  for (; t < 0; )
    t += Math.PI * 2;
  for (; t > Math.PI * 2; )
    t -= Math.PI * 2;
  return t;
}
function H(t, e) {
  return new v(t.y * e.z - t.z * e.y, t.z * e.x - t.x * e.z, t.x * e.y - t.y * e.x);
}
var p = Math.PI / 2;
function F(t, e, s, r) {
  let n = r.viewVector, o = Math.atan2(Math.sqrt(n.x * n.x + n.z * n.z), n.y) - p, u = Math.atan2(n.z, n.x);
  u = V(u - p);
  let i = Math.cos(u + p), c = Math.sin(u + p), l = Math.cos(-o + p), f = Math.sin(-o + p), L = Math.cos(-o), W = Math.sin(-o), m = new v(i * L, W, c * L), x = new v(i * l, f, c * l), d = H(m, x);
  d.x *= -1, d.y *= -1, d.z *= -1;
  let $ = m.x * s + x.x * t + d.x * e, k = m.y * s + x.y * t + d.y * e, C = m.z * s + x.z * t + d.z * e;
  return new I(r.location.x + $, r.location.y + k, r.location.z + C);
}
var w = class extends h {
  matches(e, s) {
    let r = e.match(O);
    if (!r)
      return { success: false, error: "Expected a Position." };
    let [n, o, u, i] = r, c = y(u), l = y(o), f = y(i);
    return c.type === "local" && l.type === "local" && f.type === "local" ? { success: true, value: F(c.value, l.value, f.value, s.sender), raw: n } : c.type === "local" || l.type === "local" || f.type === "local" ? { success: false, error: "Local axis must be used together, they cannot be mixed with local and absolute cordinates." } : { success: true, value: new I(+(c.type === "relative") * s.sender.location.x + c.value, +(l.type === "relative") * s.sender.location.y + l.value, +(f.type === "relative") * s.sender.location.z + f.value), raw: n };
  }
};
var h = class {
  matches(e, s) {
    return { success: false, error: "NOT IMPLEMENTED" };
  }
  setName(e) {
    return this.name = e, this;
  }
};
var _ = class {
  matches(e) {
    return { success: true, value: "", raw: "", push: false };
  }
  setName(e) {
    return this.name = e, this;
  }
};
var E = class extends h {
  constructor(e) {
    super(), this.literal = e;
  }
  matches(e) {
    return e === this.literal || e.startsWith(this.literal + " ") ? { success: true, value: null, raw: this.literal, push: false } : { success: false, error: `Expected '${this.literal}'` };
  }
};
var N = class extends h {
  constructor() {
    super();
  }
  matches(e) {
    return { success: true, value: e, raw: e, push: true };
  }
};
var z = class extends h {
  constructor() {
    super();
  }
  matches(e) {
    try {
      let s = e.match(/^(-*(?:\d+(?:\.\d+)*|(?:\.\d+)))/);
      if (s) {
        let r = parseFloat(s[0]);
        return Number.isNaN(r) && Array.isArray(s) ? { success: false, error: `Expected a number for '${this.name}'` } : { success: true, value: r, raw: s[0], push: true };
      }
      return { success: false, error: `Expected a number for '${this.name}'` };
    } catch {
      return { success: false, error: `Expected a number for '${this.name}'` };
    }
  }
};
var M = class extends h {
  constructor() {
    super();
  }
};
var a = class {
  constructor(e = new _()) {
    this.matcher = e, this.depth = 0, this.actions = [];
  }
  bind(e) {
    return this.actions.push(e), e.setDepth(this.depth + 1, this), e;
  }
  setDepth(e, s = this) {
    this.parent = s, this.depth = e, this.actions.forEach((r) => r.setDepth(e + 1));
  }
  get root() {
    return this?.parent?.root || this;
  }
  __add(e) {
    this.actions.push(e), e.setDepth(this.depth + 1);
  }
  __redirect(e) {
    this.actions.push(...e.actions);
  }
  literal(e) {
    return this.bind(new a(new E(e).setName(e)));
  }
  number(e) {
    return this.bind(new a(new z().setName(e)));
  }
  string(e) {
    return this.bind(new a(new N().setName(e)));
  }
  position(e) {
    return this.bind(new a(new w().setName(e)));
  }
  selector(e) {
    return this.bind(new a(new M().setName(e)));
  }
  argument(e, s) {
    return this.bind(new a(s.setName(e)));
  }
  executes(e) {
    return this.bind(new a()).executable = e, this;
  }
  evaluate(e, s, r = []) {
    if (s.length === 0)
      if (this.executable) {
        try {
          this.executable(e, ...r);
        } catch (o) {
          return { success: true, executionSuccess: false, executionError: o };
        }
        return { success: true, executionSuccess: true };
      } else
        return { success: false, error: "Unexpected end of command" };
    let n = this.matcher.matches(s.trim(), e);
    if (n.success === true) {
      let o = [];
      for (let i of this.actions) {
        let c = i.evaluate(e, s.trim().substring(n.raw.length), n.push === false ? [...r] : [...r, n.value]);
        if (c.success)
          return c;
        o.push(c);
      }
      let u = Math.max(...o.map((i) => i.depth || -1 / 0));
      return o.find((i) => i.depth === u) || { success: false, error: "No results found" };
    } else
      return { success: false, error: n.error, depth: this.depth };
  }
};
var D = new a();
var P = /* @__PURE__ */ new Map();
function J(t, e, s = []) {
  s.forEach((r) => {
    P.set(r, e), D.literal(r).__redirect(t);
  }), D.__add(t), P.set(t.matcher.name, e);
}
function K(t) {
  return new a(new E(t));
}
var T = b.getDimension("overworld");
var g = b.getDimension("nether");
var R = b.getDimension("the end");
function Y(t) {
  let e = new U(Math.floor(t.location.x), Math.floor(t.location.y), Math.floor(t.location.z));
  if (T.getEntitiesAtBlockLocation(e).includes(t))
    return T;
  if (g.getEntitiesAtBlockLocation(e).includes(t))
    return g;
  if (R.getEntitiesAtBlockLocation(e).includes(t))
    return R;
  throw new Error("Unable to locate player dimension");
}
b.events.beforeChat.subscribe((t) => {
  if (t.message.startsWith("-")) {
    let e = t.message.substring(1), s = D.evaluate({ event: t, sender: t.sender, dimension: Y(t.sender) }, e);
    t.cancel = true, s.success === false && (t.sender.runCommand(`tellraw @s {"rawtext":[{"text":"\xA74Command Error: ${s.error}"}]}`), console.warn(s.error));
  }
});
export {
  h as ArgumentMatcher,
  z as NumberArgumentMatcher,
  N as StringArgumentMatcher,
  D as commandRoot,
  P as helpMessages,
  K as literal,
  J as registerCommand
};
