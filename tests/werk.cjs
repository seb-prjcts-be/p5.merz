const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// A recording p5 stand-in: every method exists and counts its calls.
function recorder() {
  const calls = [];
  const target = { width: 600, height: 760, CORNER: 'corner', PROJECT: 'square', MITER: 'miter', LEFT: 'left', BASELINE: 'alphabetic', NORMAL: 'normal', TRIANGLES: 'triangles' };
  return { calls, p: new Proxy(target, { get(object, key) { if (key in object) return object[key]; return (...args) => { calls.push([key, args]); return 0; }; } }) };
}
const plain = value => JSON.parse(JSON.stringify(value));
let reference;
for (const file of ['p5.merz.js', 'p5.merz.min.js']) {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
  const M = ctx.Merz;
  // Blatt: ids, years, seeded placement, coverings and drawing up to a year.
  const blatt = M.blatt({ seed: 7, width: 600, height: 760 });
  assert.equal(blatt.jetzt, 1);
  assert.equal(blatt.fund('MERZ', { size: 80 }), 'fund-1');
  assert.equal(blatt.fund('rrrt', { font: 'grotesk', size: 40, color: M.farbe.rot }), 'fund-2');
  assert.equal(blatt.jahr(2).jetzt, 3);
  assert.equal(blatt.fund(M.bauteil('R', 'bowl'), { x: 10, y: 20, angle: 90 }), 'fund-3');
  assert.equal(blatt.fund(M.splitter(M.satz('AB'))[0]), 'fund-4');
  assert.equal(blatt.ueberbauen({ deckend: .4, teile: 2, color: M.farbe.gelb }), 'decke-5');
  const teile = plain(blatt.teile());
  assert.deepEqual(teile.map(t => t.jahr), [1, 1, 3, 3]);
  assert.deepEqual(teile.map(t => t.kind), ['paths', 'text', 'paths', 'fragment']);
  assert.deepEqual([teile[2].x, teile[2].y, teile[2].angle], [10, 20, 90]);
  for (const piece of teile) { assert.ok(piece.x >= 0 && piece.x <= 600); assert.ok(piece.y >= 0 && piece.y <= 760 + 40); }
  const again = M.blatt({ seed: 7, width: 600, height: 760 });
  again.fund('MERZ', { size: 80 }); again.fund('rrrt', { font: 'grotesk', size: 40, color: M.farbe.rot }); again.jahr(2);
  again.fund(M.bauteil('R', 'bowl'), { x: 10, y: 20, angle: 90 }); again.fund(M.splitter(M.satz('AB'))[0]);
  assert.deepEqual(plain(again.teile()), teile, 'same seed, same placement');
    const sheet = M.blatt({ seed: 7, width: 600, height: 760 });
  sheet.fund('MERZ', { size: 80 }); sheet.fund('rrrt', { font: 'grotesk', size: 40 }); sheet.jahr(2); sheet.fund(M.bauteil('R', 'bowl')); sheet.fund({ width: 40, height: 30, get() { return this; } }); sheet.ueberbauen({ teile: 2 });
  const early = recorder(), late = recorder();
  sheet.zeichne({ jahr: 1 }, early.p);
  sheet.zeichne({}, late.p);
  const count = (calls, name) => calls.filter(([key]) => key === name).length;
  assert.ok(count(early.calls, 'push') > 0);
  assert.ok(count(late.calls, 'push') > count(early.calls, 'push'), 'later years draw more');
  assert.equal(count(early.calls, 'rect'), 0);
  assert.equal(count(late.calls, 'rect'), 2, 'the covering draws its planes');
  assert.equal(count(late.calls, 'image'), 1, 'an image draws once');
  assert.equal(count(late.calls, 'text') > 0, true, 'text goes through stempel');
  for (const bad of [() => M.blatt({ seed: 1.5 }), () => M.blatt({ size: 3 }), () => blatt.fund('MERZ', { z: 1 }), () => blatt.fund({ vertices: [], faces: [] }), () => blatt.fund(''), () => blatt.fund(7), () => blatt.jahr(0), () => blatt.ueberbauen({ deckend: 2 }), () => blatt.ueberbauen({ teile: 0 }), () => sheet.zeichne({ jahr: -1 }, early.p), () => sheet.zeichne({ schnitt: 1 }, early.p)]) assert.throws(bad);
  // Bau: footprint, years as height bands, radius, plaster and the cut.
  const bau = M.bau({ seed: 1923, grund: [160, 160], hoehe: 50, boden: 300 });
  assert.equal(bau.fund('MERZ', { size: 60, color: M.farbe.rot }), 'fund-1');
  assert.equal(bau.fund(M.bauteile('K'), { drehung: [0, 45, 0], tiefe: 20 }), 'fund-2');
  const image = { width: 200, height: 100, get() { return this; } };
  assert.equal(bau.fund(image, { breite: 80 }), 'fund-3');
  const model = { vertices: [{ x: -5, y: -10, z: -2 }, { x: 5, y: 10, z: 2 }], faces: [[0, 1, 1]] };
  assert.equal(bau.fund(model, { x: 1, y: 2, z: 3 }), 'fund-4');
  assert.throws(() => bau.gips({ deels: 1.2 }));
  bau.jahr();
  assert.equal(bau.fund('21', { size: 40 }), 'fund-5');
  assert.equal(bau.gips({ deels: .8, open: .2 }), 'decke-6');
  const stuecke = plain(bau.teile());
  assert.deepEqual(stuecke.map(s => s.jahr), [1, 1, 1, 1, 2]);
  assert.deepEqual(stuecke.map(s => s.kind), ['paths', 'paths', 'image', 'model', 'paths']);
  for (const piece of stuecke.slice(0, 4)) { assert.ok(piece.y >= 250 && piece.y <= 300 || piece.id === 'fund-4', 'year one band'); assert.ok(Math.abs(piece.x) <= 80 && Math.abs(piece.z) <= 80); }
  assert.ok(stuecke[4].y >= 200 && stuecke[4].y <= 250, 'year two sits higher');
  assert.deepEqual(plain(stuecke[1].drehung), [0, 45, 0]);
  assert.equal(stuecke[1].depth, 20);
  assert.deepEqual([stuecke[2].width, stuecke[2].height, stuecke[2].depth], [80, 40, 0]);
  assert.deepEqual([stuecke[3].x, stuecke[3].y, stuecke[3].z, stuecke[3].width, stuecke[3].height, stuecke[3].depth], [1, 2, 3, 10, 20, 4]);
  assert.ok(stuecke[0].radius > 100 && stuecke[0].radius < 170, 'half the diagonal of the word');
  assert.ok(stuecke.every(s => Number.isFinite(s.radius) && s.radius > 0));
  const twin = M.bau({ seed: 1923, grund: [160, 160], hoehe: 50, boden: 300 });
  twin.fund('MERZ', { size: 60, color: M.farbe.rot }); twin.fund(M.bauteile('K'), { drehung: [0, 45, 0], tiefe: 20 }); twin.fund(image, { breite: 80 }); twin.fund(model, { x: 1, y: 2, z: 3 }); twin.jahr(); twin.fund('21', { size: 40 });
  assert.deepEqual(plain(twin.teile()), stuecke, 'same seed, same column');
  const cover = bau._items.find(item => item.type === 'decke');
  assert.ok(cover.tris.length > 40 && cover.tris.length < 90, 'five faces of nine cells, some open');
  assert.equal(cover.max[1], 300, 'plaster stands on the floor');
  twin.gips();
  assert.ok(cover.min[1] < 300 && cover.min[1] > twin._items.at(-1).min[1], 'deels leaves the top open');
  for (const tri of cover.tris) { assert.equal(tri.points.length, 3); assert.ok(Math.abs(Math.hypot(...tri.normal) - 1) < 1e-9); }
  assert.equal(bau._cut(bau._items, 0), Infinity);
  assert.ok(bau._cut(bau._items, 1) < cover.min[0]);
  assert.ok(bau._cut(bau._items, .5) > cover.min[0] && bau._cut(bau._items, .5) < cover.max[0]);
  for (const bad of [() => M.bau({ grund: [1] }), () => M.bau({ hoehe: 0 }), () => bau.fund('MERZ', { font: 'grotesk' }), () => bau.fund('MERZ', { breite: 10 }), () => bau.fund(image, { tiefe: 10 }), () => bau.fund(model, { tiefe: 10 }), () => bau.fund('A', { drehung: [1, 2] }), () => bau.zeichne({ schnitt: 2 }, recorder().p), () => bau.zeichne({}, recorder().p), () => bau.geometrie({}, recorder().p), () => M.bau().gips()]) assert.throws(bad);
  // A sheet refuses a p5.Geometry; a column accepts text only as a p5.Font.
  assert.throws(() => M.blatt({ width: 10, height: 10 }).fund(model), /Merz\.bau/);
  assert.throws(() => bau.fund('MERZ', { font: 'grotesk' }), /schrift/);
  const fontLike = { textToModel() {} };
  assert.equal(bau.fund('MERZ', { font: fontLike, size: 30 }), 'fund-7');
  assert.equal(bau.teile().at(-1).kind, 'text');
  // schrift validates without a browser.
  assert.rejects(M.schrift('fraktur'));
  assert.rejects(M.schrift('grotesk', { size: 3 }));
  const snapshot = JSON.stringify([teile, stuecke]);
  if (reference === undefined) reference = snapshot; else assert.equal(snapshot, reference, 'source and min agree');
}
console.log('Werk: blatt and bau ids, years, seeded placement, coverings, plaster, cut, validation and source/min parity passed.');
