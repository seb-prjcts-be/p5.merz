// Blatt and Bau: visible output, years, the cut, geometry, global and instance mode.
async function setup() {
  createCanvas(300, 300, WEBGL); pixelDensity(1); noLoop();
  const results = [];
  const check = (name, ok) => results.push([name, ok]);
  const grotesk = await Merz.schrift('grotesk');
  check('schrift gives a p5.Font', !!grotesk && typeof grotesk.textToModel === 'function');
  check('schrift is cached', await Merz.schrift('grotesk') === grotesk);
  const image = createGraphics(40, 20); image.pixelDensity(1); image.background(200, 30, 30);
  const geometry = buildGeometry(() => box(20));
  function column(options, p) {
    const bau = Merz.bau({ seed: 21, grund: [120, 120], hoehe: 40, boden: 120, ...options }, p);
    bau.fund('MERZ', { size: 40, color: Merz.farbe.rot });
    bau.fund(Merz.bauteil('R', 'bowl', { size: 60 }), { color: Merz.farbe.blau });
    bau.fund('Merz', { font: grotesk, size: 24, weight: 700 });
    bau.jahr();
    bau.fund(image, { breite: 60 });
    bau.fund(Merz.ausschnitt(Merz.satz('AB', { size: 50 }), 0, 0, 60, 50));
    bau.fund(geometry, { x: 0, y: 70, z: 0 });
    bau.gips({ deels: 1, open: 0.1 });
    bau.jahr();
    bau.fund('21', { size: 30 });
    return bau;
  }
  const dark = p => { p.loadPixels(); let n = 0; for (let i = 0; i < p.pixels.length; i += 4) if (p.pixels[i] + p.pixels[i + 1] + p.pixels[i + 2] < 600) n++; return n; };
  const snapshot = p => { p.loadPixels(); return Uint8ClampedArray.from(p.pixels); };
  const differ = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) n++; return n; };
  function view(p, bau, options) {
    p.push(); p.background(247, 247, 242); p.camera(0, -60, 520, 0, 20, 0, 0, 1, 0); bau.zeichne(options, p); p.pop();
  }
  const bau = column({}, globalThis);
  check('teile lists seven pieces', bau.teile().length === 7);
  view(globalThis, bau, { jahr: 3 });
  const full = snapshot(globalThis), fullDark = dark(globalThis);
  check('visible output', fullDark > 400);
  view(globalThis, bau, { jahr: 1 });
  const early = snapshot(globalThis);
  check('year one shows less', dark(globalThis) < fullDark && differ(early, full) > 200);
  view(globalThis, bau, { jahr: 3, schnitt: 1 });
  const cut = snapshot(globalThis);
  check('the cut takes the plaster away', differ(cut, full) > 200);
  view(globalThis, bau, { jahr: 3 });
  check('the same view draws the same pixels', differ(snapshot(globalThis), full) === 0);
  const model = bau.geometrie({ jahr: 3 });
  check('geometrie returns geometry', !!model && Array.isArray(model.vertices) && model.vertices.length > 100 && Array.isArray(model.faces) && model.faces.length > 50);
  const noLight = snapshot(globalThis);
  view(globalThis, bau, { jahr: 3, licht: false });
  check('licht false changes the shading', differ(snapshot(globalThis), noLight) > 100);
  let threw = false;
  try { const flat = createGraphics(50, 50); bau.zeichne({}, flat); flat.remove(); } catch (error) { threw = /WEBGL/.test(error.message); }
  check('a 2D context is refused', threw);
  // A sheet in 2D, drawn on graphics, in two years.
  function sheet(p) {
    const blatt = Merz.blatt({ seed: 5, width: 200, height: 200 }, p);
    blatt.fund('MERZ', { size: 50 });
    blatt.fund('1924', { font: 'grotesk', size: 16 });
    blatt.jahr();
    blatt.fund(Merz.bauteil('K', 'upper-branch', { size: 60 }), { color: Merz.farbe.blau, angle: 20 });
    blatt.fund(Merz.ausschnitt(Merz.satz('AB', { size: 50 }), 0, 0, 60, 50), { x: 100, y: 120 });
    blatt.fund(image, { x: 10, y: 150 });
    blatt.ueberbauen({ deckend: .3, teile: 2, color: Merz.farbe.gelb });
    return blatt;
  }
  const g = createGraphics(200, 200); g.pixelDensity(1);
  const blatt = sheet(globalThis);
  const paint = (target, options) => { target.background(255); blatt.zeichne(options, target); return target.drawingContext.getImageData(0, 0, 200, 200).data; };
  const sheetFull = paint(g, {}), sheetEarly = paint(g, { jahr: 1 });
  check('sheet draws', sheetFull.some((v, i) => i % 4 === 0 && v < 100));
  check('sheet years differ', differ(sheetEarly, sheetFull) > 50);
  check('sheet covering shows yellow', (() => { for (let i = 0; i < sheetFull.length; i += 4) if (sheetFull[i] > 200 && sheetFull[i + 1] > 150 && sheetFull[i + 2] < 100) return true; return false; })());
  new p5(p => { p.setup = () => {
    p.createCanvas(300, 300, p.WEBGL); p.pixelDensity(1); p.noLoop();
    const other = column({}, p);
    view(p, other, { jahr: 3 });
    const b = snapshot(p);
    check('instance mode draws the same column', differ(b, full) < full.length / 4 * 0.01);
    const h = p.createGraphics(200, 200); h.pixelDensity(1);
    const second = sheet(p);
    h.background(255); second.zeichne({}, h);
    const c = h.drawingContext.getImageData(0, 0, 200, 200).data;
    check('instance sheet matches global sheet', differ(c, sheetFull) === 0);
    h.remove();
    document.getElementById('result').textContent = results.map(([name, ok]) => (ok ? 'PASS ' : 'FAIL ') + name).join('\n');
  }; });
}
