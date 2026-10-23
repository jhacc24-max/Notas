// Miniatura 3D — modelos procedurales (three.js r160)
// Cada modelo devuelve un THREE.Group; el render lo normaliza (tamaño 1, apoyado en el piso)
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* ---------- materiales: mate, colores sobrios ---------- */
const mat = (c, r = 0.6, m = 0, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, envMapIntensity: 0.7, ...x });
const ds = { side: THREE.DoubleSide };
export const C = {
  white: mat(0xF4F3EF, .55), off: mat(0xE7E2D7, .6), beige: mat(0xE3CFA4, .62), lgray: mat(0xCFD2D6, .55), gray: mat(0xA2A6AD, .55),
  dgray: mat(0x5A5E65, .55), dark: mat(0x313338, .5), black: mat(0x1F2023, .45),
  glass: mat(0x2D333B, .2, .1), glassL: mat(0xBFD7E6, .08, 0, { transparent: true, opacity: .5 }),
  metal: mat(0xC9CDD3, .3, .8), brass: mat(0xCDA65C, .34, .75), gold: mat(0xE3B84C, .4, .5),
  red: mat(0xD9443C, .5), dred: mat(0xA9332D, .5), orange: mat(0xE88A3C, .55), yellow: mat(0xF2C94E, .55), lyellow: mat(0xF6E3A3, .5),
  green: mat(0x56A963, .55), dgreen: mat(0x3B7D49, .58), leaf: mat(0x7BB358, .6), teal: mat(0x2AA393, .5), blue: mat(0x4A7ED2, .5),
  lblue: mat(0x9CC2EA, .5), navy: mat(0x26385E, .45), purple: mat(0x8B6CD3, .5), pink: mat(0xF0A8B6, .6),
  skin: mat(0xC88B62, .65), wood: mat(0xBC8D5D, .7), dwood: mat(0x7D5A3B, .7), leather: mat(0x8C5A3A, .6), kraft: mat(0xCEA46D, .78),
  paper: mat(0xFBF9F4, .75), bun: mat(0xD99B50, .6), patty: mat(0x6B3F27, .7),
  lit: mat(0xFFE39A, .4, 0, { emissive: 0xFFC94D, emissiveIntensity: .5 }), led: mat(0x5BE38C, .3, 0, { emissive: 0x22C55E, emissiveIntensity: .9 }),
  screen: mat(0x1E2633, .25, .1),
};
const redDS = mat(0xD9443C, .5, 0, ds), whiteDS = mat(0xF4F3EF, .55, 0, ds), orangeDS = mat(0xE88A3C, .55, 0, ds);

/* ---------- primitivas ---------- */
const G = () => new THREE.Group();
const M = (g, m) => new THREE.Mesh(g, m);
function put(parent, mesh, p = [0, 0, 0], r = [0, 0, 0], s) {
  if (!Array.isArray(r)) r = [0, 0, 0];
  mesh.position.set(...p); mesh.rotation.set(...r);
  if (s !== undefined) (typeof s === "number" ? mesh.scale.setScalar(s) : mesh.scale.set(...s));
  parent.add(mesh); return mesh;
}
const rb = (w, h, d, r, m) => M(new RoundedBoxGeometry(w, h, d, 5, Math.max(0.001, Math.min(r, Math.min(w, h, d) / 2 - 1e-4))), m);
const cy = (r, h, m, seg = 48, rt) => M(new THREE.CylinderGeometry(rt ?? r, r, h, seg), m);
const sp = (r, m, w = 48, h = 32) => M(new THREE.SphereGeometry(r, w, h), m);
const to = (R, r, m, arc = Math.PI * 2) => M(new THREE.TorusGeometry(R, r, 24, 72, arc), m);
const cone = (r, h, m, seg = 48) => M(new THREE.ConeGeometry(r, h, seg), m);
const lathe = (pts, m, seg = 72) => M(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), m);
const tube = (pts, r, m, closed = false, tension = 0.5) => M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed, "catmullrom", tension), 96, r, 16, closed), m);
const caps = (r, len, m) => M(new THREE.CapsuleGeometry(r, len, 12, 32), m);
// disco con canto redondeado (eje Y, de 0 a h)
function puck(r, h, b, m) {
  const p = [[0, 0]]; const n = 8;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * Math.PI / 2; p.push([r - b + Math.cos(a) * b, b + Math.sin(a) * b]); }
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; p.push([r - b + Math.cos(a) * b, h - b + Math.sin(a) * b]); }
  p.push([0, h]); return lathe(p, m);
}
function ext(shape, depth, bev, m, curve = 40) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev * .9, bevelSegments: 6, curveSegments: curve });
  g.computeBoundingBox(); const c = g.boundingBox.getCenter(new THREE.Vector3()); g.translate(-c.x, -c.y, -c.z);
  return M(g, m);
}
function extRaw(shape, depth, bev, m, curve = 40) { // sin centrar
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev * .9, bevelSegments: 6, curveSegments: curve });
  g.translate(0, 0, -depth / 2); return M(g, m);
}
// polígono con esquinas redondeadas (r número o lista)
function roundPoly(pts, r) {
  const s = new THREE.Shape(); const n = pts.length;
  for (let i = 0; i < n; i++) {
    const rr = Array.isArray(r) ? r[i] : r;
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = new THREE.Vector2(p0[0] - p1[0], p0[1] - p1[1]), v2 = new THREE.Vector2(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.min(rr, v1.length() / 2.01, v2.length() / 2.01); v1.normalize(); v2.normalize();
    const a = [p1[0] + v1.x * k, p1[1] + v1.y * k], b = [p1[0] + v2.x * k, p1[1] + v2.y * k];
    if (i === 0) s.moveTo(...a); else s.lineTo(...a);
    s.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
  }
  s.closePath(); return s;
}
const circleShape = (r, x = 0, y = 0) => { const s = new THREE.Shape(); s.absarc(x, y, r, 0, Math.PI * 2, false); return s; };
const circlePath = (r, x = 0, y = 0) => { const s = new THREE.Path(); s.absarc(x, y, r, 0, Math.PI * 2, true); return s; };
// barra plana para símbolos (en plano XY, grosor en Z)
const bar = (len, th, m, d = 0.07) => rb(len, th, d, th * 0.48, m);
function barFromTo(parent, a, b, th, m, z, d = 0.07) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) + th;
  return put(parent, bar(L, th, m, d), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z], [0, 0, Math.atan2(dy, dx)]);
}
// orientar hacia la cámara (objeto plano que mira a +Z)
function stand(g, yaw = -0.36, pitch = -0.18) { const w = G(); g.rotation.set(pitch, yaw, 0, "YXZ"); w.add(g); return w; }
const face = (g, yaw, pitch) => stand(g, yaw, pitch);

/* ---------- símbolos ---------- */
const SYM = {
  left(g, m, z) { barFromTo(g, [-.24, 0], [.26, 0], .11, m, z); barFromTo(g, [-.24, 0], [-.05, .19], .11, m, z); barFromTo(g, [-.24, 0], [-.05, -.19], .11, m, z); },
  right(g, m, z) { barFromTo(g, [.24, 0], [-.26, 0], .11, m, z); barFromTo(g, [.24, 0], [.05, .19], .11, m, z); barFromTo(g, [.24, 0], [.05, -.19], .11, m, z); },
  up(g, m, z) { barFromTo(g, [0, .24], [0, -.26], .11, m, z); barFromTo(g, [0, .24], [.19, .05], .11, m, z); barFromTo(g, [0, .24], [-.19, .05], .11, m, z); },
  down(g, m, z) { barFromTo(g, [0, -.24], [0, .26], .11, m, z); barFromTo(g, [0, -.24], [.19, -.05], .11, m, z); barFromTo(g, [0, -.24], [-.19, -.05], .11, m, z); },
  plus(g, m, z) { barFromTo(g, [-.22, 0], [.22, 0], .12, m, z); barFromTo(g, [0, -.22], [0, .22], .12, m, z); },
  x(g, m, z) { barFromTo(g, [-.17, -.17], [.17, .17], .12, m, z); barFromTo(g, [-.17, .17], [.17, -.17], .12, m, z); },
  check(g, m, z) { barFromTo(g, [-.22, .01], [-.07, -.15], .12, m, z); barFromTo(g, [-.07, -.15], [.23, .17], .12, m, z); },
  dots(g, m, z) { for (const x of [-.2, 0, .2]) put(g, sp(.068, m), [x, 0, z], [0, 0, 0], [1, 1, .55]); },
  i(g, m, z) { put(g, sp(.07, m), [0, .19, z], 0, [1, 1, .55]); barFromTo(g, [0, .05], [0, -.2], .12, m, z); },
  excl(g, m, z) { barFromTo(g, [0, .22], [0, -.05], .12, m, z); put(g, sp(.07, m), [0, -.2, z], 0, [1, 1, .55]); },
  q(g, m, z) {
    put(g, tube([[-.14, .1, z], [-.1, .22, z], [0, .26, z], [.12, .21, z], [.13, .1, z], [.04, .02, z], [0, -.06, z]], .055, m));
    put(g, sp(.062, m), [0, -.06, z]); put(g, sp(.072, m), [0, -.22, z], 0, [1, 1, .6]);
  },
};
// botón-moneda con símbolo
function coin(faceM, sym, symM, r = .5, h = .2) {
  const g = G(); put(g, puck(r, h, .065, faceM), [0, 0, 0], [Math.PI / 2, 0, 0]);
  SYM[sym](g, symM, h + .015); return stand(g, -0.42, -0.2);
}
function tile(faceM, sym, symM) {
  const g = G(); put(g, rb(.92, .7, .2, .16, faceM), [0, 0, 0]);
  if (sym === "play") { const t = ext(roundPoly([[-.12, -.17], [.2, 0], [-.12, .17]], .05), .05, .02, symM); put(g, t, [.02, 0, .13]); }
  else if (sym === "pause") { put(g, bar(.3, .1, symM), [-.08, 0, .12], [0, 0, Math.PI / 2]); put(g, bar(.3, .1, symM), [.08, 0, .12], [0, 0, Math.PI / 2]); }
  return stand(g, -0.4, -0.2);
}

