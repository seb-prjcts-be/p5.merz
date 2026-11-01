// Every example page must draw a canvas without errors or unhandled rejections.
(async () => {
  const report = document.getElementById('result');
  const pages = ['bauteile', 'blatt', 'characters', 'free-composition', 'fundsachen', 'poster', 'riss', 'saeule'];
  const lines = [];
  let failed = 0;
  for (const name of pages) {
    const frame = document.createElement('iframe');
    frame.title = name;
    frame.style.cssText = 'width:600px;height:400px;border:1px solid #d2d2c9';
    const problems = [], logged = [];
    const outcome = await new Promise(resolve => {
      const started = performance.now();
      frame.onload = () => {
        const win = frame.contentWindow;
        win.addEventListener('error', e => problems.push(e.message || String(e.error)));
        win.addEventListener('unhandledrejection', e => problems.push(String(e.reason)));
        // p5.js 2.x reports an error thrown inside an async setup() through console.error only.
        const original = win.console.error.bind(win.console);
        win.console.error = (...parts) => { logged.push(parts.map(String).join(' ').slice(0, 300)); original(...parts); };
      };
      frame.onerror = () => resolve('could not load');
      frame.src = new URL('../examples/' + name + '/index.html?preview=1&v=' + Date.now(), location.href).href;
      document.getElementById('host').append(frame);
      const measure = data => {
        let dark = 0;
        for (let i = 0; i < data.length; i += 16) if (data[i + 3] > 0 && data[i] + data[i + 1] + data[i + 2] < 600) dark++;
        return dark > 50;
      };
      let reading = false, detail = '';
      const timer = setInterval(() => {
        if (problems.length) { clearInterval(timer); return resolve(problems[0]); }
        if (performance.now() - started > 15000) { clearInterval(timer); return resolve('no drawing after 15 seconds' + (detail ? ' (' + detail + ')' : '') + (logged.length ? ' console: ' + logged[0] : '')); }
        if (reading) return;
        const finish = painted => {
          if (painted) {
            // Give async setups a moment to finish and report late errors.
            clearInterval(timer);
            setTimeout(() => resolve(problems[0] || 'ok'), 800);
          } else if (performance.now() - started > 15000) { clearInterval(timer); resolve('no drawing after 15 seconds'); }
        };
        try {
          // The sketch canvas, not a helper canvas that p5 may add for fonts or graphics.
          const sketch = frame.contentWindow.p5 && frame.contentWindow.p5.instance;
          const canvas = (sketch && sketch._renderer && sketch._renderer.canvas) || frame.contentDocument.querySelector('#drawing canvas, #example canvas, canvas');
          if (!canvas) return finish(false);
          const flat = canvas.getContext('2d');
          if (flat) return finish(measure(flat.getImageData(0, 0, canvas.width, canvas.height).data));
          // A WEBGL canvas keeps its pixels only within the frame that drew them, and a hidden
          // page gets no animation frames: draw one frame now and read it in the same task.
          const win = frame.contentWindow;
          if (typeof win.redraw !== 'function') return finish(false);
          reading = true;
          // redraw() is asynchronous in p5.js 2.x; the pixels are read as soon as it settles.
          // Before setup has finished it may not settle at all, so give it a moment and try again.
          Promise.race([Promise.resolve(win.redraw()), new Promise(wait => setTimeout(() => wait('pending'), 1500))])
            .then(state => {
              const inst = win.p5 && win.p5.instance; const progress = ', setupDone ' + (inst ? inst._setupDone : 'n/a') + ', fonts ' + (win.document.fonts ? win.document.fonts.status : 'n/a') + ', after ' + Math.round(performance.now() - started) + 'ms';
              if (state === 'pending') { detail = 'redraw pending, frameCount ' + win.frameCount + progress; return finish(false); }
              win.loadPixels(); const painted = measure(win.pixels); detail = 'redraw settled, frameCount ' + win.frameCount + ', pixels ' + (win.pixels ? win.pixels.length : 'none') + ', painted ' + painted + progress; finish(painted);
            })
            .catch(error => { clearInterval(timer); resolve(error.message); })
            .finally(() => { reading = false; });
        } catch (error) { clearInterval(timer); return resolve(error.message); }
      }, 150);
    });
    // Release a WebGL context before the frame goes, so later pages can create their own.
    try {
      const canvas = frame.contentDocument && frame.contentDocument.querySelector('canvas');
      const gl = canvas && !canvas.getContext('2d') && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
      if (gl && gl.getExtension('WEBGL_lose_context')) gl.getExtension('WEBGL_lose_context').loseContext();
    } catch (error) { /* a frame that never loaded has nothing to release */ }
    frame.remove();
    if (outcome !== 'ok') failed++;
    lines.push((outcome === 'ok' ? 'PASS ' : 'FAIL ') + name + (outcome === 'ok' ? '' : ': ' + outcome));
  }
  report.textContent = (failed ? 'FAIL: ' + failed + ' of ' + pages.length + ' example pages. ' : 'PASS: all ' + pages.length + ' example pages draw without errors. ') + String.fromCharCode(10) + lines.join(String.fromCharCode(10));
})();
