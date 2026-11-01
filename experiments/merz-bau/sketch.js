// With p5.js and p5.merz.js loaded. WEBGL mode.
// A column that grows for twelve years. Letters, parts and a found piece
// arrive each year; every third year white plaster covers everything.
// The earlier years stay inside as grottoes.

const seed = 1923;
const years = 12;
const floorY = 300;
let jahr = 11;
let schnitt = 0;
let pieces = [];
let crusts = [];
let fund;

async function setup() {
  const canvas = createCanvas(600, 820, WEBGL);
  if (document.getElementById('drawing')) canvas.parent('drawing');
  pixelDensity(1);
  // Try another number: the catalogue has 28 pieces.
  const piece = await Merz.fundsachen('017', { variant: 'scan' });
  fund = piece.bau();
  randomSeed(seed);
  plan();
  controls();
  camera(0, -120, 1400, 0, 20, 0, 0, 1, 0);
}

function plan() {
  const farbe = Merz.farbe;
  const inks = [farbe.schwarz, farbe.schwarz, farbe.schwarz, farbe.rot, farbe.rot, farbe.blau, farbe.gelb, farbe.grau];
  const words = ['MERZ', 'NASCI', '1923', 'i', 'DADA', '21', 'KDEE', 'MERZ'];
  const parts = [['R', 'bowl'], ['K', 'upper-branch'], ['A', 'crossbar'], ['Y', 'fork'], ['B', 'crossbar'], ['E', 'crossbar']];
  for (let year = 1; year <= years; year++) {
    const top = floorY - year * 52;
    const count = 2 + floor(random(3));
    for (let i = 0; i < count; i++) {
      let paths;
      if (random() < 0.45) {
        paths = Merz.satz(random(words), { size: random(28, 70), weight: random(0.35, 0.9) }).paths;
      } else {
        const [letter, name] = random(parts);
        try { paths = Merz.bauteil(letter, name, { size: random(44, 100), weight: random(0.3, 0.8) }).paths; }
        catch (e) { paths = Merz.satz(letter, { size: random(50, 100) }).paths; }
      }
      const built = beams(paths, random(6, 26));
      pieces.push({
        year, geometry: built.geometry, radius: built.radius,
        x: random(-55, 55), y: top + random(0, 40), z: random(-55, 55),
        ry: random([0, HALF_PI, PI, -HALF_PI, QUARTER_PI, -QUARTER_PI]),
        rz: random([0, 0, 0, HALF_PI, -HALF_PI, random(-0.3, 0.3)]),
        color: random(inks)
      });
    }
    // One found piece a year, as a thin printed plane.
    pieces.push({
      year, image: fund, w: random(50, 110),
      x: random(-50, 50), y: top + random(0, 30), z: random(-50, 50),
      ry: random([0, HALF_PI, PI, -HALF_PI]), rz: random([0, 0, HALF_PI, random(-0.4, 0.4)])
    });
    // Every third year the plaster comes.
    if (year % 3 === 0) crusts.push(crust(year));
  }
}

// Each path of a letter becomes a row of beams, square caps included.
// The piece is centred so it can turn around its own middle.
function beams(paths, depth) {
  const xs = paths.flatMap(path => path.points.map(point => point[0]));
  const ys = paths.flatMap(path => path.points.map(point => point[1]));
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const reach = Math.max(Math.max(...xs) - cx, Math.max(...ys) - cy) + Math.max(...paths.map(path => path.width)) / 2;
  const geometry = buildGeometry(() => {
    for (const path of paths) {
      const w = path.width;
      for (let i = 1; i < path.points.length; i++) {
        const [ax, ay] = path.points[i - 1];
        const [bx, by] = path.points[i];
        const len = dist(ax, ay, bx, by);
        push();
        translate((ax + bx) / 2 - cx, (ay + by) / 2 - cy, 0);
        rotateZ(atan2(by - ay, bx - ax));
        box(len + w, w, depth);
        pop();
      }
    }
  });
  return { geometry, radius: Math.hypot(reach, depth / 2) };
}

