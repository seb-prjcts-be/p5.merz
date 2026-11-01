# p5.merz

[Showcase](https://seb-prjcts-be.github.io/p5.merz/) · [Examples](https://seb-prjcts-be.github.io/p5.merz/docs/examples.html) · [Bauteile](https://seb-prjcts-be.github.io/p5.merz/docs/bauteile.html) · [Fundsachen](https://seb-prjcts-be.github.io/p5.merz/docs/fundsachen.html) · [Guide](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html) · [About](https://seb-prjcts-be.github.io/p5.merz/docs/about.html)

`p5.merz` gives you graphic building blocks for your own p5.js sketches: a geometric alphabet drawn from paths, named letter parts you can pull apart in a loop, rectangular and oval cuts, inward-torn edges, text stamps from a small printer's case, subtle paper and ink variation, and 28 found pieces cut from scans of Kurt Schwitters' magazine *Merz* (1923–1932). The library handles the repeated mechanics; you draw, combine and place everything in ordinary p5 code. Take an R apart and keep only its bowl, tear a word into four strips, or put the M from the cover of *Merz* 8/9 (1924) next to an M of your own.

The German function names (`satz`, `bauteile`, `schnitt`, `riss`, `andruck`, `stempel`, `fundsachen`) are a nod to Schwitters' studio vocabulary, in the same spirit as `p5.gysin`. [About](https://seb-prjcts-be.github.io/p5.merz/docs/about.html) tells where the affection comes from.

## Install

Load p5.js, then the library, then your sketch. Keep `assets/fonts/` next to the library file; it holds the two bundled fonts. `assets/fundsachen/` holds the found pieces, for sketches that use them.

```html
<script src="vendor/p5-2.3.4.min.js"></script>
<script src="p5.merz.js"></script>
<script src="sketch.js"></script>
```

The examples pin p5.js 2.3.4, so a sketch that works today works next year. The library uses the p5.js 2.x setup hook to load its fonts before `setup()`; see [Instance mode and modules](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#instance-mode) for a late or module load. `p5.merz.min.js` is the built copy of `p5.merz.js`.

## Quick start

Slice a geometric word into strips, tear their edges, and stamp them alongside a repeated letter part:

```js
function setup() {
  createCanvas(600, 760);
  noLoop();
  const farbe = Merz.farbe;
  background(farbe.grau);

  const word = Merz.satz('MERZ', { size: 118, weight: 0.7 });
  const strips = Merz.splitter(word, { rows: 4 });
  for (let i = 0; i < strips.length; i++) {
    const torn = Merz.riss(strips[i], { amount: 0.35, seed: 3 + i });
    Merz.stempel(torn, 40 + i * 12, 50 + strips[i].y + i * 7, {
      color: i % 2 ? farbe.schwarz : farbe.rot
    });
  }

  const fork = Merz.bauteil('Y', 'fork', { size: 40, weight: 0.4 });
  Merz.stempel(fork, 40, 260, { repeat: 8, stepX: 44, color: farbe.blau });
}
```

Change the word, the number of strips or a seed and run again.

## Letters and parts

`Merz.satz('MERZ', { size: 100 })` returns the geometric alphabet as paths: our own drawings for 26 letters, numerals and punctuation. `Merz.bauteile('R')` returns a letter's named parts, and `Merz.bauteil('R', 'bowl')` picks one of them. Pass `x` and `y` to draw directly, pass them to `stempel()`, or draw the points yourself with `vertex()`. [Geometry](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#geometry) and [Bauteile](https://seb-prjcts-be.github.io/p5.merz/docs/bauteile.html).

## Cut and tear

`Merz.ausschnitt(source, x, y, width, height)` cuts a rectangle, `rundschnitt()` an oval, `schnitt()` your own convex outline, and `splitter()` a grid of pieces. `Merz.riss(piece, { amount, seed })` tears the edge inward. Sources can be images, graphics, geometry, letter parts or other fragments. `piece.bau()` returns a raster `p5.Image`. [Fragments](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#fragments).

## Stamps

`Merz.stempel(source, x, y, options)` stamps text from the printer's case: `font` is `grotesk` (Archivo, the default) or `antiqua` (Bodoni Moda), with `weight` from 100 to 900 and `stretch` from 62 to 125. Pass an array of strings for multiple lines, with `leading`, `spacing` and `align` (`left`, `center` or `right`). The same call stamps geometry, letter parts and cut fragments, repeated with `repeat`, `stepX`, `stepY` and `offsetX`. `mirror: true` turns a piece over left to right, in place; a list such as `mirror: [false, true]` turns every second copy. [Stempel](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#stempel).

## Surface

`Merz.andruck(image, { ink, paper, seed })` treats a raster layer on the CPU: ink loses a little coverage, paper gets subtle tonal clouds, fibre-like streaks and grain. Keep static surface layers in `setup()`. [Surface](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#surface).

## Fundsachen

`await Merz.fundsachen('001')` loads a found piece from the catalogue (28 cropped letters, numerals, words, rules and printed marks from *Merz* 2 and *Merz* 8/9) as a fragment for `stempel()` and `riss()`; `await Merz.fundsachen('001', x, y, width)` draws it straight away. Every piece has a transparent PNG download, and 17 also include an SVG silhouette. [Catalogue](https://seb-prjcts-be.github.io/p5.merz/docs/fundsachen.html).

## A sheet or a column that grows

`Merz.blatt({ seed })` is a sheet with time: `blatt.fund(source, options)` places any of the materials above at the current year, `blatt.jahr()` moves on, `blatt.ueberbauen({ deckend })` covers part of the page with planes, and `blatt.zeichne({ jahr })` draws the state up to a year. `Merz.bau({ seed, grund })` is the same idea as a column in WEBGL mode: letters become beams, text from a p5.Font is extruded, images stand as planes, `bau.gips({ deels, open })` covers everything so far with faceted plaster, and `bau.zeichne({ jahr, schnitt })` draws the column up to a year, with a cut that takes the plaster away. Pieces without a position are placed from the seed, so the same calls give the same work. [A sheet or a column that grows](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#werk).

## Composition and SVG

`Merz.create()` keeps geometric letters, lines and planes as elements with ids, edits them later and exports editable SVG without font dependencies. Most sketches draw directly on the canvas and do not need a stored composition; it is there when you want clean vectors. [Composition](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#keep-a-composition).

## Colours

`Merz.farbe.grau`, `rot`, `schwarz`, `blau` and `gelb`, also available by index `0` to `4`. `Merz.settings({ rot: '#c4382d' })` returns a palette with your own six-digit hex values. [Colours](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#settings).

## Examples

- [Riss](https://seb-prjcts-be.github.io/p5.merz/examples/riss/): the geometric alphabet sliced into strips, torn and repeated.
- [Bauteile](https://seb-prjcts-be.github.io/p5.merz/examples/bauteile/): named letter parts set free in a p5 loop with rotation, scale and open space.
- [Fundsachen](https://seb-prjcts-be.github.io/p5.merz/examples/fundsachen/): five found pieces from the cover of *Merz* 8/9 beside a geometric M, torn, split and repeated.
- [Free composition](https://seb-prjcts-be.github.io/p5.merz/examples/free-composition/): two words from the cover of *Merz* 8/9, a blue plane and a red rule with SVG export.
- [Poster](https://seb-prjcts-be.github.io/p5.merz/examples/poster/): the cover facts of *Merz* 8/9 as a poster in geometric letters, numerals and punctuation, with SVG export.
- [Characters](https://seb-prjcts-be.github.io/p5.merz/examples/characters/): all supported characters in the geometric alphabet side by side.

Each page shows its code beside the drawing, with a button to copy the sketch. The [studies](https://seb-prjcts-be.github.io/p5.merz/docs/research.html) behind the library stay online.

## Related work

[p5.gysin](https://github.com/seb-prjcts-be/p5.gysin) is the sister library: cut-up and permuted text, drawn for the pen plotter, with the same habit of naming functions after the studio. For the outlines of a real typeface in p5, `textToPoints()` in p5.js itself does that work; the geometric alphabet here is deliberately not a font but a drawing on a five-unit grid, so its parts can be taken out and used alone. The pages the found pieces come from are online in full at the [International Dada Archive](https://sdrc.lib.uiowa.edu/dada/merz/), which is the better place to look at Schwitters' typography itself.

## Public API

`Merz.ready()`, `settings()`, `satz()`, `bauteile()`, `bauteil()`, `ausschnitt()`, `rundschnitt()`, `schnitt()`, `splitter()`, `riss()`, `andruck()`, `stempel()`, `fundsachen()`, `blatt()`, `bau()`, `schrift()`, `create()`, with `Merz.farbe`, `Merz.palette`, `Merz.characters` and `Merz.version`. The [function reference](https://seb-prjcts-be.github.io/p5.merz/docs/guide.html#api-reference) lists arguments and return values.

## Test

```sh
npm ci
npm run build:min
npm test
```

`npm test` checks geometry, stable ids, SVG, cutting, surface, stamps, fonts and the catalogue for source and min-build. [tests/run-browser.html](tests/run-browser.html) runs the browser test pages, including every example page. After editing `assets/fundsachen/catalogue.json`, run `npm run sync:fundsachen`.

Version 0.3.0 is prepared here; it has no release tag yet.

## How this was made

Designed and directed by Sebastien Vanblaere, written with AI assistance; the responsibility is his.

## Licence and credits

The library code is MIT. The scans and the pieces cut from them in `assets/fundsachen/` fall outside that licence; they come from *Merz* 2 and *Merz* 8/9, held by the International Dada Archive, University of Iowa Libraries, see [SOURCES.md](assets/fundsachen/SOURCES.md). The *Merz* 2 reuse record remains to be verified. The bundled p5.js 2.3.4 has its own licence.

The printer's case is bundled under the SIL Open Font License: [Archivo](assets/fonts/archivo/README.md) by Omnibus-Type and [Bodoni Moda](assets/fonts/bodoni-moda/README.md) by Owen Earl, both taken unmodified from the [Google Fonts repository](https://github.com/google/fonts). Our thanks to both designers, to the Google Fonts project, and to the International Dada Archive for keeping the scans available: [University of Iowa: Merz, 1923–1932](https://sdrc.lib.uiowa.edu/dada/merz/).
