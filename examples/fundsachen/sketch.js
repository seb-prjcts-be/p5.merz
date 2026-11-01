// Found pieces from the cover of Merz 8/9 (1924) beside the geometric alphabet.
async function setup() {
  createCanvas(600, 760).parent('drawing');
  noLoop();
  const farbe = Merz.farbe;
  background(farbe.grau);

  // Five pieces loaded by catalogue number: the M, the 8, the 9, the blue rule and the year.
  const [m, eight, nine, rule, year] = await Promise.all(
    ['016', '020', '021', '025', '027'].map(id => Merz.fundsachen(id))
  );

  // The found M is 159 by 319 pixels. A geometric M of the same height stands next to it.
  Merz.stempel(m, 40, 50);
  Merz.satz('M', 240, 50, { size: 319, weight: 0.5, color: farbe.rot });

  // The blue rule, torn and repeated down the page, each copy shifted a little.
  const torn = Merz.riss(rule, { amount: 0.6, seed: 9 });
  Merz.stempel(torn, 40, 400, { repeat: 4, stepY: 28, offsetX: 24, scale: 0.6 });

  // The 8 split in two and pulled apart; the 9 whole; the year three times, smaller each time.
  const halves = Merz.splitter(eight, { rows: 2 });
  Merz.stempel(halves[0], 40, 530, { scale: 0.8 });
  Merz.stempel(halves[1], 64, 530 + halves[1].y * 0.8 + 14, { scale: 0.8 });
  Merz.stempel(nine, 200, 530, { scale: 0.8 });
  Merz.stempel(year, 330, 540, { repeat: 3, stepY: 52, scale: [0.9, 0.7, 0.5] });

  Merz.stempel('016 · 020 · 021 · 025 · 027', 40, 735, { size: 12, weight: 500, stretch: 87, spacing: 4 });
  describe('A found M from the cover of Merz 8/9 beside a red geometric M of the same height, four torn blue rules, the 8 split in two, the 9, the year 1924 three times and the catalogue numbers.');
}
