/* Original, editable starters: no uploaded art, remote assets, or generated product facts. */
(() => {
'use strict';
const palettes={
 plum:{name:'Plum & butter',dark:'#2c193f',light:'#f6d969',ink:'Plum',paper:'Butter Yellow'},
 forest:{name:'Forest & cream',dark:'#214a3e',light:'#f6ebd4',ink:'Forest Green',paper:'Warm Cream'},
 cobalt:{name:'Cobalt & sky',dark:'#233b87',light:'#cfecff',ink:'Cobalt',paper:'Sky Blue'},
 brick:{name:'Brick & peach',dark:'#8a292e',light:'#f8d9c6',ink:'Brick Red',paper:'Peach'}
};
const styles={window:{name:'Oven window',palette:'plum'},seal:{name:'Bakery seal',palette:'forest'},type:{name:'Clean type',palette:'cobalt'}};
const marks={
 oven:['Oven window','M0 2Q0 0 5 0H95Q100 0 100 2V100H81V82C81 64 67 51 50 51S19 64 19 82V100H0Z'],
 ovenTrim:['Oven trim','M3.5 98V3.5Q3.5 2.1 7 2.1H93Q96.5 2.1 96.5 3.5V98H95.8V3.7Q95.8 2.55 93 2.55H7Q4.2 2.55 4.2 3.7V98Z M15.2 98V81.5C15.2 62.9 31.2 48.1 50 48.1C68.8 48.1 84.8 62.9 84.8 81.5V98H84V81.5C84 63.2 68.5 48.6 50 48.6S16 63.2 16 81.5V98Z'],
 loaf:['Loaf','M4 49C4 27 21 17 37 16H64C82 16 96 29 96 50C96 58 90 63 83 66V83H17V66C9 63 4 58 4 49ZM29 72H71V62C71 55 83 56 83 49C83 36 72 28 62 28H38C27 28 17 37 17 49C17 56 29 55 29 62Z'],
 wheat:['Wheat','M46 18Q46 6 50 2Q54 6 54 18V97H46Z M43 31Q17 30 17 10Q41 10 43 31Z M57 31Q83 30 83 10Q59 10 57 31Z M43 52Q14 53 15 32Q41 32 43 52Z M57 52Q86 53 85 32Q59 32 57 52Z M43 72Q16 73 15 53Q39 53 43 72Z M57 72Q84 73 85 53Q61 53 57 72Z'],
 ray:['Sunrise','M8 70C8 48 27 29 50 29S92 48 92 70H83C83 53 68 38 50 38S17 53 17 70Z M9 81H91V89H9Z M46 7H54V22H46Z M15 16L27 27L22 33L9 22Z M85 16L73 27L78 33L91 22Z'],
 sparkle:['Sparkle','M50 2Q59 39 98 50Q60 59 50 98Q42 60 2 50Q42 40 50 2Z'],
 arch:['Arch','M0 100V53C0 23 22 0 50 0S100 23 100 53V100H88V53C88 30 73 12 50 12S12 30 12 53V100Z'],
 seal:['Scalloped seal','M50 0Q58 0 65 8Q77 4 84 16Q96 20 92 33Q100 42 100 50Q100 58 92 67Q96 80 84 84Q77 96 65 92Q58 100 50 100Q42 100 35 92Q23 96 16 84Q4 80 8 67Q0 58 0 50Q0 42 8 33Q4 20 16 16Q23 4 35 8Q42 0 50 0Z'],
 frame:['Rectangular frame','M0 0H100V100H0Z M8 8V92H92V8Z'],
 ovalFrame:['Oval frame','M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z M50 9A41 41 0 1 0 50 91A41 41 0 1 0 50 9Z'],
 pill:['Capsule','M28 22H72a28 28 0 0 1 0 56H28a28 28 0 0 1 0-56Z'],
 ribbon:['Ribbon','M1 17H99L86 50 99 83H1L14 50Z'],
 shield:['Shield badge','M12 7H88V47C88 71 70 86 50 96C30 86 12 71 12 47Z'],
 leaf:['Leaf','M8 87L24 71C8 40 41 13 93 8C94 56 65 88 31 77L15 94Z M29 69L72 30Q43 47 29 69Z']
};
const clean=(s,max,d)=>[...String(s||'').replace(/\s+/g,' ').trim()].slice(0,max).join('')||d;
function stack(s){const a=s.split(' ');if(a.length<2)return s;let at=Math.ceil(a.length/2);return a.slice(0,at).join(' ')+'\n'+a.slice(at).join(' ');}
function build({style='window',palette,brand,product,w,l,top=1.3,bottom=l-.45}){
 const t=styles[style];if(!t)throw Error('Unknown starter'); const p=palettes[palette]||palettes[t.palette];
 if(![w,l,top,bottom].every(Number.isFinite)||w<=2||bottom<=top||bottom>l)throw Error('Invalid bag size');
 const b=clean(brand,45,'Late Riser'), item=clean(product,55,'The Everyday Loaf'); const h=bottom-top;
 const width=w-1.44, ar=[];
 for(const panel of ['front','back']){
  const shape=(id,x,y,ww,hh,role)=>ar.push({type:'shape',shape:id,x:w/2+x*width,y:top+y*h,w:ww*width,h:hh*h,rot:0,panel,starterColor:role,color:p[role]});
  const txt=(text,y,fs,font,role,limit=.86,spacing=0,lead=99)=>ar.push({type:'text',text,x:w/2,y:top+y*h,size:Math.min(width*fs,h*(text.split('\n').length>=3?.077:text.includes('\n')?.129:.17)),font,rot:0,panel,starterColor:role,color:p[role],starterMax:limit*width,letter:spacing,lead});
  const front=panel==='front';
  if(style==='window'){
   shape('oven',0,.385,1,.736,'dark');shape('ovenTrim',0,.385,1,.736,'light');shape('round',0,.832,1,.119,'light');shape('loaf',0,.077,.134,.051,'light');
   txt(front?'BAKERY':b.toUpperCase()+' BAKERY',.122,.046,'Inter','light',.82,17);
   txt(front?stack(b.toUpperCase()):'GOOD\nTHINGS\nRISE.',front?.271:.267,front?.279:.216,'Oswald','light',.85,-1,88);
   shape('sparkle',0,.364,.054,.018,'light');
   txt(front?item.toUpperCase():'TOAST IT. SHARE IT.',.833,.092,'Inter','dark',.85,1);
  } else if(style==='seal'){
   shape('seal',0,.361,.91,.43,'dark');shape('wheat',0,.268,.118,.081,'light');
   txt(front?b:'Made to share',.413,.197,'Lora','light',.69,-1);shape('line',0,.596,.56,.020,'dark');
   txt(front?item.toUpperCase():b,.715,.106,'Inter','dark',.84,2);
  } else {
   shape('ray',0,.21,.19,.079,'dark');shape('round',0,.313,.97,.079,'light');txt(front?item.toUpperCase():'GOOD FROM THE FIRST SLICE',.315,.074,'Inter','dark',.82,0);
   txt(front?stack(b):'Good bread.\nGood day.',.505,.237,'Inter','dark',.92,-3,91);
   shape('line',0,.701,.88,.011,'dark');txt(front?'BAKERY':b.toUpperCase(),.77,.091,'Inter','dark',.85,3);
  }
 }
 return ar;
}
function recolor(els,key){const p=palettes[key];if(!p)return;for(const e of els){if(e.starterColor==='light'||e.starterColor==='dark')e.color=p[e.starterColor];}}
function sample(){
 const front=build({style:'window',brand:'Late Riser',product:'The Everyday Loaf',w:8,l:18,top:1.3,bottom:17.63}).filter(e=>e.panel==='front');
 const back=build({style:'window',brand:'Late Riser',product:'The Everyday Loaf',w:8,l:18,top:1.58,bottom:11.8}).filter(e=>e.panel==='back').filter(e=>e.shape!=='round'&&e.text!=='TOAST IT. SHARE IT.');
 const p=palettes.plum;
 const words=(panel,kind,text,x,y,size,extra={})=>({type:'text',panel,kind,text,x,y,size,font:'Inter',letter:0,lead:122,color:p.dark,rot:0,...extra});
 const facts={servings:'14',servingSize:'1 slice (32g)',calories:'90',fat:'1',fatDV:'1',sat:'0',satDV:'0',trans:'0',chol:'0',cholDV:'0',sodium:'150',sodiumDV:'7',carb:'17',carbDV:'6',fiber:'1',fiberDV:'4',sugars:'2',added:'1',addedDV:'2',protein:'3',vitd:'0',vitdDV:'0',calcium:'40',calciumDV:'4',iron:'1',ironDV:'6',potassium:'40',potassiumDV:'0',foot:'Illustrative sample data only. Replace all values with verified product information before printing.'};
 return [...front,words('front','netwt','NET WT 15.8 OZ (448 g)',4,16.8,.265,{starterColor:'dark',starterMax:5.8,letter:3}),
 ...back,words('back',null,'SAMPLE LABEL • NOT FOR SALE',4,9.91,.265,{starterColor:'dark',starterMax:6,letter:4}),
 {type:'shape',shape:'round',panel:'back',x:4,y:13.82,w:6.51,h:6.72,rot:0,color:'#ffffff'},
 {type:'nf',kind:'nutrition',panel:'back',nf:facts,w:2.79,h:4.743,x:2.34,y:13.35,rot:0},
 words('back','ingredients','INGREDIENTS\nWheat flour, water, yeast,\nsugar, sea salt.',5.48,11.67,.232,{starterMax:2.74}),
 words('back','allergens','CONTAINS: WHEAT',5.48,12.59,.214,{starterMax:2.74}),
 words('back','maker','MADE BY LATE RISER BAKERY\nFictional bakery • Brooklyn, NY',5.48,13.38,.205,{starterMax:2.73}),
 {type:'barcode',panel:'back',barType:'upc',digits:'040000000006',w:2.56,h:1.74,x:5.48,y:15.10,rot:0},
 words('back',null,'DEMO BARCODE',5.48,16.15,.193,{starterMax:2.65,letter:5}),
 words('back',null,'FOR DESIGN REVIEW ONLY',2.34,16.39,.174,{starterMax:2.65,letter:2})];
}
globalThis.MetroCreative={styles,palettes,marks,build,recolor,sample};
})();