/* ---------- piezas reutilizables ---------- */
function bust(sweater = C.dark, cap = C.dark, skin = C.skin) {
  const g = G();
  put(g, lathe([[0, 0], [.42, 0], [.44, .1], [.4, .24], [.26, .34], [.12, .38], [0, .385]], sweater), [0, 0, 0], [0, 0, 0], [1, 1, .78]);
  put(g, to(.105, .035, C.white), [0, .37, 0], [Math.PI / 2, 0, 0], [1, .85, 1]);
  put(g, cy(.072, .12, skin), [0, .42, 0]);
  put(g, sp(.19, skin), [0, .6, 0], 0, [1, 1.08, 1]);
  put(g, sp(.045, skin), [.188, .59, -.01], 0, [.6, 1, 1]); put(g, sp(.045, skin), [-.188, .59, -.01], 0, [.6, 1, 1]);
  put(g, sp(.205, cap), [0, .69, -.015], 0, [1.02, .5, 1.06]);
  put(g, cy(.19, .028, cap), [0, .695, .12], [.22, 0, 0], [1, 1, .62]);
  put(g, sp(.03, cap), [0, .79, 0]);
  return g;
}
function wheel(r, w, m = C.black) { const g = G(); put(g, cy(r, w, m), [0, 0, 0], [0, 0, Math.PI / 2]); put(g, cy(r * .55, w + .01, C.metal), [0, 0, 0], [0, 0, Math.PI / 2]); return g; }
function arrowSolid(m, dir = "down") { // flecha gruesa vertical
  const g = G(); put(g, rb(.16, .34, .16, .07, m), [0, .17, 0]);
  const t = ext(roundPoly([[-.25, 0], [.25, 0], [0, -.24]], .04), .16, .02, m); put(g, t, [0, -.08, 0]);
  if (dir === "up") g.rotation.z = Math.PI; return g;
}
function lines(g, n, x0, y0, w, gap, z, m = C.lgray, th = .045) { for (let i = 0; i < n; i++) put(g, rb(w * (i === n - 1 ? .65 : 1), th, .012, th / 2, m), [x0 + w * (i === n - 1 ? .65 : 1) / 2, y0 - i * gap, z]); }

