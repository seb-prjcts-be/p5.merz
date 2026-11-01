// An editable vector composition of planes, lines and geometric words.
let work;

function setup() {
  createCanvas(700, 700).parent('example');
  noLoop();
  const farbe = Merz.farbe;
  work = Merz.create({ width: 700, height: 700 });
  work.plane(390, 70, 220, 290, { color: farbe.blau });
  work.line(60, 405, 640, 405, { color: farbe.rot, strokeWeight: 12 });
  work.text('FORM', 60, 120, { size: 120, spacing: 18 });
  work.text('SPACE', 520, 620, { size: 42, spacing: 10, angle: -90 });
  describe('FORM in geometric letters with a blue plane, a red horizontal line and the vertical word SPACE.');
  document.getElementById('save-example').addEventListener('click', () => work.downloadSVG());
}

function draw() {
  work.draw();
}