// A faceted box around everything built so far, with a few openings.
function crust(year) {
  const inside = pieces.filter(p => p.year <= year);
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of inside) {
    const r = Math.min(p.image ? p.w * 0.6 : p.radius, 70);
    min = [Math.min(min[0], p.x - r), Math.min(min[1], p.y - r), Math.min(min[2], p.z - r)];
    max = [Math.max(max[0], p.x + r), Math.max(max[1], p.y + r), Math.max(max[2], p.z + r)];
  }
  // Wholly or partly: a covering rarely reaches all the way up.
  max[1] = floorY;
  min[1] = lerp(min[1] - 14, floorY, random([0, 0, 0.15, 0.3]));
  // Each covering stands a little further out than the one before.
  const grow = 4 + year * 1.5;
  min = [Math.max(min[0], -120) - grow, min[1], Math.max(min[2], -120) - grow];
  max = [Math.min(max[0], 120) + grow, max[1], Math.min(max[2], 120) + grow];
  const tris = [];
  const n = 3;
  // Six faces: normal axis, sign.
  for (const [axis, sign] of [[0, 1], [0, -1], [1, -1], [2, 1], [2, -1]]) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3;
    const grid = [];
    for (let i = 0; i <= n; i++) {
      grid.push([]);
      for (let j = 0; j <= n; j++) {
        const point = [0, 0, 0];
        point[axis] = sign > 0 ? max[axis] : min[axis];
        point[u] = lerp(min[u], max[u], i / n);
        point[v] = lerp(min[v], max[v], j / n);
        const interior = i > 0 && i < n && j > 0 && j < n;
        if (interior) {
          point[axis] += sign * random(6, 34);
          point[u] += random(-16, 16);
          point[v] += random(-16, 16);
        } else {
          point[axis] += sign * random(-3, 6);
        }
        grid[i].push(point);
      }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (random() < 0.2) continue; // an opening
      const a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
      tris.push([a, b, c], [a, c, d]);
    }
  }
  const tint = random(236, 246);
  return { year, tris: tris.map(t => ({ points: t, cx: (t[0][0] + t[1][0] + t[2][0]) / 3 })), color: [tint, tint - 1, tint - 7] };
}

function draw() {
  background(Merz.farbe.grau);
  orbitControl(1, 1, 0.1);
  ambientLight(120);
  directionalLight(170, 168, 160, -0.5, 0.7, -0.5);
  directionalLight(70, 70, 78, 0.7, -0.1, 0.7);
  translate(0, 40, 0);
  // The floor.
  push(); noStroke(); fill(236, 236, 230); translate(0, floorY + 1, 0); rotateX(HALF_PI); plane(900, 900); pop();
  noStroke();
  for (const p of pieces) {
    if (p.year > jahr) continue;
    push();
    translate(p.x, p.y, p.z);
    rotateY(p.ry);
    rotateZ(p.rz);
    if (p.image) {
      texture(p.image);
      plane(p.w, p.w * p.image.height / p.image.width);
    } else {
      fill(p.color);
      model(p.geometry);
    }
    pop();
  }
  const cutX = map(schnitt, 0, 100, 170, -170);
  for (const c of crusts) {
    if (c.year > jahr) continue;
    fill(...c.color);
    beginShape(TRIANGLES);
    for (const t of c.tris) {
      if (t.cx > cutX) continue;
      const [a, b, d] = t.points;
      const nrm = faceNormal(a, b, d);
      normal(...nrm);
      vertex(...a); vertex(...b); vertex(...d);
    }
    endShape();
  }
}

function faceNormal(a, b, c) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const len = Math.hypot(...n) || 1;
  return n.map(k => k / len);
}

function controls() {
  const bind = (id, apply) => {
    const input = document.getElementById(id);
    if (!input) return;
    const out = document.getElementById(id + '-out');
    const update = () => { apply(Number(input.value)); if (out) out.textContent = input.value; };
    input.addEventListener('input', update);
    update();
  };
  bind('jahr', v => { jahr = v; });
  bind('schnitt', v => { schnitt = v; });
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('saeule-' + seed, 'png');
  if (keyCode === RIGHT_ARROW) jahr = min(years, jahr + 1);
  if (keyCode === LEFT_ARROW) jahr = max(1, jahr - 1);
}
