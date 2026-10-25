// An editable vector composition of planes, lines and geometric words.
// The two words come from the cover of Merz 8/9 (1924).
let work, natur, turned = true;

function setup() {
  createCanvas(700, 700).parent('example');
  noLoop();
  const farbe = Merz.farbe;
  work = Merz.create({ width: 700, height: 700 });
  work.plane(390, 70, 220, 290, { color: farbe.blau });
  work.line(60, 405, 640, 405, { color: farbe.rot, strokeWeight: 12 });
  work.text('NASCI', 60, 120, { size: 105, spacing: 18 });
  // Composition angles are in degrees; -90 turns the word to read upward. Keep the id to edit it later.
  natur = work.text('NATUR', 520, 620, { size: 42, spacing: 10, angle: -90 });
  describe('NASCI in geometric letters with a blue plane, a red horizontal line and the vertical word NATUR.');
  document.getElementById('save-example').addEventListener('click', () => work.downloadSVG());
}

function draw() {
  work.draw();
}

// A click moves NATUR under the line and lays it flat; the next click puts it back. One update() by id.
function mousePressed() {
  turned = !turned;
  work.update(natur, turned ? { x: 520, y: 620, angle: -90 } : { x: 60, y: 440, angle: 0 });
  redraw();
}
