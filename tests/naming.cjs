const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
for (const file of ['p5.merz.js','p5.merz.min.js']) {
  const ctx={};vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
  assert.deepEqual(Object.keys(ctx).sort(), ['Merz', 'MerzComposition']);
  assert.equal(ctx.Merz.version, '0.3.0');
  for(const oldName of ['geometry','parts','part','fragment','tear','surface','toImage']) assert.equal(Object.hasOwn(ctx.Merz,oldName),false);
  for (const name of ['satz', 'bauteile', 'bauteil', 'schnitt', 'riss', 'andruck', 'ausschnitt', 'rundschnitt', 'blatt', 'bau', 'schrift']) assert.equal(typeof ctx.Merz[name], 'function');
  assert.equal(typeof ctx.Merz.riss,'function');
  const farbe = ctx.Merz.settings();
  assert.deepEqual(ctx.Merz.farbe, farbe);
  assert.ok(Object.isFrozen(ctx.Merz.farbe));
  assert.equal(ctx.Merz.farbe, ctx.Merz.farbe);
  assert.equal(farbe.rot, ctx.Merz.palette.red);
  assert.equal(farbe.schwarz, ctx.Merz.palette.ink);
  assert.equal(farbe.grau, ctx.Merz.palette.paper);
  assert.equal(farbe[1], farbe.rot);
  assert.equal(farbe[2], farbe.schwarz);
  assert.equal(farbe[0], farbe.grau);
  assert.equal(farbe[0], farbe.grau);
  assert.equal(ctx.Merz.settings({ grau: '#999999' }).grau, '#999999');
  assert.ok(Object.isFrozen(farbe));
  const custom = ctx.Merz.settings({ rot: '#c4382d', grau: '#f1eddf' });
  assert.equal(custom[1], '#c4382d');
  assert.equal(custom[0], '#f1eddf');
  assert.equal(custom.schwarz, farbe.schwarz);
  assert.equal(ctx.Merz.farbe.rot, '#b92d26');
  assert.equal(ctx.Merz.settings().rot, farbe.rot);
  assert.notEqual(ctx.Merz.settings(), farbe);
  for (const invalid of [null, [], { red: '#ffffff' }, { rot: 'red' }, { grau: '#fff' }]) {
    assert.throws(() => ctx.Merz.settings(invalid));
  }
}
console.log('Merz naming: source, min-build and public API names passed.');
