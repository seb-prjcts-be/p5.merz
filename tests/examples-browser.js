// Every example page must draw a canvas without errors or unhandled rejections.
(async () => {
  const report = document.getElementById('result');
  const pages = ['bauteile', 'blatt', 'characters', 'free-composition', 'poster', 'riss', 'saeule'];
  const lines = [];
  let failed = 0;
  for (const name of pages) {
    const frame = document.createElement('iframe');
    frame.title = name;
    frame.style.cssText = 'width:600px;height:400px;border:1px solid #d2d2c9';
    const problems = [];
    const outcome = await new Promise(resolve => {
      const started = performance.now();
      frame.onload = () => {
        const win = frame.contentWindow;
        win.addEventListener('error', e => problems.push(e.message || String(e.error)));
        win.addEventListener('unhandledrejection', e => problems.push(String(e.reason)));
      };
      frame.onerror = () => resolve('could not load');
      frame.src = new URL('../examples/' + name + '/index.html?preview=1&v=' + Date.now(), location.href).href;
      document.getElementById('host').append(frame);
      const measure = data => {
        let dark = 0;
        for (let i = 0; i < data.length; i += 16) if (data[i + 3] > 0 && data[i] + data[i + 1] + data[i + 2] < 600) dark++;
        return dark > 50;
      };
      let reading = false;
      const timer = setInterval(() => {
        if (problems.length) { clearInterval(timer); return resolve(problems[0]); }
        if (performance.now() - started > 15000) { clearInterval(timer); return resolve('no drawing after 15 seconds'); }
        if (reading) return;
        const finish = painted => {
          if (painted) {
            // Give async setups a moment to finish and report late errors.
            clearInterval(timer);
            setTimeout(() => resolve(problems[0] || 'ok'), 800);
          } else if (performance.now() - started > 15000) { clearInterval(timer); resolve('no drawing after 15 seconds'); }
        };
        try {
          const canvas = frame.contentDocument.querySelector('canvas');
          if (!canvas) return finish(false);
          const flat = canvas.getContext('2d');
          if (flat) return finish(measure(flat.getImageData(0, 0, canvas.width, canvas.height).data));
          // A WEBGL canvas keeps its pixels only within the frame that drew them, and a hidden
          // page gets no animation frames: draw one frame now and read it in the same task.
          const win = frame.contentWindow;
          if (typeof win.redraw !== 'function') return finish(false);
          reading = true;
          // redraw() is asynchronous in p5.js 2.x; the pixels are read as soon as it settles.
          Promise.resolve(win.redraw()).then(() => { win.loadPixels(); finish(measure(win.pixels)); })
            .catch(error => { clearInterval(timer); resolve(error.message); })
            .finally(() => { reading = false; });
        } catch (error) { clearInterval(timer); return resolve(error.message); }
      }, 150);
    });
    frame.remove();
    if (outcome !== 'ok') failed++;
    lines.push((outcome === 'ok' ? 'PASS ' : 'FAIL ') + name + (outcome === 'ok' ? '' : ': ' + outcome));
  }
  report.textContent = (failed ? 'FAIL: ' + failed + ' of ' + pages.length + ' example pages. ' : 'PASS: all ' + pages.length + ' example pages draw without errors. ') + String.fromCharCode(10) + lines.join(String.fromCharCode(10));
})();
