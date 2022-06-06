import {
  ArgumentMatcher,
  ArgumentResult,
  CommandContext,
} from "../ArgumentMatcher";
import { Vector, Location, Player } from "mojang-minecraft";
const regExp =
  /^([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?) ([~^]-?\d*(?:\.\d*)?|-?\d+(?:\.\d*)?)/;
type axisDefn = {
  type: "absolute" | "local" | "relative";
  value: number;
};
function getAxis(value: string): axisDefn {
  let type: "absolute" | "local" | "relative" = value.startsWith("^")
    ? "local"
    : value.startsWith("~")
    ? "relative"
    : "absolute";
  let numericValue = value.substring(type === "absolute" ? 0 : 1);
  return {
    type,
    value: parseFloat(numericValue || "0"),
  };
}
function normalizeRotation(rot: number) {
  while (rot < 0) rot += Math.PI * 2;
  while (rot > Math.PI * 2) rot -= Math.PI * 2;
  return rot;
}
function cross(a: Vector, b: Vector) {
  return new Vector(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}
const NINETY_DEGREES = Math.PI / 2;
// this function is based on the local coordinate implimentation from minecraft: java edition.
function computeLocalOffset(
  x: number,
  y: number,
  z: number,
  player: Player
): Location {
  const vv = player.viewVector;

  let rotX =
    Math.atan2(Math.sqrt(vv.x * vv.x + vv.z * vv.z), vv.y) - NINETY_DEGREES;
  let rotY = Math.atan2(vv.z, vv.x);
  rotY = normalizeRotation(rotY - NINETY_DEGREES);

  // compute up
  const up_cos = Math.cos(rotY + NINETY_DEGREES);
  const up_sin = Math.sin(rotY + NINETY_DEGREES);

  // compute left
  const left_cos = Math.cos(-rotX + NINETY_DEGREES);
  const left_sin = Math.sin(-rotX + NINETY_DEGREES);

  // compute forwords
  const forwords_cos = Math.cos(-rotX);
  const forwords_sin = Math.sin(-rotX);

  // forwords vector
  const vec3a = new Vector(
    up_cos * forwords_cos,
    forwords_sin,
    up_sin * forwords_cos
  );

  // left vector
  const vec3b = new Vector(up_cos * left_cos, left_sin, up_sin * left_cos);

  // compute down vector
  const vec3c = cross(vec3a, vec3b);

  // up
  vec3c.x *= -1;
  vec3c.y *= -1;
  vec3c.z *= -1;

  // compute locations
  const x_offset = vec3a.x * z + vec3b.x * x + vec3c.x * y;
  const y_offset = vec3a.y * z + vec3b.y * x + vec3c.y * y;
  const z_offset = vec3a.z * z + vec3b.z * x + vec3c.z * y;

  // final location
  return new Location(
    player.location.x + x_offset,
    player.location.y + y_offset,
    player.location.z + z_offset
  );
}
export class PositionArgumentMatcher extends ArgumentMatcher {
  matches(_value: string, context: CommandContext): ArgumentResult<Location> {
    const matches = _value.match(regExp);
    if (!matches) {
      return {
        success: false,
        error: "Expected a Position.",
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
        raw,
      };
    } else {
      if (_x.type === "local" || _y.type === "local" || _z.type === "local") {
        return {
          success: false,
          error:
            "Local axis must be used together, they cannot be mixed with local and absolute cordinates.",
        };
      }
      return {
        success: true,
        value: new Location(
          +(_x.type === "relative") * context.sender.location.x + _x.value,
          +(_y.type === "relative") * context.sender.location.y + _y.value,
          +(_z.type === "relative") * context.sender.location.z + _z.value
        ),
        raw,
      };
    }
  }
}