/* ---------- modelos ---------- */
export const MODELS = {
  /* NAVEGACIÓN */
  home() {
    const g = G();
    put(g, rb(1, .62, .8, .03, C.white), [0, .31, 0]);
    const tri = ext(roundPoly([[-.4, 0], [.4, 0], [0, .29]], [.0, .0, .02]), .98, 0, C.white); put(g, tri, [0, .62 + .145, 0], [0, Math.PI / 2, 0]);
    put(g, rb(1.14, .07, .58, .025, C.dark), [0, .755, .23], [.62, 0, 0]);
    put(g, rb(1.14, .07, .58, .025, C.dark), [0, .755, -.23], [-.62, 0, 0]);
    put(g, rb(1.16, .07, .1, .03, C.dark), [0, .93, 0]);
    put(g, rb(.13, .28, .13, .02, C.dark), [.3, .92, -.15]);
    put(g, rb(.22, .36, .04, .02, C.beige), [-.18, .18, .405]);
    put(g, sp(.018, C.brass), [-.11, .18, .43]);
    put(g, rb(.22, .2, .035, .02, C.lit), [.2, .36, .405]); put(g, rb(.24, .03, .05, .01, C.white), [.2, .25, .42]);
    put(g, rb(.035, .2, .24, .02, C.lit), [-.505, .38, -.05]);
    g.rotation.y = .12; return g;
  },
  search() {
    const g = G(); put(g, to(.3, .065, C.dark), [0, .12, 0]); put(g, cy(.3, .02, C.glassL), [0, .12, 0], [Math.PI / 2, 0, 0]);
    put(g, cy(.085, .1, C.metal), [.27, -.15, 0], [0, 0, Math.PI / 4]);
    put(g, caps(.075, .3, C.black), [.43, -.31, 0], [0, 0, Math.PI / 4]);
    return stand(g, -.35, -.25);
  },
  menu() { const g = G(); [0, .3, .6].forEach((y, i) => put(g, rb(.92, .18, .2, .09, i === 0 ? C.teal : C.white), [0, y, 0])); return stand(g, -.4, -.22); },
  grid() { const g = G(); const ms = [C.white, C.white, C.teal, C.white]; [[-.24, .24], [.24, .24], [-.24, -.24], [.24, -.24]].forEach((p, i) => put(g, rb(.42, .42, .16, .1, ms[i]), [p[0], p[1], 0])); return stand(g, -.4, -.22); },
  back() { return coin(C.white, "left", C.dark); },
  next() { return coin(C.white, "right", C.dark); },
  more() { return coin(C.white, "dots", C.dark); },
  settings() {
    const g = G();
    const gear = (R, r, n, hole, m, d) => { const s = new THREE.Shape(); const N = n * 4; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; const rr = (i % 4 === 0 || i % 4 === 1) ? R : r; const p = [Math.cos(a) * rr, Math.sin(a) * rr]; i ? s.lineTo(...p) : s.moveTo(...p); } s.closePath(); s.holes.push(circlePath(hole)); return ext(s, d, .025, m, 12); };
    put(g, gear(.48, .38, 9, .15, C.lgray, .16), [0, 0, 0]);
    put(g, cy(.2, .05, C.gray), [0, 0, .1], [Math.PI / 2, 0, 0]);
    const ring = M(new THREE.RingGeometry(.15, .2, 48), C.gray);
    put(g, gear(.3, .23, 7, .09, C.dgray, .14), [.5, -.42, -.12], [0, 0, .2]);
    return stand(g, -.4, -.2);
  },
  /* ACCIONES */
  plus() { return coin(C.dark, "plus", C.white); },
  close() { return coin(C.red, "x", C.white); },
  check() { return coin(C.white, "check", C.green); },
  edit() {
    const g = G();
    put(g, cy(.085, .78, C.yellow, 6), [0, 0, 0], [0, 0, Math.PI / 2]);
    put(g, cy(.088, .1, C.metal, 32), [-.44, 0, 0], [0, 0, Math.PI / 2]);
    put(g, cy(.084, .12, C.pink, 32), [-.54, 0, 0], [0, 0, Math.PI / 2]);
    put(g, sp(.084, C.pink), [-.6, 0, 0], 0, [.4, 1, 1]);
    put(g, cone(.085, .2, C.wood, 6), [.49, 0, 0], [0, 0, -Math.PI / 2]);
    put(g, cone(.03, .07, C.dark, 16), [.565, 0, 0], [0, 0, -Math.PI / 2]);
    g.rotation.set(0, .5, .55); return g;
  },
  trash() {
    const g = G();
    put(g, lathe([[0, 0], [.29, 0], [.3, .02], [.36, .78], [0, .78]], C.lgray), [0, 0, 0]);
    for (const a of [-.45, 0, .45]) { const r = rb(.05, .6, .02, .02, C.gray); r.position.set(Math.sin(a) * .335, .4, Math.cos(a) * .335); r.rotation.set(-.07, a, 0); g.add(r); }
    put(g, puck(.41, .07, .03, C.dgray), [0, .78, 0]);
    put(g, rb(.24, .06, .07, .025, C.dark), [0, .88, 0]);
    put(g, rb(.04, .07, .07, .015, C.dark), [-.1, .84, 0]); put(g, rb(.04, .07, .07, .015, C.dark), [.1, .84, 0]);
    return g;
  },
  share() {
    const g = G(); const P = [[-.32, 0], [.3, .3], [.3, -.3]];
    for (const p of P.slice(1)) { const dx = p[0] - P[0][0], dy = p[1] - P[0][1]; put(g, cy(.035, Math.hypot(dx, dy), C.lgray), [(p[0] + P[0][0]) / 2, (p[1] + P[0][1]) / 2, 0], [0, 0, Math.atan2(dy, dx) - Math.PI / 2]); }
    P.forEach((p, i) => put(g, sp(.16, i ? C.white : C.teal), [p[0], p[1], 0]));
    return stand(g, -.4, -.15);
  },
  download() {
    const g = G(); put(g, rb(.92, .16, .52, .06, C.lgray), [0, .08, 0]); put(g, rb(.8, .04, .4, .02, C.gray), [0, .155, 0]);
    put(g, arrowSolid(C.blue), [0, .55, .02]); g.rotation.y = -.3; return g;
  },
  filter() {
    const g = G();
    put(g, lathe([[.05, 0], [.065, .3], [.46, .74], [.47, .8], [.43, .8], [.05, .34], [0, .34]], orangeDS), [0, 0, 0]);
    put(g, to(.45, .025, C.orange), [0, .8, 0], [Math.PI / 2, 0, 0]);
    return g;
  },
  user() { const g = bust(); g.rotation.y = -.25; return g; },
  users() { const g = G(); const b2 = bust(C.gray, C.dgray); put(g, b2, [.42, .06, -.25], [0, -.35, 0], .88); const b1 = bust(); put(g, b1, [-.12, 0, .12], [0, -.25, 0]); return g; },
  "user-plus"() {
    const g = G(); put(g, bust(), [0, 0, 0], [0, -.25, 0]);
    const b = G(); put(b, puck(.17, .07, .03, C.green), [0, 0, 0], [Math.PI / 2, 0, 0]);
    barFromTo(b, [-.08, 0], [.08, 0], .05, C.white, .085, .03); barFromTo(b, [0, -.08], [0, .08], .05, C.white, .085, .03);
    put(g, b, [.3, .3, .3], [0, -.4, 0]); return g;
  },
  lock() {
    const g = G(); put(g, rb(.72, .56, .32, .09, C.dark), [0, .28, 0]);
    put(g, to(.22, .055, C.metal, Math.PI), [0, .7, 0]); put(g, cy(.055, .16, C.metal), [.22, .62, 0]); put(g, cy(.055, .16, C.metal), [-.22, .62, 0]);
    put(g, cy(.07, .02, C.brass), [0, .32, .165], [Math.PI / 2, 0, 0]); put(g, cy(.035, .03, C.black), [0, .33, .17], [Math.PI / 2, 0, 0]);
    put(g, rb(.03, .08, .03, .01, C.black), [0, .28, .17]);
    g.rotation.y = -.25; return g;
  },
  unlock() {
    const g = G(); put(g, rb(.72, .56, .32, .09, C.dark), [0, .28, 0]);
    const sh = G(); put(sh, to(.22, .055, C.metal, Math.PI), [.22, .2, 0]); put(sh, cy(.055, .2, C.metal), [.44, .1, 0]); put(sh, cy(.055, .32, C.metal), [0, .04, 0]);
    put(g, sh, [-.22, .64, 0], [0, -.9, 0]);
    put(g, cy(.07, .02, C.brass), [0, .32, .165], [Math.PI / 2, 0, 0]); put(g, cy(.035, .03, C.black), [0, .33, .17], [Math.PI / 2, 0, 0]);
    put(g, rb(.03, .08, .03, .01, C.black), [0, .28, .17]);
    g.rotation.y = -.25; return g;
  },
  key() {
    const g = G(); put(g, to(.17, .065, C.brass), [-.34, 0, 0]);
    put(g, cy(.05, .62, C.brass), [.1, 0, 0], [0, 0, Math.PI / 2]);
    put(g, cy(.075, .05, C.brass), [-.13, 0, 0], [0, 0, Math.PI / 2]);
    put(g, rb(.07, .14, .07, .015, C.brass), [.28, -.08, 0]); put(g, rb(.07, .1, .07, .015, C.brass), [.38, -.06, 0]);
    return stand(g, -.5, -.3);
  },
  shield() {
    const sh = (k) => { const s = new THREE.Shape(); s.moveTo(0, .52 * k); s.bezierCurveTo(.15 * k, .44 * k, .3 * k, .42 * k, .44 * k, .42 * k); s.lineTo(.44 * k, .05 * k); s.bezierCurveTo(.44 * k, -.25 * k, .2 * k, -.42 * k, 0, -.54 * k); s.bezierCurveTo(-.2 * k, -.42 * k, -.44 * k, -.25 * k, -.44 * k, .05 * k); s.lineTo(-.44 * k, .42 * k); s.bezierCurveTo(-.3 * k, .42 * k, -.15 * k, .44 * k, 0, .52 * k); return s; };
    const g = G(); put(g, extRaw(sh(1), .14, .04, C.navy), [0, 0, 0]); put(g, extRaw(sh(.78), .06, .02, C.white), [0, -.01, .1]);
    SYM.check(g, C.teal, .16); return stand(g, -.4, -.18);
  },
  logout() {
    const g = G();
    put(g, rb(.08, 1, .14, .02, C.dwood), [-.31, .5, 0]); put(g, rb(.08, 1, .14, .02, C.dwood), [.31, .5, 0]); put(g, rb(.7, .08, .14, .02, C.dwood), [0, .98, 0]);
    put(g, rb(.54, .94, .02, .01, C.dark), [0, .47, -.06]);
    const d = G(); put(d, rb(.52, .92, .05, .02, C.white), [.26, 0, 0]); put(d, sp(.03, C.brass), [.46, 0, .04]); put(g, d, [-.27, .48, .03], [0, -1.0, 0]);
    const a = G(); SYM.right(a, C.red, 0); put(g, a, [.2, .45, .35], [0, -.4, 0], 1.2);
    g.rotation.y = -.15; return g;
  },
  /* COMUNICACIÓN */
  chat() {
    const g = G(); const s = roundPoly([[-.5, .38], [-.5, -.3], [-.32, -.3], [-.44, -.56], [-.08, -.3], [.5, -.3], [.5, .38]], [.18, .18, .05, .03, .05, .18, .18]);
    put(g, ext(s, .18, .05, C.white), [0, 0, 0]); SYM.dots(g, C.dark, .14);
    return stand(g, -.4, -.18);
  },
  mail() {
    const g = G(); put(g, rb(.92, .6, .09, .035, C.white), [0, 0, 0]);
    put(g, ext(roundPoly([[-.44, .28], [.44, .28], [0, -.06]], [.02, .02, .05]), .02, .01, C.off), [0, .14, .06]);
    put(g, puck(.085, .035, .015, C.red), [0, -.04, .07], [Math.PI / 2, 0, 0]);
    return stand(g, -.4, -.25);
  },
  phone() {
    const g = G(); put(g, rb(.8, .3, .6, .1, C.white), [0, .15, 0]); put(g, rb(.62, .04, .44, .02, C.lgray), [0, .3, 0]);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) put(g, rb(.08, .05, .02, .015, C.gray), [-.12 + i * .12, .1 + j * .08, .305]);
    const h = G(); put(h, rb(.22, .12, .26, .06, C.dark), [-.36, 0, 0]); put(h, rb(.22, .12, .26, .06, C.dark), [.36, 0, 0]);
    put(h, tube([[-.36, .03, 0], [-.18, .14, 0], [.18, .14, 0], [.36, .03, 0]], .065, C.dark)); put(g, h, [0, .4, 0]);
    put(g, tube([[.4, .15, -.2], [.55, .1, -.1], [.5, .05, .15], [.6, 0, .3]], .015, C.dark));
    g.rotation.y = -.15; return g;
  },
  bell() {
    const g = G();
    put(g, lathe([[0, .08], [.46, .08], [.47, .1], [.44, .14], [.36, .24], [.3, .4], [.26, .62], [.22, .82], [.17, .92], [.1, .97], [0, .98]], C.gold), [0, 0, 0]);
    put(g, to(.455, .03, C.gold), [0, .09, 0], [Math.PI / 2, 0, 0]); put(g, sp(.08, C.brass), [0, .05, .06]);
    put(g, to(.07, .025, C.gold), [0, 1.03, 0]);
    g.rotation.z = .22; return g;
  },
  send() {
    const tri = (a, b, c, m) => { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); geo.computeVertexNormals(); return M(geo, m); };
    const N = [.52, .36, .02], T = [-.52, .04, .06], B = [-.12, -.5, .06], Cc = [-.08, -.04, -.1], F = [-.02, -.22, .12];
    const g = G();
    put(g, tri(N, T, Cc, mat(0xF4F6F9, .55, 0, ds)));
    put(g, tri(N, Cc, B, mat(0xC9DBEF, .55, 0, ds)));
    put(g, tri(Cc, F, B, mat(0x9FBCDD, .55, 0, ds)));
    return stand(g, -.35, -.15);
  },
  whatsapp() {
    const g = G(); put(g, puck(.44, .16, .05, C.green), [0, 0, 0], [Math.PI / 2, 0, 0]);
    put(g, ext(roundPoly([[-.38, -.18], [-.48, -.5], [-.12, -.4]], .03), .16, .03, C.green), [-.3, -.33, .08]);
    const h = G(); put(h, rb(.12, .17, .07, .05, C.white), [-.13, .12, 0], [0, 0, -.6]); put(h, rb(.12, .17, .07, .05, C.white), [.13, -.14, 0], [0, 0, -1.0]);
    put(h, tube([[-.15, .1, 0], [-.12, -.05, 0], [-.02, -.13, 0], [.12, -.15, 0]], .05, C.white)); put(g, h, [0, 0, .2], [0, 0, .1], 1.1);
    return stand(g, -.4, -.2);
  },
  mic() {
    const g = G(); put(g, sp(.22, C.gray), [0, .7, 0]);
    for (const y of [-.12, -.06, 0, .06, .12]) { const r = Math.sqrt(.22 * .22 - y * y) + .004; put(g, to(r, .008, C.dgray), [0, .7 + y, 0], [Math.PI / 2, 0, 0]); }
    put(g, cy(.2, .07, C.metal), [0, .52, 0]);
    put(g, lathe([[0, 0], [.07, 0], [.08, .05], [.12, .44], [.16, .5], [0, .5]], C.black), [0, 0, 0]);
    put(g, rb(.04, .1, .03, .015, C.led), [0, .3, .1]);
    g.rotation.set(.1, 0, -.4); return g;
  },
  megaphone() {
    const g = G();
    put(g, lathe([[.13, 0], [.14, .12], [.44, .72], [.46, .76], [.42, .76], [.12, .14], [0, .14]], whiteDS), [0, 0, 0]);
    put(g, to(.45, .035, C.red), [0, .75, 0], [Math.PI / 2, 0, 0]);
    put(g, cy(.15, .12, C.dark), [0, -.04, 0]);
    put(g, rb(.1, .28, .12, .04, C.dark), [0, .2, .2], [-.3, 0, 0]);
    g.rotation.set(0, -.6, -1.25); return g;
  },
  /* COMPRAS */
  cart() {
    const g = G();
    put(g, M(new THREE.CylinderGeometry(.56, .42, .44, 4), C.red), [0, .52, 0], [0, Math.PI / 4, 0], [1, 1, .62]);
    put(g, M(new THREE.CylinderGeometry(.5, .5, .02, 4), C.dred), [0, .745, 0], [0, Math.PI / 4, 0], [1, 1, .62]);
    put(g, rb(.2, .16, .16, .02, C.kraft), [-.12, .82, -.02], [0, .3, 0]); put(g, cy(.06, .26, C.green), [.1, .85, -.05]); put(g, cy(.03, .06, C.white), [.1, 1.0, -.05]);
    put(g, sp(.08, C.yellow), [.24, .8, .08]); put(g, sp(.075, C.red), [-.02, .79, .14]);
    for (const x of [-.26, .26]) for (const z of [-.15, .15]) { put(g, cy(.016, .26, C.metal), [x, .17, z]); put(g, wheel(.06, .05), [x, .06, z]); }
    put(g, rb(.7, .03, .03, .012, C.metal), [0, .3, .15]); put(g, rb(.7, .03, .03, .012, C.metal), [0, .3, -.15]);
    put(g, tube([[-.4, .7, 0], [-.5, .86, 0], [-.58, .9, 0]], .022, C.metal)); put(g, cy(.035, .34, C.dark), [-.58, .9, 0], [Math.PI / 2, 0, 0]);
    g.rotation.y = .35; return g;
  },
  store() {
    const g = G(); put(g, rb(1, .62, .7, .03, C.white), [0, .31, 0]); put(g, rb(1.08, .08, .78, .02, C.dark), [0, .66, 0]);
    put(g, rb(.62, .15, .05, .03, C.teal), [0, .79, .28]);
    for (let i = 0; i < 6; i++) put(g, rb(.18, .03, .32, .012, i % 2 ? C.white : C.red), [-.45 + i * .18, .5, .47], [.55, 0, 0]);
    put(g, rb(.24, .34, .03, .015, C.glass), [-.22, .17, .36]); put(g, rb(.34, .2, .03, .015, C.lit), [.18, .24, .36]);
    put(g, rb(.03, .2, .3, .015, C.glass), [-.51, .28, -.05]);
    g.rotation.y = .1; return g;
  },
  tag() {
    const s = roundPoly([[-.5, -.28], [.22, -.28], [.5, 0], [.22, .28], [-.5, .28]], .07); s.holes.push(circlePath(.07, .25, 0));
    const g = G(); put(g, ext(s, .06, .02, C.beige), [0, 0, 0]);
    put(g, tube([[.25, 0, .02], [.42, .12, .1], [.55, .3, .05], [.5, .5, -.02]], .015, C.dwood));
    put(g, rb(.4, .05, .01, .02, C.dwood), [-.1, .06, .05]); put(g, rb(.26, .05, .01, .02, C.dwood), [-.17, -.07, .05]);
    return stand(g, -.4, -.2);
  },
  wallet() {
    const g = G(); put(g, rb(.5, .32, .02, .02, C.blue), [-.08, .2, -.02]);
    put(g, rb(.9, .58, .18, .09, C.leather), [0, 0, 0]);
    put(g, rb(.36, .24, .06, .05, mat(0x6E4429, .6)), [.3, 0, .09]); put(g, cy(.035, .03, C.metal), [.36, 0, .13], [Math.PI / 2, 0, 0]);
    put(g, rb(.82, .02, .02, .01, mat(0x6E4429, .6)), [0, .2, .09]);
    return stand(g, -.4, -.22);
  },
  card() {
    const g = G(); put(g, rb(.86, .54, .035, .045, C.navy), [0, 0, 0]);
    put(g, rb(.13, .1, .012, .015, C.gold), [-.25, .07, .02]);
    put(g, cy(.07, .012, C.red), [.24, -.15, .02], [Math.PI / 2, 0, 0]); put(g, cy(.07, .014, C.orange), [.32, -.15, .02], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 4; i++) put(g, rb(.12, .03, .01, .012, C.lblue), [-.28 + i * .15, -.08, .02]);
    put(g, rb(.86, .54, .035, .045, C.teal), [.08, .06, -.08]);
    return stand(g, -.45, -.3);
  },
  receipt() {
    const pts = [[-.32, .5], [-.32, -.42]]; for (let i = 0; i <= 8; i++) pts.push([-.32 + i * .08, i % 2 ? -.5 : -.42]); pts.push([.32, .5]);
    const g = G(); put(g, ext(shapeOf(pts), .015, .005, C.paper), [0, 0, 0]);
    lines(g, 4, -.22, .34, .44, .12, .015, C.lgray, .04);
    put(g, rb(.44, .05, .012, .02, C.dark), [0, -.22, .015]);
    return stand(g, -.4, -.3);
  },
  gift() {
    const g = G(); put(g, rb(.72, .5, .72, .03, C.white), [0, .25, 0]); put(g, rb(.78, .15, .78, .03, C.white), [0, .57, 0]);
    put(g, rb(.13, .66, .79, .01, C.red), [0, .33, 0]); put(g, rb(.79, .66, .13, .01, C.red), [0, .33, 0]);
    put(g, to(.12, .045, C.red), [-.11, .72, 0], [0, 0, .5], [1, .7, 1]); put(g, to(.12, .045, C.red), [.11, .72, 0], [0, 0, -.5], [1, .7, 1]);
    put(g, sp(.06, C.red), [0, .68, 0]);
    g.rotation.y = .25; return g;
  },
  coins() {
    const g = G(); [[0, 0], [.02, .01], [-.01, -.01], [.015, 0], [0, .01]].forEach((p, i) => put(g, puck(.3, .08, .02, C.gold), [p[0] - .15, i * .08, p[1]]));
    const c = G(); put(c, puck(.3, .08, .02, C.gold), [0, 0, 0], [Math.PI / 2, 0, 0]); put(c, to(.21, .012, C.brass), [0, 0, .085]);
    put(g, c, [.32, .3, .25], [-.25, -.5, .1]); return g;
  },
  /* LOGÍSTICA */
  box() {
    const g = G(); put(g, rb(.92, .6, .7, .02, C.kraft), [0, .3, 0]);
    put(g, rb(.16, .006, .72, .002, mat(0xE6C891, .7)), [0, .603, 0]); put(g, rb(.16, .2, .006, .002, mat(0xE6C891, .7)), [0, .5, .353]);
    put(g, rb(.92, .006, .005, .002, mat(0xA9844F, .8)), [0, .603, 0]);
    put(g, rb(.26, .16, .006, .01, C.white), [.26, .3, .353]); lines(g, 2, .16, .33, .18, .06, .358, C.dgray, .02);
    g.rotation.y = .15; return g;
  },
  truck() {
    const g = G(); put(g, rb(.62, .58, .78, .04, C.white), [0, .44, -.16]);
    put(g, rb(.6, .4, .36, .08, C.teal), [0, .34, .42]); put(g, rb(.5, .18, .03, .03, C.glass), [0, .44, .6], [-.15, 0, 0]);
    put(g, rb(.03, .14, .18, .02, C.glass), [-.3, .44, .44]);
    put(g, rb(.62, .08, 1.1, .03, C.dgray), [0, .15, 0]);
    for (const z of [.4, -.32]) { put(g, wheel(.12, .1), [-.3, .12, z]); put(g, wheel(.12, .1), [.3, .12, z]); }
    put(g, rb(.08, .05, .02, .02, C.lit), [-.2, .26, .605]); put(g, rb(.08, .05, .02, .02, C.lit), [.2, .26, .605]);
    put(g, rb(.4, .12, .01, .02, C.teal), [-.315, .5, -.15], [0, Math.PI / 2, 0]);
    g.rotation.y = .55; return g;
  },
  qr() {
    const g = G(); put(g, rb(.92, .92, .08, .07, C.white), [0, 0, 0]);
    const u = .075, z = .05;
    const finder = (x, y) => { put(g, rb(u * 3, u * 3, .02, .02, C.dark), [x, y, z]); put(g, rb(u * 2, u * 2, .022, .015, C.white), [x, y, z + .005]); put(g, rb(u, u, .03, .012, C.dark), [x, y, z + .01]); };
    finder(-.26, .26); finder(.26, .26); finder(-.26, -.26);
    const P = ["00101", "11010", "01101", "10011", "01110"];
    P.forEach((row, j) => [...row].forEach((c, i) => { if (c === "1") put(g, rb(u * .92, u * .92, .03, .012, C.dark), [-.08 + i * u, .1 - j * u, z]); }));
    for (const [x, y] of [[.16, -.14], [.24, -.2], [.32, -.3], [.16, -.3], [.3, -.12]]) put(g, rb(u * .92, u * .92, .03, .012, C.dark), [x, y, z]);
    return stand(g, -.4, -.25);
  },
  barcode() {
    const g = G(); put(g, rb(.92, .62, .05, .05, C.white), [0, 0, 0]);
    const W = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2]; let x = -.36;
    W.forEach((w, i) => { const ww = w * .011; if (i % 2 === 0) put(g, rb(ww, .38, .02, .002, C.dark), [x + ww / 2, .05, .03]); x += ww + .012; });
    lines(g, 1, -.25, -.22, .5, .1, .03, C.gray, .04);
    return stand(g, -.4, -.25);
  },
  warehouse() {
    const g = G(); put(g, rb(1, .44, .72, .02, C.lgray), [0, .22, 0]);
    put(g, cy(.36, 1.04, C.dgray, 64), [0, .44, 0], [0, 0, Math.PI / 2], [.55, 1, 1]);
    put(g, rb(.4, .34, .02, .01, C.gray), [-.12, .17, .365]); for (let i = 0; i < 6; i++) put(g, rb(.4, .008, .01, .003, C.dgray), [-.12, .04 + i * .05, .375]);
    put(g, rb(.16, .12, .02, .01, C.lit), [.3, .26, .365]);
    put(g, rb(.02, .3, .02, .01, C.yellow), [.1, .15, .37]);
    g.rotation.y = .1; return g;
  },
  pin() {
    const g = G(); put(g, sp(.22, C.red), [0, .75, 0]);
    put(g, lathe([[0, .5], [.06, .5], [.09, .58], [.16, .64], [0, .66]], C.dred), [0, 0, 0]);
    put(g, cy(.012, .52, C.metal, 16, .004), [0, .24, 0]); put(g, sp(.06, mat(0xF08A82, .4)), [-.08, .84, .14]);
    g.rotation.set(.2, 0, -.35); return g;
  },
  route() {
    const g = G(); const pm = [C.beige, mat(0xD7E6C3, .7), C.beige];
    [-.33, 0, .33].forEach((x, i) => { const p = G(); put(p, rb(.34, .9, .02, .01, pm[i]), [0, 0, 0]); put(g, p, [x, .45, i % 2 ? .06 : 0], [0, i % 2 ? .35 : -.35, 0]);
      for (let k = 0; k < 3; k++) put(p, rb(.06, .025, .01, .01, C.red), [-.1 + k * .1, -.25 + i * .18 + k * .06, .02], [0, 0, .5]); });
    const pin = G(); put(pin, sp(.09, C.red), [0, .2, 0]); put(pin, cone(.07, .18, C.red), [0, .08, 0], [Math.PI, 0, 0]); put(pin, sp(.035, C.white), [0, .2, .08]);
    put(g, pin, [.3, .7, .2]); g.rotation.y = -.25; return g;
  },
  clipboard() {
    const g = G(); put(g, rb(.72, .96, .05, .05, C.wood), [0, 0, 0]); put(g, rb(.6, .76, .01, .01, C.paper), [0, -.06, .03]);
    put(g, rb(.34, .12, .07, .03, C.metal), [0, .42, .04]); put(g, to(.06, .015, C.metal), [0, .5, .04]);
    for (let i = 0; i < 4; i++) { put(g, rb(.06, .06, .012, .012, i < 2 ? C.green : C.lgray), [-.2, .18 - i * .14, .04]); put(g, rb(.3, .04, .012, .02, C.lgray), [.05, .18 - i * .14, .04]); }
    return stand(g, -.4, -.22);
  },
  /* DATOS */
  "chart-bar"() {
    const g = G(); put(g, rb(1, .06, .5, .03, C.white), [0, .03, 0]);
    [[.3, C.lblue], [.55, C.blue], [.85, C.teal]].forEach(([h, m], i) => put(g, rb(.2, h, .2, .04, m), [-.3 + i * .3, .06 + h / 2, 0]));
    g.rotation.y = -.2; return g;
  },
  "chart-line"() {
    const g = G(); put(g, rb(1, .72, .06, .06, C.white), [0, 0, 0]);
    for (let i = 0; i < 3; i++) put(g, rb(.84, .01, .01, .005, C.lgray), [0, -.2 + i * .2, .035]);
    const P = [[-.38, -.2, .06], [-.15, .02, .06], [.05, -.08, .06], [.36, .22, .06]];
    put(g, tube(P, .025, C.teal, false, 0)); P.forEach(p => put(g, sp(.05, C.teal), p));
    return stand(g, -.4, -.22);
  },
  "chart-pie"() {
    const g = G(); const sl = [[0, 3.8, C.blue, .2], [3.8, 1.5, C.teal, .26], [5.3, Math.PI * 2 - 5.3, C.yellow, .32]];
    sl.forEach(([a, l, m, h], i) => { const me = M(new THREE.CylinderGeometry(.48, .48, h, 64, 1, false, a, l), m); const mid = a + l / 2; const off = i === 2 ? .09 : 0; put(g, me, [Math.sin(mid) * off, h / 2, Math.cos(mid) * off]); });
    g.rotation.y = .3; return g;
  },
  trend() {
    const g = G(); const P = [[-.5, -.3, 0], [-.18, .02, 0], [.02, -.12, 0], [.36, .26, 0]];
    put(g, tube(P, .06, C.green, false, 0)); P.slice(0, 3).forEach(p => put(g, sp(.06, C.green), p));
    const a = Math.atan2(.38, .34); put(g, cone(.13, .22, C.green), [.4, .3, 0], [0, 0, a - Math.PI / 2]);
    put(g, rb(1.1, .04, .3, .02, C.lgray), [0, -.36, 0]);
    return stand(g, -.4, -.15);
  },
  calendar() {
    const g = G(); put(g, rb(.82, .76, .24, .06, C.white), [0, 0, 0]); put(g, rb(.84, .2, .26, .06, C.red), [0, .3, 0]);
    for (const x of [-.2, .2]) put(g, to(.06, .022, C.metal), [x, .42, 0], [0, Math.PI / 2, 0]);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) put(g, rb(.11, .09, .012, .02, r === 1 && c === 2 ? C.red : C.lgray), [-.24 + c * .16, .08 - r * .14, .125]);
    return stand(g, -.4, -.2);
  },
  clock() {
    const g = G(); put(g, puck(.4, .22, .07, C.red), [0, 0, -.11], [Math.PI / 2, 0, 0]);
    put(g, cy(.32, .02, C.white), [0, 0, .11], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; put(g, rb(.02, i % 3 ? .03 : .06, .01, .005, C.dark), [Math.sin(a) * .26, Math.cos(a) * .26, .125], [0, 0, -a]); }
    put(g, rb(.03, .17, .015, .01, C.dark), [0, .07, .135]); put(g, rb(.025, .22, .015, .01, C.dark), [.08, -.04, .14], [0, 0, -2.0]);
    put(g, sp(.03, C.dark), [0, 0, .14]);
    for (const s of [-1, 1]) { put(g, sp(.15, C.metal, 32, 16), [s * .3, .36, 0], [0, 0, -s * .6], [1, .75, 1]); put(g, cy(.025, .2, C.dark), [s * .27, -.4, 0], [0, 0, s * .5]); }
    put(g, rb(.04, .14, .04, .01, C.dark), [0, .46, 0]);
    return stand(g, -.4, -.15);
  },
  list() {
    const g = G(); put(g, rb(.72, .92, .04, .04, C.paper), [0, 0, 0]); put(g, rb(.74, .1, .07, .03, C.dark), [0, .44, 0]);
    for (let i = 0; i < 4; i++) { put(g, rb(.09, .09, .02, .02, i < 2 ? C.green : C.lgray), [-.22, .22 - i * .17, .03]); put(g, rb(.34, .05, .015, .025, C.lgray), [.06, .22 - i * .17, .03]); }
    return stand(g, -.4, -.22);
  },
  table() {
    const g = G(); put(g, rb(.92, .72, .05, .05, C.white), [0, 0, 0]); put(g, rb(.84, .14, .02, .03, C.teal), [0, .24, .03]);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) put(g, rb(.26, .11, .015, .02, r % 2 ? C.lgray : C.off), [-.28 + c * .28, .06 - r * .14, .03]);
    return stand(g, -.4, -.22);
  },
  /* ESTADOS */
  info() { return coin(C.blue, "i", C.white); },
  warning() {
    const g = G(); put(g, ext(roundPoly([[-.52, -.42], [.52, -.42], [0, .5]], .1), .14, .04, C.yellow), [0, 0, 0]);
    const s = G(); barFromTo(s, [0, .14], [0, -.12], .1, C.dark, 0); put(s, sp(.06, C.dark), [0, -.26, 0], 0, [1, 1, .55]); put(g, s, [0, -.02, .11]);
    return stand(g, -.4, -.18);
  },
  error() { return coin(C.red, "x", C.white); },
  success() { return coin(C.green, "check", C.white); },
  help() { return coin(C.purple, "q", C.white); },
  star() {
    const p = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i / 10 * Math.PI * 2; const r = i % 2 ? .23 : .52; p.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const g = G(); put(g, ext(roundPoly(p, .05), .14, .06, C.gold), [0, 0, 0]); return stand(g, -.4, -.18);
  },
  heart() {
    const s = new THREE.Shape(); const x = 0, y = 0;
    s.moveTo(x + 5, y + 5); s.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y); s.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    s.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19); s.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    s.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y); s.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    const g = G(); const h = ext(s, 4, 2.2, C.red); h.rotation.z = Math.PI; h.scale.setScalar(.05); g.add(h); return stand(g, -.4, -.15);
  },
  bookmark() { const g = G(); put(g, ext(roundPoly([[-.3, .5], [.3, .5], [.3, -.5], [0, -.26], [-.3, -.5]], [.06, .06, .04, .02, .04]), .07, .025, C.red), [0, 0, 0]); return stand(g, -.4, -.2); },
  /* ARCHIVOS */
  file() {
    const g = G(); put(g, ext(roundPoly([[-.35, -.46], [.35, -.46], [.35, .24], [.13, .46], [-.35, .46]], [.03, .03, .01, .01, .03]), .03, .01, C.paper), [0, 0, 0]);
    put(g, ext(roundPoly([[.13, .46], [.13, .24], [.35, .24]], .01), .01, .005, C.lgray), [.2, .32, .025]);
    lines(g, 4, -.24, .1, .46, .12, .025, C.lgray, .04); put(g, rb(.2, .05, .012, .02, C.blue), [-.14, .3, .025]);
    return stand(g, -.4, -.22);
  },
  folder() {
    const g = G(); put(g, ext(roundPoly([[-.5, -.36], [.5, -.36], [.5, .3], [-.04, .3], [-.12, .41], [-.5, .41]], .04), .03, .01, mat(0xDDA23A, .6)), [0, 0, -.04]);
    put(g, rb(.86, .6, .01, .01, C.paper), [0, .02, 0]);
    put(g, rb(1, .6, .03, .04, C.yellow), [0, -.07, .07], [-.18, 0, 0]);
    return stand(g, -.4, -.18);
  },
  image() {
    const g = G(); put(g, rb(.92, .76, .06, .04, C.white), [0, 0, 0]); put(g, rb(.78, .62, .01, .01, C.lblue), [0, 0, .033]);
    put(g, ext(roundPoly([[-.39, -.31], [-.05, .12], [.25, -.31]], .02), .03, .005, C.green), [-.1, -.11, .045]);
    put(g, ext(roundPoly([[-.1, -.31], [.15, .0], [.39, -.31]], .02), .03, .005, C.dgreen), [.24, -.155, .05]);
    put(g, cy(.07, .02, C.yellow), [.22, .17, .045], [Math.PI / 2, 0, 0]);
    return stand(g, -.4, -.2);
  },
  camera() {
    const g = G(); put(g, rb(.92, .58, .4, .1, C.dark), [0, .29, 0]); put(g, rb(.3, .14, .3, .05, C.dark), [-.16, .6, 0]);
    put(g, rb(.92, .14, .41, .05, C.dgray), [0, .29, 0]);
    put(g, cy(.24, .16, C.black), [0, .29, .26], [Math.PI / 2, 0, 0]); put(g, to(.22, .02, C.metal), [0, .29, .34]);
    put(g, cy(.16, .02, C.glass), [0, .29, .345], [Math.PI / 2, 0, 0]); put(g, sp(.03, C.white), [-.05, .34, .35], 0, [1, 1, .3]);
    put(g, cy(.06, .05, C.red), [.3, .6, 0]); put(g, rb(.12, .06, .02, .02, C.lit), [.3, .48, .205]);
    g.rotation.y = -.1; return g;
  },
  link() {
    const g = G(); put(g, to(.2, .06, C.metal), [-.18, 0, 0], [0, 0, 0], [1.45, 1, 1]); put(g, to(.2, .06, C.metal), [.18, 0, 0], [Math.PI / 2, 0, 0], [1.45, 1, 1]);
    g.rotation.z = .5; return stand(g, -.5, -.3);
  },
  clip() {
    const g = G(); put(g, tube([[.1, -.2, 0], [.1, .3, 0], [0, .4, 0], [-.1, .3, 0], [-.1, -.35, 0], [.04, -.48, 0], [.18, -.35, 0], [.18, .38, 0], [0, .53, 0], [-.18, .38, 0], [-.18, .02, 0]], .032, C.metal));
    g.rotation.z = -.4; return stand(g, -.5, -.3);
  },
  upload() {
    const g = G(); put(g, rb(.92, .16, .52, .06, C.lgray), [0, .08, 0]); put(g, rb(.8, .04, .4, .02, C.gray), [0, .155, 0]);
    put(g, arrowSolid(C.teal, "up"), [0, .6, .02]); g.rotation.y = -.3; return g;
  },
  copy() {
    const g = G(); put(g, rb(.56, .72, .03, .04, C.lgray), [.12, .1, -.08]);
    put(g, rb(.56, .72, .03, .04, C.paper), [-.08, -.08, 0]); lines(g, 4, -.28, .1, .38, .11, .02, C.lgray, .035);
    return stand(g, -.4, -.22);
  },
  /* COMIDA Y SALUD */
  apple() {
    const g = G(); put(g, lathe([[0, .06], [.14, .0], [.3, .06], [.41, .24], [.42, .44], [.34, .6], [.2, .64], [.08, .6], [0, .54]], C.red), [0, 0, 0]);
    put(g, cy(.022, .2, C.dwood, 12, .016), [.02, .66, 0], [0, 0, -.25]);
    const lf = new THREE.Shape(); lf.moveTo(0, 0); lf.quadraticCurveTo(.12, .1, .26, 0); lf.quadraticCurveTo(.12, -.1, 0, 0);
    put(g, ext(lf, .01, .01, C.leaf), [.15, .72, 0], [0, -.3, .4]);
    put(g, sp(.06, mat(0xF29A92, .35)), [-.2, .44, .3], 0, [1, 1.3, .4]);
    return g;
  },
  leaf() {
    const s = new THREE.Shape(); s.moveTo(0, -.5); s.quadraticCurveTo(.45, -.1, 0, .5); s.quadraticCurveTo(-.45, -.1, 0, -.5);
    const geo = new THREE.ExtrudeGeometry(s, { depth: .02, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 4, curveSegments: 40 });
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, p.getZ(i) - x * x * 1.2 + y * .15); } geo.computeVertexNormals();
    const g = G(); put(g, M(geo, C.leaf)); put(g, cy(.012, .9, C.dgreen, 12), [0, -.05, .02]);
    put(g, cy(.018, .2, C.dgreen, 12), [0, -.6, .01]);
    g.rotation.z = -.5; return stand(g, -.4, -.4);
  },
  gym() {
    const g = G(); put(g, cy(.035, 1.05, C.metal), [0, 0, 0], [0, 0, Math.PI / 2]); put(g, cy(.05, .32, C.dark), [0, 0, 0], [0, 0, Math.PI / 2]);
    for (const s of [-1, 1]) { put(g, puck(.22, .08, .02, C.black), [s * .25, 0, 0], [0, 0, -s * Math.PI / 2]); put(g, puck(.18, .07, .02, C.dark), [s * .33, 0, 0], [0, 0, -s * Math.PI / 2]); put(g, cy(.06, .04, C.metal), [s * .42, 0, 0], [0, 0, Math.PI / 2]); }
    g.rotation.set(0, .45, .25); return g;
  },
  flame() {
    const prof = [[0, 0], [.24, .03], [.36, .16], [.38, .34], [.32, .52], [.22, .7], [.1, .88], [0, 1.04]];
    const bend = (geo, k) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + Math.pow(Math.max(0, y - .35), 2) * k); } geo.computeVertexNormals(); return geo; };
    const L = (k) => bend(new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(q[0], q[1])), 64), k);
    const g = G(); put(g, M(L(.4), C.red), [0, 0, -.05], 0, [1, 1, .75]);
    put(g, M(L(-.3), C.orange), [-.03, 0, .06], 0, [.82, .82, .7]);
    put(g, M(L(.25), C.yellow), [0, 0, .16], 0, [.5, .5, .5]);
    return g;
  },
  pulse() {
    const g = G(); put(g, rb(.9, .62, .12, .08, C.white), [0, 0, 0]); put(g, rb(.78, .48, .01, .04, C.screen), [0, .02, .062]);
    const P = [[-.34, 0], [-.14, 0], [-.08, .15], [0, -.16], [.07, .08], [.12, 0], [.34, 0]].map(q => [q[0], q[1] + .02, .075]);
    put(g, tube(P, .018, C.led, false, 0));
    put(g, rb(.3, .05, .2, .02, C.lgray), [0, -.36, -.02]); return stand(g, -.4, -.15);
  },
  pill() {
    const g = G(); const c = G(); put(c, cy(.14, .28, C.white), [-.14, 0, 0], [0, 0, Math.PI / 2]); put(c, sp(.14, C.white), [-.28, 0, 0]);
    put(c, cy(.14, .28, C.red), [.14, 0, 0], [0, 0, Math.PI / 2]); put(c, sp(.14, C.red), [.28, 0, 0]);
    put(g, c, [0, .14, 0], [0, .5, .35]);
    put(g, puck(.17, .08, .035, C.white), [.25, 0, .35]); put(g, rb(.26, .01, .03, .005, C.lgray), [.25, .08, .35], [0, .5, 0]);
    return g;
  },
  food() {
    const g = G(); put(g, puck(.42, .13, .05, C.bun), [0, 0, 0]);
    put(g, puck(.45, .05, .02, C.leaf), [0, .12, 0]);
    put(g, puck(.44, .11, .045, C.patty), [0, .16, 0]);
    put(g, rb(.82, .02, .82, .01, C.yellow), [0, .28, 0], [0, Math.PI / 4, 0]);
    put(g, puck(.4, .045, .02, C.red), [0, .29, 0]);
    put(g, lathe([[0, 0], [.43, 0], [.44, .1], [.38, .23], [.22, .32], [0, .34]], C.bun), [0, .33, 0]);
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .1 + (i % 3) * .1; const y = .33 + .34 * Math.cos(r / .44 * 1.3) * .95; put(g, sp(.022, C.off), [Math.cos(a) * r, y, Math.sin(a) * r], [0, a, 0], [1.6, .6, 1]); }
    return g;
  },
  water() {
    const g = G(); put(g, lathe([[0, 0], [.22, .04], [.32, .16], [.33, .3], [.27, .46], [.14, .66], [0, .86]], mat(0x4E95E0, .18, 0, { envMapIntensity: 1.2 })), [0, 0, 0]);
    put(g, sp(.06, mat(0xFFFFFF, .2)), [-.12, .36, .24], 0, [.7, 1.4, .4]); return g;
  },
  /* MULTIMEDIA */
  play() { return tile(C.red, "play", C.white); },
  pause() { return tile(C.dark, "pause", C.white); },
  video() {
    const g = G(); put(g, rb(.7, .44, .42, .1, C.dark), [0, .22, 0]);
    put(g, cy(.15, .2, C.black), [0, .24, .28], [Math.PI / 2, 0, 0]); put(g, cy(.11, .02, C.glass), [0, .24, .38], [Math.PI / 2, 0, 0]); put(g, to(.13, .015, C.metal), [0, .24, .38]);
    put(g, rb(.04, .26, .32, .03, C.dgray), [-.38, .24, -.02], [0, -.2, 0]); put(g, rb(.01, .22, .28, .02, C.screen), [-.403, .24, -.02], [0, -.2, 0]);
    put(g, sp(.03, C.red), [.25, .46, .1]); put(g, rb(.16, .1, .2, .04, C.dark), [.05, .48, -.1]);
    g.rotation.y = .1; return g;
  },
  music() {
    const g = G(); const m = C.dark;
    put(g, sp(.12, m), [-.2, -.3, 0], [0, 0, .45], [1.3, .9, .7]); put(g, sp(.12, m), [.24, -.2, 0], [0, 0, .45], [1.3, .9, .7]);
    put(g, rb(.05, .62, .05, .02, m), [-.07, .0, 0]); put(g, rb(.05, .62, .05, .02, m), [.37, .1, 0]);
    barFromTo(g, [-.07, .3], [.37, .4], .1, m, 0, .06); barFromTo(g, [-.07, .17], [.37, .27], .06, m, 0, .06);
    return stand(g, -.4, -.15);
  },
  wifi() {
    const g = G(); put(g, rb(.82, .16, .5, .07, C.white), [0, .08, 0]);
    for (const x of [-.32, .32]) put(g, cy(.03, .52, C.dark, 16), [x, .38, -.2], [-.12, 0, x > 0 ? -.15 : .15]);
    for (let i = 0; i < 4; i++) put(g, sp(.018, i < 3 ? C.led : C.lgray), [-.2 + i * .1, .1, .25]);
    g.rotation.y = -.2; return g;
  },
  battery() {
    const g = G(); put(g, cy(.2, .74, C.dark), [0, 0, 0], [0, 0, Math.PI / 2]); put(g, cy(.205, .34, C.green), [-.18, 0, 0], [0, 0, Math.PI / 2]);
    put(g, cy(.08, .07, C.metal), [.41, 0, 0], [0, 0, Math.PI / 2]); put(g, cy(.18, .02, C.metal), [-.38, 0, 0], [0, 0, Math.PI / 2]);
    g.rotation.set(0, .5, 0); g.position.y = .2; return g;
  },
  mobile() {
    const g = G(); put(g, rb(.52, .98, .07, .1, C.dark), [0, 0, 0]); put(g, rb(.46, .9, .005, .08, C.screen), [0, 0, .037]);
    const cols = [C.teal, C.red, C.yellow, C.blue, C.green, C.purple, C.orange, C.lblue];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) put(g, rb(.09, .09, .01, .025, cols[(r * 3 + c) % 8]), [-.13 + c * .13, .28 - r * .14, .042]);
    put(g, rb(.12, .03, .01, .015, C.black), [0, .42, .042]);
    return stand(g, -.45, -.2);
  },
  refresh() {
    const g = G(); const R = .3, A = 2.3;
    for (const s of [.35, .35 + Math.PI]) { put(g, to(R, .065, C.teal, A), [0, 0, 0], [0, 0, s]); const e = s + A; put(g, cone(.14, .2, C.teal), [Math.cos(e) * R, Math.sin(e) * R, 0], [0, 0, e]); }
    return stand(g, -.4, -.15);
  },
  /* VARIOS */
  sun() {
    const g = G(); put(g, sp(.3, mat(0xF6C445, .45, 0, { emissive: 0xF59E0B, emissiveIntensity: .15 })), [0, 0, 0]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(g, cone(.07, .15, C.orange), [Math.cos(a) * .46, Math.sin(a) * .46, 0], [0, 0, a - Math.PI / 2]); }
    return stand(g, -.4, -.1);
  },
  moon() {
    const R = .45, cx = .22, cyy = .13, r = .36; const pts = [];
    const inO = (x, y) => x * x + y * y <= R * R + 1e-9, inI = (x, y) => (x - cx) ** 2 + (y - cyy) ** 2 <= r * r;
    // borde exterior: puntos del círculo grande fuera del pequeño; borde interior: puntos del pequeño dentro del grande
    const N = 360; let start = 0; for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2; if (inI(R * Math.cos(a), R * Math.sin(a)) && !inI(R * Math.cos(a + .02), R * Math.sin(a + .02))) { start = a + .02; break; } }
    for (let k = 0; k < N; k++) { const a = start + k / N * Math.PI * 2; const x = R * Math.cos(a), y = R * Math.sin(a); if (inI(x, y)) break; pts.push([x, y]); }
    const last = pts[pts.length - 1]; let b0 = Math.atan2(last[1] - cyy, last[0] - cx);
    for (let k = 1; k < N; k++) { const b = b0 - k / N * Math.PI * 2; const x = cx + r * Math.cos(b), y = cyy + r * Math.sin(b); if (!inO(x, y)) break; pts.push([x, y]); }
    const g = G(); put(g, ext(shapeOf(pts), .2, .035, mat(0xF2DC8C, .6)), [0, 0, 0]); return stand(g, -.4, -.15);
  },
  cloud() {
    const g = G(); const m = C.white;
    [[-.3, .18, 0, .22], [-.05, .3, -.02, .3], [.25, .22, 0, .24], [.05, .16, .1, .24], [-.18, .14, .12, .18]].forEach(([x, y, z, r]) => put(g, sp(r, m), [x, y, z]));
    put(g, rb(.86, .22, .42, .11, m), [-.02, .11, 0]); return g;
  },
  globe() {
    const g = G(); const ball = G(); put(ball, sp(.36, C.blue), [0, 0, 0]);
    [[.3, .4, .8, .2], [-.6, .1, .7, .17], [.1, -.5, .8, .15], [.7, -.2, .3, .14], [-.3, .7, .3, .12]].forEach(([x, y, z, r]) => { const v = new THREE.Vector3(x, y, z).normalize(); const c = sp(r, C.leaf); c.scale.set(1, .8, .3); c.position.copy(v.multiplyScalar(.35)); c.lookAt(v.clone().multiplyScalar(3)); ball.add(c); });
    put(g, ball, [0, .55, 0], [0, 0, .4]);
    put(g, to(.43, .022, C.brass, Math.PI * 1.1), [0, .55, 0], [0, 0, .4 - Math.PI * .05 + Math.PI / 2 * 0], [1, 1, 1]);
    put(g, cy(.03, .14, C.brass), [-.0, .1, 0]); put(g, puck(.22, .07, .02, C.dark), [0, 0, 0]);
    g.rotation.y = -.3; return g;
  },
  sparkles() {
    const star4 = (k) => { const s = new THREE.Shape(); const R = .5 * k, c = .1 * k; s.moveTo(0, R); s.quadraticCurveTo(c, c, R, 0); s.quadraticCurveTo(c, -c, 0, -R); s.quadraticCurveTo(-c, -c, -R, 0); s.quadraticCurveTo(-c, c, 0, R); return s; };
    const g = G(); put(g, ext(star4(1), .1, .03, C.gold), [-.1, -.05, 0]); put(g, ext(star4(.45), .08, .025, C.yellow), [.36, .34, .05]); put(g, ext(star4(.32), .06, .02, C.lyellow), [.38, -.36, .05]);
    return stand(g, -.4, -.15);
  },
  bolt() { const g = G(); put(g, ext(roundPoly([[.12, .56], [-.32, -.04], [-.02, -.04], [-.13, -.56], [.32, .08], [.02, .08]], .04), .14, .04, C.yellow), [0, 0, 0]); return stand(g, -.4, -.18); },
  bulb() {
    const g = G(); put(g, lathe([[0, .32], [.12, .33], [.13, .42], [.24, .58], [.29, .75], [.26, .92], [.14, 1.01], [0, 1.03]], mat(0xFFE9A8, .25, 0, { emissive: 0xFFC94D, emissiveIntensity: .45 })), [0, 0, 0]);
    put(g, cy(.13, .22, C.metal), [0, .2, 0]); for (let i = 0; i < 4; i++) put(g, to(.13, .014, C.metal), [0, .12 + i * .05, 0], [Math.PI / 2, 0, 0]);
    put(g, cy(.07, .07, C.dark, 32, .1), [0, .06, 0]); put(g, sp(.04, C.dark), [0, .02, 0]);
    g.rotation.z = .15; return g;
  },
  eye() {
    const g = G(); put(g, sp(.42, C.white), [0, 0, 0]);
    put(g, cy(.18, .03, C.teal), [0, 0, .4], [Math.PI / 2, 0, 0]); put(g, cy(.085, .035, C.black), [0, 0, .41], [Math.PI / 2, 0, 0]);
    put(g, sp(.035, C.white), [-.05, .05, .43]);
    return stand(g, -.5, -.25);
  },
};

