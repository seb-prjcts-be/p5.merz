// Every example page must draw a canvas without errors or unhandled rejections.
(async () => {
  const report = document.getElementById('result');
  const pages = ['bauteile', 'characters', 'free-composition', 'fundsachen', 'poster', 'riss'];
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
      frame.src = new URL('../examples/' + name + '/index.html?preview=1&v=test', location.href).href;
      document.getElementById('host').append(frame);
      const timer = setInterval(() => {
        if (problems.length) { clearInterval(timer); return resolve(problems[0]); }
        let painted = false;
        try {
          const canvas = frame.contentDocument.querySelector('canvas');
          if (canvas) {
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            let dark = 0;
            for (let i = 0; i < data.length; i += 16) if (data[i + 3] > 0 && data[i] + data[i + 1] + data[i + 2] < 600) dark++;
            painted = dark > 50;
          }
        } catch (error) { clearInterval(timer); return resolve(error.message); }
        if (painted) {
          // Give async setups a moment to finish and report late errors.
          clearInterval(timer);
          setTimeout(() => resolve(problems[0] || 'ok'), 800);
        } else if (performance.now() - started > 15000) { clearInterval(timer); resolve('no drawing after 15 seconds'); }
      }, 150);
    });
    frame.remove();
    if (outcome !== 'ok') failed++;
    lines.push((outcome === 'ok' ? 'PASS ' : 'FAIL ') + name + (outcome === 'ok' ? '' : ': ' + outcome));
  }
  report.textContent = (failed ? 'FAIL: ' + failed + ' of ' + pages.length + ' example pages. ' : 'PASS: all ' + pages.length + ' example pages draw without errors. ') + String.fromCharCode(10) + lines.join(String.fromCharCode(10));
})();
