const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let baseline, linesBaseline;
for (const file of ['p5.merz.js', 'p5.merz.min.js']) {
  const calls = [];
  const p = {};
  for (const name of ['push','pop','applyMatrix','noFill','stroke','strokeCap','strokeJoin','strokeWeight','beginShape','vertex','endShape','noStroke','fill','textFont','textSize','textWeight','textStyle','textAlign','textLeading','text','rect','rectMode','translate','scale']) p[name] = (...args) => calls.push([name,...args]);
  p.textWidth = s => { calls.push(['textWidth', s]); return s.length * 10; };
  const ctx = { ...p }; vm.runInNewContext(fs.readFileSync(file,'utf8'), ctx);
  const m = ctx.Merz;
  const word = m.satz('MERZ'); const original = JSON.stringify(word);
  assert.equal(m.stempel(word, [{x:12,y:25,angle:90,scale:2,color:'#b92d26'}],p),1);
  const matrix = calls.find(c => c[0] === 'applyMatrix');
  assert.ok(Math.abs(matrix[1]) < 1e-12); assert.equal(matrix[2],2); assert.equal(matrix[3],-2);
  assert.deepEqual(matrix.slice(5),[12,25]);
  assert.equal(calls.at(-1)[0],'pop'); assert.equal(JSON.stringify(word),original);
  calls.length=0;
  m.stempel(m.bauteile('R'),[{x:0,y:0}]); // Global mode.
  const result=JSON.stringify(calls); if(baseline)assert.equal(result,baseline); baseline=result;
  calls.length=0;
  assert.throws(()=>m.stempel(word,[{x:0,y:0},{x:1,y:1,scale:0}],p));
  assert.equal(calls.length,0); // Validate all copies before drawing any.
  assert.throws(()=>m.stempel(word,[{x:0,y:0,colour:'#ffffff'}],p));
  assert.throws(()=>m.stempel({},[],p));
  assert.equal(m.stempel(word,[],p),0);
  calls.length=0;
  assert.equal(m.stempel('rrrt',{x:28,y:98,size:105,color:'#b92d26',rows:4,leading:20},p),1);
  assert.deepEqual(calls.filter(c=>c[0]==='text'),[['text','rrrt',0,0],['text','rrrt',0,20],['text','rrrt',0,40],['text','rrrt',0,60]]);
  assert.ok(calls.some(c=>c[0]==='textFont'&&c[1]==='Merz Grotesk 100'));
  assert.ok(calls.some(c=>c[0]==='textWeight'&&c[1]===800));
  assert.equal(calls.at(-1)[0],'pop');
  calls.length=0;
  assert.throws(()=>m.stempel('x',[{x:0,y:0},{x:0,y:0,rows:1.5}],p));
  assert.equal(calls.length,0);
  m.stempel('global',{x:0,y:0});
  assert.ok(calls.some(c=>c[0]==='text'));
  calls.length=0;
  assert.equal(m.stempel(word,28,98,{},p),1); const withOptions=JSON.stringify(calls); calls.length=0;
  assert.equal(m.stempel(word,28,98,p),1); // A drawing context may replace the options.
  assert.equal(JSON.stringify(calls),withOptions);
  for(const source of ['rrrt',word,m.bauteile('R')]){
    calls.length=0;
    m.stempel(source,{x:28,y:98,color:'#b92d26'},p);
    const expected=JSON.stringify(calls);
    calls.length=0;
    m.stempel(source,28,98,{color:'#b92d26'},p);
    assert.equal(JSON.stringify(calls),expected);
  }
  calls.length=0;
  m.stempel('rrrt',28,98);
  assert.ok(calls.some(c=>c[0]==='textSize'&&c[1]===32));
  assert.deepEqual(calls.find(c=>c[0]==='applyMatrix').slice(5),[28,98]);
  calls.length=0;
  for(const args of [[0,NaN],[0,0,null],[0,0,{x:4}],[0,0,{size:0}]])assert.throws(()=>m.stempel('x',...args));
  assert.equal(calls.length,0);
  calls.length=0;
  m.stempel(word,-10,42,{repeat:4,stepY:58,offsetX:-150,color:['#b92d26','#20201e']},p);
  assert.deepEqual(calls.filter(c=>c[0]==='applyMatrix').map(c=>c.slice(5)),[[-10,42],[-160,100],[-10,158],[-160,216]]);
  assert.deepEqual(calls.filter(c=>c[0]==='stroke').map(c=>c[1]),['#b92d26','#20201e','#b92d26','#20201e']);
  calls.length=0;
  for(const options of [{repeat:0},{repeat:1025},{color:[]},{angle:[0,NaN]},{scale:[1,0]},{stepY:Infinity},{mirror:'yes'},{mirror:[true,1]},{rotation:90}])assert.throws(()=>m.stempel(word,0,0,options,p));
  assert.equal(calls.length,0);
  assert.throws(()=>m.stempel(word,0,0,{rotation:90},p),/angle, in degrees/);
  // mirror turns a piece over within its own bounds: a second matrix with -1 on x, placed at left + right.
  calls.length=0; m.stempel(word,10,20,{mirror:true},p);
  const mirrored=calls.filter(c=>c[0]==='applyMatrix');assert.equal(mirrored.length,2);assert.equal(mirrored[1][1],-1);assert.ok(mirrored[1][5]>word.width-1&&mirrored[1][5]<word.width+word.paths[0].width+1);
  calls.length=0; m.stempel(word,10,20,{repeat:2,stepX:50,mirror:[false,true]},p);
  assert.equal(calls.filter(c=>c[0]==='applyMatrix').length,3);
  calls.length=0; m.stempel('AB',0,0,{mirror:true},p);
  assert.deepEqual(calls.filter(c=>c[0]==='applyMatrix')[1].slice(1),[-1,0,0,1,20,0]);
  calls.length=0;
  const textBroken={...p,text(){throw new Error('text failed');}};
  assert.throws(()=>m.stempel('x',{x:0,y:0},textBroken));
  assert.equal(calls.at(-1)[0],'pop');
  const broken={...p,vertex(){throw new Error('draw failed');}};
  assert.throws(()=>m.stempel(word,[{x:0,y:0}],broken));
  assert.equal(calls.at(-1)[0],'pop');
  // Lines, spacing, stretch and alignment.
  calls.length=0;
  assert.equal(m.stempel(['A','B'],0,0,{leading:40},p),1);
  assert.deepEqual(calls.filter(c=>c[0]==='text'),[['text','A',0,0],['text','B',0,40]]);
  const linesCalls=JSON.stringify(calls.filter(c=>c[0]==='text'));
  calls.length=0; m.stempel('A'+String.fromCharCode(10)+'B',0,0,{leading:40},p);
  assert.equal(JSON.stringify(calls.filter(c=>c[0]==='text')),linesCalls); // A line break is a line.
  calls.length=0; m.stempel(['A','B'],0,0,{rows:2,leading:10},p);
  assert.deepEqual(calls.filter(c=>c[0]==='text').map(c=>c[3]),[0,10,20,30]); // rows repeat the lines.
  calls.length=0; m.stempel('AB',0,0,{spacing:5},p);
  assert.deepEqual(calls.filter(c=>c[0]==='text'),[['text','A',0,0],['text','B',15,0]]);
  calls.length=0; m.stempel('AB',0,0,{align:'right'},p);
  assert.deepEqual(calls.filter(c=>c[0]==='text'),[['text','AB',-20,0]]);
  calls.length=0; m.stempel('AB',0,0,{align:'center'},p);
  assert.deepEqual(calls.filter(c=>c[0]==='text'),[['text','AB',-10,0]]);
  for(const options of [{spacing:NaN},{align:'top'},{weight:50},{weight:901},{stretch:61},{stretch:126},{font:''}])assert.throws(()=>m.stempel('AB',0,0,options,p));
  assert.throws(()=>m.stempel(['A',1],0,0,p));
  assert.throws(()=>m.stempel([],0,0,p));
  // The printer's case: grotesk widths snap to six steps, antiqua is one face, other families pass through.
  const family=(options)=>{calls.length=0;m.stempel('A',0,0,options,p);return calls.find(c=>c[0]==='textFont')[1];};
  assert.equal(family({}),'Merz Grotesk 100');
  assert.equal(family({stretch:62}),'Merz Grotesk 62');
  assert.equal(family({stretch:70}),'Merz Grotesk 75');
  assert.equal(family({stretch:120}),'Merz Grotesk 125');
  assert.equal(family({stretch:118}),'Merz Grotesk 112');
  assert.equal(family({font:'antiqua',stretch:62}),'Merz Antiqua');
  assert.equal(family({font:'Georgia'}),'Georgia');
  const noWeight={...p};delete noWeight.textWeight;
  assert.equal(m.stempel('A',0,0,noWeight),1); // p5 without textWeight still draws.
  calls.length=0; m.stempel(['A','BCD'],5,6,{spacing:4,leading:40},p);
  const linesResult=JSON.stringify(calls); if(linesBaseline)assert.equal(linesResult,linesBaseline); linesBaseline=linesResult;
}
console.log('Stempel: transforms, source/min parity, global/instance routing, lines, spacing, stretch, alignment, validation and state restoration passed.');
