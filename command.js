// internal/command.js
import { BlockLocation, world } from "mojang-minecraft";

// internal/ArgumentMatcher.js
var ArgumentMatcher = class {
  matches(_value, _context) {
    return {
      success: false,
      error: "NOT IMPLEMENTED"
    };
  }
  setName(name) {
    this.name = name;
    return this;
  }
};

// internal/arguments/PositionArgument.js
import { Vector, Location } from "mojang-minecraft";
var regExp = /^([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?)/;
function getAxis(value) {
  let type = value.startsWith("^") ? "local" : value.startsWith("~") ? "relative" : "absolute";
  let numericValue = value.substring(type === "absolute" ? 0 : 1);
  return {
    type,
    value: parseFloat(numericValue || "0")
  };
}
function normalizeRotation(rot) {
  while (rot < 0)
    rot += Math.PI * 2;
  while (rot > Math.PI * 2)
    rot -= Math.PI * 2;
  return rot;
}
function cross(a, b) {
  return new Vector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
var NINETY_DEGREES = Math.PI / 2;
function computeLocalOffset(x, y, z, player) {
  const vv = player.viewVector;
  let rotX = Math.atan2(Math.sqrt(vv.x * vv.x + vv.z * vv.z), vv.y) - NINETY_DEGREES;
  let rotY = Math.atan2(vv.z, vv.x);
  rotY = normalizeRotation(rotY - NINETY_DEGREES);
  const up_cos = Math.cos(rotY + NINETY_DEGREES);
  const up_sin = Math.sin(rotY + NINETY_DEGREES);
  const left_cos = Math.cos(-rotX + NINETY_DEGREES);
  const left_sin = Math.sin(-rotX + NINETY_DEGREES);
  const forwords_cos = Math.cos(-rotX);
  const forwords_sin = Math.sin(-rotX);
  const vec3a = new Vector(up_cos * forwords_cos, forwords_sin, up_sin * forwords_cos);
  const vec3b = new Vector(up_cos * left_cos, left_sin, up_sin * left_cos);
  const vec3c = cross(vec3a, vec3b);
  vec3c.x *= -1;
  vec3c.y *= -1;
  vec3c.z *= -1;
  const x_offset = vec3a.x * z + vec3b.x * x + vec3c.x * y;
  const y_offset = vec3a.y * z + vec3b.y * x + vec3c.y * y;
  const z_offset = vec3a.z * z + vec3b.z * x + vec3c.z * y;
  return new Location(player.location.x + x_offset, player.location.y + y_offset, player.location.z + z_offset);
}
var PositionArgumentMatcher = class extends ArgumentMatcher {
  matches(_value, context) {
    const matches = _value.match(regExp);
    if (!matches) {
      return {
        success: false,
        error: "Expected a Position."
      };
    }
    let [raw, x, y, z] = matches;
    const _x = getAxis(y);
    const _y = getAxis(x);
    const _z = getAxis(z);
    if (_x.type === "local" && _y.type === "local" && _z.type === "local") {
      return {
        success: true,
        value: computeLocalOffset(_x.value, _y.value, _z.value, context.sender),
        raw
      };
    } else {
      if (_x.type === "local" || _y.type === "local" || _z.type === "local") {
        return {
          success: false,
          error: "Local axis must be used together, they cannot be mixed with local and absolute cordinates."
        };
      }
      return {
        success: true,
        value: new Location(+(_x.type === "relative") * context.sender.location.x + _x.value, +(_y.type === "relative") * context.sender.location.y + _y.value, +(_z.type === "relative") * context.sender.location.z + _z.value),
        raw
      };
    }
  }
};

// internal/command.js
var RootArgumentMatcher = class {
  matches(_value) {
    return {
      success: true,
      value: "",
      raw: "",
      push: false
    };
  }
  setName(name) {
    this.name = name;
    return this;
  }
};
var LiteralArgumentMatcher = class extends ArgumentMatcher {
  constructor(literal2) {
    super();
    this.literal = literal2;
  }
  matches(value) {
    return value === this.literal || value.startsWith(this.literal + " ") ? {
      success: true,
      value: null,
      raw: this.literal,
      push: false
    } : {
      success: false,
      error: `Expected '${this.literal}'`
    };
  }
};
var StringArgumentMatcher = class extends ArgumentMatcher {
  constructor() {
    super();
  }
  matches(value) {
    return {
      success: true,
      value,
      raw: value,
      push: true
    };
  }
};
var NumberArgumentMatcher = class extends ArgumentMatcher {
  constructor() {
    super();
  }
  matches(value) {
    try {
      const match = value.match(/^(-*(?:\d+(?:\.\d+)*|(?:\.\d+)))/);
      if (match) {
        const value2 = parseFloat(match[0]);
        if (Number.isNaN(value2) && Array.isArray(match)) {
          return {
            success: false,
            error: `Expected a number for '${this.name}'`
          };
        } else {
          return {
            success: true,
            value: value2,
            raw: match[0],
            push: true
          };
        }
      }
      return {
        success: false,
        error: `Expected a number for '${this.name}'`
      };
    } catch (e) {
      return {
        success: false,
        error: `Expected a number for '${this.name}'`
      };
    }
  }
};
var SelectorArgumentMatcher = class extends ArgumentMatcher {
  constructor() {
    super();
  }
};
var ArgumentBuilder = class {
  constructor(matcher = new RootArgumentMatcher()) {
    this.matcher = matcher;
    this.depth = 0;
    this.actions = [];
  }
  bind(ab) {
    this.actions.push(ab);
    ab.setDepth(this.depth + 1, this);
    return ab;
  }
  setDepth(depth, parent = this) {
    this.parent = parent;
    this.depth = depth;
    this.actions.forEach((a) => a.setDepth(depth + 1));
  }
  get root() {
    return this?.parent?.root || this;
  }
  __add(target) {
    this.actions.push(target);
    target.setDepth(this.depth + 1);
  }
  __redirect(target) {
    this.actions.push(...target.actions);
  }
  literal(value) {
    return this.bind(new ArgumentBuilder(new LiteralArgumentMatcher(value).setName(value)));
  }
  number(name) {
    return this.bind(new ArgumentBuilder(new NumberArgumentMatcher().setName(name)));
  }
  string(name) {
    return this.bind(new ArgumentBuilder(new StringArgumentMatcher().setName(name)));
  }
  position(name) {
    return this.bind(new ArgumentBuilder(new PositionArgumentMatcher().setName(name)));
  }
  selector(name) {
    return this.bind(new ArgumentBuilder(new SelectorArgumentMatcher().setName(name)));
  }
  argument(name, matcher) {
    return this.bind(new ArgumentBuilder(matcher.setName(name)));
  }
  executes(callback) {
    this.bind(new ArgumentBuilder()).executable = callback;
    return this;
  }
  evaluate(ctx, command, args = []) {
    if (command.length === 0) {
      if (this.executable) {
        try {
          this.executable(ctx, ...args);
        } catch (e) {
          return {
            success: true,
            executionSuccess: false,
            executionError: e
          };
        }
        return { success: true, executionSuccess: true };
      } else {
        return {
          success: false,
          error: "Unexpected end of command"
        };
      }
    }
    let result = this.matcher.matches(command.trim(), ctx);
    if (result.success === true) {
      let results = [];
      for (const action of this.actions) {
        const result2 = action.evaluate(ctx, command.trim().substring(result.raw.length), result.push === false ? [...args] : [...args, result.value]);
        if (result2.success)
          return result2;
        results.push(result2);
      }
      const min = Math.max(...results.map((r) => r.depth || -Infinity));
      return results.find((r) => r.depth === min) || {
        success: false,
        error: "No results found"
      };
    } else {
      return {
        success: false,
        error: result.error,
        depth: this.depth
      };
    }
  }
};
var commandRoot = new ArgumentBuilder();
var helpMessages = /* @__PURE__ */ new Map();
function registerCommand(command, help, alias = []) {
  alias.forEach((a) => {
    helpMessages.set(a, help);
    commandRoot.literal(a).__redirect(command);
  });
  commandRoot.__add(command);
  helpMessages.set(command.matcher.name, help);
}
function literal(value) {
  return new ArgumentBuilder(new LiteralArgumentMatcher(value));
}
var OVERWORLD = world.getDimension("overworld");
var THE_NETHER = world.getDimension("nether");
var THE_END = world.getDimension("the end");
function getDimension(player) {
  const bl = new BlockLocation(Math.floor(player.location.x), Math.floor(player.location.y), Math.floor(player.location.z));
  if (OVERWORLD.getEntitiesAtBlockLocation(bl).includes(player))
    return OVERWORLD;
  if (THE_NETHER.getEntitiesAtBlockLocation(bl).includes(player))
    return THE_NETHER;
  if (THE_END.getEntitiesAtBlockLocation(bl).includes(player))
    return THE_END;
  throw new Error("Unable to locate player dimension");
}
world.events.beforeChat.subscribe((event) => {
  if (event.message.startsWith("-")) {
    const command = event.message.substring(1);
    const result = commandRoot.evaluate({
      event,
      sender: event.sender,
      dimension: getDimension(event.sender)
    }, command);
    event.cancel = true;
    if (result.success === false) {
      event.sender.runCommand(`tellraw @s {"rawtext":[{"text":"\xA74Command Error: ${result.error}"}]}`);
      console.warn(result.error);
    }
  }
});
export {
  NumberArgumentMatcher,
  StringArgumentMatcher,
  commandRoot,
  helpMessages,
  literal,
  registerCommand
};