/* extras del video (no están en los 96 conceptos) */
export const EXTRAS = {
  car() {
    const g = G(); put(g, rb(.62, .26, 1.0, .1, C.white), [0, .22, 0]);
    put(g, rb(.56, .24, .56, .1, C.white), [0, .42, -.06]); put(g, rb(.5, .02, .44, .01, C.dark), [0, .545, -.06]);
    put(g, rb(.5, .18, .03, .03, C.glass), [0, .43, .22], [-.5, 0, 0]); put(g, rb(.03, .14, .4, .02, C.glass), [-.285, .43, -.06]); put(g, rb(.03, .14, .4, .02, C.glass), [.285, .43, -.06]);
    put(g, rb(.48, .16, .03, .03, C.glass), [0, .42, -.345], [.4, 0, 0]);
    for (const z of [.3, -.32]) for (const x of [-.29, .29]) put(g, wheel(.12, .1), [x, .12, z]);
    put(g, rb(.1, .03, .02, .015, C.lit), [-.2, .28, .5]); put(g, rb(.1, .03, .02, .015, C.lit), [.2, .28, .5]); put(g, rb(.3, .06, .02, .02, C.dark), [0, .2, .505]);
    g.rotation.y = .5; return g;
  },
  mototaxi() {
    const g = G();
    put(g, rb(.66, .52, .66, .14, C.beige), [0, .56, -.12]);
    put(g, rb(.7, .06, .74, .03, C.beige), [0, .84, -.1]);
    put(g, rb(.02, .32, .44, .05, C.glass), [-.335, .58, -.12]); put(g, rb(.02, .32, .44, .05, C.glass), [.335, .58, -.12]);
    put(g, rb(.5, .28, .04, .05, C.glass), [0, .6, .22], [-.12, 0, 0]);
    put(g, rb(.62, .16, .62, .05, C.beige), [0, .28, -.12]);
    put(g, rb(.26, .22, .3, .1, C.beige), [0, .26, .32]);
    put(g, cy(.045, .03, C.lit), [-.07, .32, .48], [Math.PI / 2, 0, 0]); put(g, cy(.045, .03, C.lit), [.07, .32, .48], [Math.PI / 2, 0, 0]);
    put(g, wheel(.1, .07), [0, .1, .4]); put(g, wheel(.11, .07), [-.3, .11, -.3]); put(g, wheel(.11, .07), [.3, .11, -.3]);
    g.rotation.y = .5; return g;
  },
  moto() {
    const g = G(); put(g, wheel(.15, .08), [0, .15, .36]); put(g, wheel(.15, .08), [0, .15, -.34]);
    put(g, rb(.2, .14, .46, .06, C.lgray), [0, .3, -.12]); put(g, rb(.22, .08, .34, .04, C.dark), [0, .42, -.16]);
    put(g, rb(.16, .42, .1, .05, C.lgray), [0, .38, .26], [-.3, 0, 0]); put(g, cy(.015, .4, C.dark), [0, .64, .3], [0, 0, Math.PI / 2]);
    put(g, cy(.05, .03, C.lit), [0, .56, .37], [Math.PI / 2, 0, 0]);
    put(g, rb(.3, .24, .3, .03, C.dgray), [0, .58, -.38]);
    g.rotation.y = .6; return g;
  },
  briefcase() {
    const g = G(); put(g, rb(.9, .56, .3, .06, C.dark), [0, .28, 0]); put(g, rb(.92, .04, .31, .02, C.black), [0, .4, 0]);
    put(g, tube([[-.14, .56, 0], [-.12, .66, 0], [.12, .66, 0], [.14, .56, 0]], .03, C.lgray, false, .2));
    for (const x of [-.25, .25]) put(g, rb(.08, .06, .02, .01, C.brass), [x, .4, .16]);
    g.rotation.y = -.3; return g;
  },
};
function shapeOf(pts) { const s = new THREE.Shape(); s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath(); return s; }
export const ALL = { ...MODELS, ...EXTRAS };
