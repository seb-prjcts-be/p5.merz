/* global p5, Merz */
(() => {
  const composition=Merz.create({width:900,height:900});
  let chosen,painter;
  const form=document.getElementById('editor'),list=document.getElementById('element-list');
  function starter(){composition.clear();composition.plane(75,440,270,170,{color:Merz.farbe.blau});chosen=composition.text('NASCI',75,145,{size:120,weight:.85,spacing:16});composition.line(75,380,780,380,{color:Merz.farbe.rot,strokeWeight:14});composition.text('NATUR',460,690,{size:46,spacing:8});}
  function code(){const lines=composition.items().map(item=>{
    const {id,type,x,y,...opts}=item;delete opts.angle;delete opts.scale;if(!opts.mirror)delete opts.mirror;
    let call;if(type==='text'){const content=opts.text;delete opts.text;call=`work.text(${JSON.stringify(content)}, ${x}, ${y}, ${JSON.stringify(opts)})`;}
    if(type==='plane'){const {width,height,...style}=opts;call=`work.plane(${x}, ${y}, ${width}, ${height}, ${JSON.stringify(style)})`;}
    if(type==='line'){const {x2,y2,...style}=opts;call=`work.line(${x}, ${y}, ${x+x2}, ${y+y2}, ${JSON.stringify(style)})`;}
    if(item.angle||item.scale!==1)return `  const ${id.replace('-','')} = ${call};\n  work.update(${id.replace('-','')}, ${JSON.stringify({angle:item.angle,scale:item.scale})});`;
    return '  '+call+';';
  });return `let work;\n\nfunction setup() {\n  createCanvas(900, 900);\n  noLoop();\n  work = Merz.create({ width: 900, height: 900 });\n${lines.join('\n')}\n}\n\nfunction draw() {\n  work.draw();\n}`;}
  function populate(){
    list.replaceChildren();composition.items().forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.id+' - '+({text:'text',plane:'plane',line:'line'}[item.type])+(item.type==='text'?' '+item.text:'');list.append(option);});
    if(!composition.items().length){chosen=null;form.hidden=true;}else{if(!composition.items().some(i=>i.id===chosen))chosen=composition.items().at(-1).id;list.value=chosen;form.hidden=false;const item=composition.get(chosen);
      for(const field of form.querySelectorAll('[data-option]')){const key=field.dataset.option;field.disabled=!(key in item);field.closest('label').hidden=!(key in item);if(key in item)field.value=item[key];}
    }
    document.getElementById('error').textContent='';document.getElementById('code').textContent=code();if(painter){painter.describe('Composition with '+composition.items().length+' editable elements.');painter.redraw();}
  }
  list.addEventListener('change',()=>{chosen=list.value;populate();});
  form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',e=>{const field=e.target,key=field.dataset.option;if(!key)return;try{if(!form.checkValidity())throw new Error('Enter a valid measurement.');const value=field.type==='number'?Number(field.value):field.value;composition.update(chosen,{[key]:value});document.getElementById('error').textContent='';document.getElementById('code').textContent=code();if(painter)painter.redraw();if(key==='text'){const item=composition.get(chosen);list.selectedOptions[0].textContent=chosen+' - text '+item.text;}}catch(error){document.getElementById('error').textContent=error.message;}});
  for(const type of ['text','plane','line'])document.getElementById('add-'+type).addEventListener('click',()=>{chosen=type==='text'?composition.text('NEW',75,300,{size:70}):type==='plane'?composition.plane(450,450,180,120,{color:Merz.farbe.gelb}):composition.line(75,600,700,600,{strokeWeight:8});populate();});
  for(const [button,method] of [['front','bringToFront'],['back','sendToBack'],['remove','remove']])document.getElementById(button).addEventListener('click',()=>{if(chosen){composition[method](chosen);populate();}});
  document.getElementById('restart').addEventListener('click',()=>{starter();document.getElementById('error').textContent='';populate();});
  document.getElementById('download').addEventListener('click',()=>composition.downloadSVG());
  starter();populate();new p5(p=>{p.setup=()=>{p.createCanvas(900,900).parent('composition');p.pixelDensity(1);p.noLoop();painter=p;populate();};p.draw=()=>composition.draw(p);});
})();
