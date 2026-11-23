/* Client-side drawing primitives. No artwork leaves this browser. */
(() => {
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const NF=[['fat','Total Fat','g',1,0,1],['sat','Saturated Fat','g',1,1,0],['trans','Trans Fat','g',0,1,0],['chol','Cholesterol','mg',1,0,1],['sodium','Sodium','mg',1,0,1],['carb','Total Carbohydrate','g',1,0,1],['fiber','Dietary Fiber','g',1,1,0],['sugars','Total Sugars','g',0,1,0],['added','Includes Added Sugars','g',1,2,0],['protein','Protein','g',1,0,1],['vitd','Vitamin D','mcg',1,0,0],['calc','Calcium','mg',1,0,0],['iron','Iron','mg',1,0,0],['pot','Potassium','mg',1,0,0]];
const foot='* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.';
const SHAPES={rectangle:['Rectangle','M0 0H100V100H0Z'],round:['Rounded rectangle','M14 0H86Q100 0 100 14V86Q100 100 86 100H14Q0 100 0 86V14Q0 0 14 0Z'],oval:['Circle / oval','M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z'],triangle:['Triangle','M50 0L100 100H0Z'],diamond:['Diamond','M50 0L100 50 50 100 0 50Z'],star:['Star','M50 0L64 34 100 38 73 62 81 100 50 81 19 100 27 62 0 38 36 34Z'],line:['Line','M0 46H100V54H0Z'],arrow:['Arrow','M0 34H62V0L100 50 62 100V66H0Z'],burst:['Burst','M50 0L58 16 72 5 74 24 93 20 87 38 100 50 86 61 93 80 74 76 72 95 58 84 50 100 42 84 28 95 26 76 7 80 14 61 0 50 13 38 7 20 26 24 28 5 42 16Z'],hexagon:['Hexagon','M25 0H75L100 50 75 100H25L0 50Z']};
function nfOps(data={}) {
 const ops=[]; const rect=(x,y,w,h,c='#111111')=>ops.push({x,y,w,h,c}), text=(x,y,t,s=13,b=false,a='left',max=282)=>ops.push({x,y,t:String(t),s,b,a,max});
 const amt=(i,u='')=>String(data[i]||'').trim()?` ${String(data[i]).trim()}${u}`:''; const val=k=>String(data[k]||'').trim();
 rect(0,0,300,510,'#111111');rect(2,2,296,506,'#ffffff');
 text(11,42,'Nutrition Facts',34,true);rect(10,51,280,2);
 text(11,71,`${val('servings')?val('servings')+' ':''}servings per container`,14);
 text(11,94,'Serving size',16,true,'left',112);text(289,94,val('servingSize'),16,true,'right',161);rect(10,101,280,8);
 text(11,128,'Amount per serving',12,true);text(11,157,'Calories',27,true);text(289,157,val('calories'),30,true,'right',111);rect(10,165,280,5);text(289,184,'% Daily Value*',12,true,'right');
 for(let i=0;i<NF.length;i++) {const [k,l,u,dv,indent,bold]=NF[i];const y=203+i*17.5+(i>=10?4:0);let label=l+amt(k,u);if(k==='added'&&val(k)) label=`Includes ${val(k)}g Added Sugars`;
    rect(10,y-14,280,i===10?4:0.8); text(11+indent*11,y,label,12.5,!!bold,'left',232-indent*11); if(dv&&val(k+'DV'))text(289,y,val(k+'DV').replace(/%+$/,'')+'%',12.5,i<10,'right',57);
 }
 rect(10,441,280,3);
 const words=String(data.foot===undefined?foot:data.foot).trim().split(/\s+/), lines=['']; for(const word of words){if((lines.at(-1)+' '+word).length>58&&lines.at(-1)) lines.push(word); else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}
 lines.slice(0,5).forEach((l,i)=>text(11,458+i*10,l,8.75,false,'left',277));return ops;
}
function nfSvg(data,w,h){const ops=nfOps(data);return `<g transform="translate(${-w/2} ${-h/2}) scale(${w/300} ${h/510})">`+ops.map(o=>o.t===undefined?`<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="${o.c}"/>`:`<text x="${o.x}" y="${o.y}" font-family="Arial,Helvetica,sans-serif" font-size="${o.s}" font-weight="${o.b?700:400}" ${o.a==='right'?'text-anchor="end"':''} ${o.t.length*o.s*.53>o.max?`textLength="${o.max}" lengthAdjust="spacingAndGlyphs"`:''} fill="#111111">${E(o.t)}</text>`).join('')+'</g>'}
function nfCanvas(c,data,w,h){c.save(); c.translate(-w/2,-h/2);c.scale(w/300,h/510);for(const o of nfOps(data)){if(o.t===undefined){c.fillStyle=o.c;c.fillRect(o.x,o.y,o.w,o.h);}else{c.fillStyle='#111';c.font=`${o.b?700:400} ${o.s}px Arial,Helvetica,sans-serif`;c.textAlign=o.a;c.textBaseline='alphabetic';c.fillText(o.t,o.x,o.y,o.max);}}c.restore();}
const L=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const R=L.map(x=>x.replace(/[01]/g,d=>d==='0'?'1':'0')); const G=R.map(x=>[...x].reverse().join(''));
const PAR=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
function checkDigit(body){let v=0;for(let i=body.length-1;i>=0;i--)v+=Number(body[i])*((body.length-i)%2===1?3:1);return (10-v%10)%10;}
function barcode(type,input){const n=type==='upc'?12:13;const d=String(input).trim();if(!new RegExp('^\\d{'+n+'}$').test(d))throw Error(`Enter ${n} digits exactly.`); if(checkDigit(d.slice(0,-1))!==Number(d.at(-1)))throw Error('That check digit does not match. Check the number on your product.');const e=type==='upc'?'0'+d:d, parity=PAR[Number(e[0])];const bits='101'+[...e.slice(1,7)].map((v,i)=>(parity[i]==='L'?L:G)[Number(v)]).join('')+'01010'+[...e.slice(7)].map(v=>R[Number(v)]).join('')+'101';return {bits,d,left:type==='upc'?9:11,right:type==='upc'?9:7};}
function barOps(type,input){const b=barcode(type,input),n=b.left+b.bits.length+b.right, rs=[];for(let i=0;i<95;i++)if(b.bits[i]==='1')rs.push([(i+b.left)/n,1/n,i<3||(i>=45&&i<50)||i>=92?0.84:0.75]);return {...b,rs};}
function barSvg(type,d,w,h){const b=barOps(type,d);return `<g transform="translate(${-w/2} ${-h/2})"><rect width="${w}" height="${h}" fill="white"/>${b.rs.map(([x,a,t])=>`<rect x="${x*w}" y="${.04*h}" width="${a*w}" height="${t*h}" fill="#111"/>`).join('')}<text x="${w/2}" y="${.97*h}" fill="#111" text-anchor="middle" font-family="monospace" font-size="${Math.min(h*.13,w*.089)}">${E(b.d)}</text></g>`;}
function barCanvas(c,type,d,w,h){const b=barOps(type,d);c.save();c.translate(-w/2,-h/2);c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#111';for(const [x,a,t] of b.rs)c.fillRect(x*w,.04*h,a*w,t*h);c.textAlign='center';c.textBaseline='alphabetic';c.font=`${Math.min(h*.13,w*.089)}px monospace`;c.fillText(b.d,w/2,.97*h);c.restore();}
const inksafe=/^#[0-9a-f]{6}$/i;
const colors={'#1d1d1f':'Black','#ffffff':'White','#c8102e':'Red','#0b5fa5':'Blue','#1e7b34':'Green','#6b3e1e':'Brown','#f2c200':'Yellow','#f0810a':'Metro Orange'};
Object.assign(colors,{'#2c193f':'Plum','#f6d969':'Butter Yellow','#214a3e':'Forest Green','#f6ebd4':'Warm Cream','#233b87':'Cobalt','#cfecff':'Sky Blue','#8a292e':'Brick Red','#f8d9c6':'Peach'});
function inkPlan(s){const out=[],seen=new Set();function put(name,hex,from){let c=hex?.toLowerCase()||null;const k=c||String(name).toLowerCase().replace(/\s+/g,' ').trim(); if((s.film==='white'&&c==='#ffffff'&&from!=='Declared')||seen.has(k)||!k)return;seen.add(k);out.push({name:name||colors[c]||c,c,from});}
 const all=String(s.declared||'').split(/[\r\n]+/).map(v=>v.trim()).filter(Boolean).slice(0,20);for(const line of all){const match=line.match(/#[0-9a-f]{6}(?=\s*$)/i);const c=match?.[0];const n=(match?line.slice(0,match.index):line).trim()||null;put(n?.slice(0,52),c,'Declared');}
 if(inksafe.test(s.bg||''))put(null,s.bg,'Background');for(const e of s.els||[]){if(e.type==='image')continue;if(['nf','barcode'].includes(e.type)){put('Black','#1d1d1f','Label');put('White','#ffffff','Label background');}else if(inksafe.test(e.color||''))put(null,e.color,'Designed');}
 return {items:out,artworkUnknown:(s.els||[]).some(e=>e.type==='image')&&!all.length};}
// Points are assigned at 72 per inch. This is a review sheet, not an approved die or ink separation.
function wicketFlat(size,lip=2,holeOffset=Math.min(2.5,size.w*.275)) {
 const {w,g,l}=size; if(![w,g,l,lip,holeOffset].every(Number.isFinite)||w<=0||l<=0||g<=0||lip<=0||holeOffset<=0||holeOffset>=w/2)throw Error('Invalid flat geometry');
 return {w,length:2*l+g+lip,front:{y:0,h:l},gusset:{y:l,h:g,center:l+g/2},back:{y:l+g,h:l,rot:180},lip:{y:2*l+g,h:lip},holes:[w/2-holeOffset,w/2+holeOffset]};
}
function drawPage(pw,ph) {
 const ops=[], num=n=>String(Math.round(n*1000)/1000);
 const color=v=>{const h=(v||'#111111').slice(1);return [0,2,4].map(i=>num(parseInt(h.slice(i,i+2),16)/255)).join(' ');};
 const clean=s=>String(s??'').replace(/[^\x20-\x7e]/g,'-').replace(/([\\()])/g,'\\$1');
 const text=(x,y,s,f='F1',z=11,ink='#263342',rot=false)=>ops.push(`BT /${f} ${z} Tf ${color(ink)} rg ${rot?'0 1 -1 0':'1 0 0 1'} ${num(x)} ${num(ph-y)} Tm (${clean(s)}) Tj ET`);
 const rect=(x,y,w,h,v)=>ops.push(`${color(v)} rg ${num(x)} ${num(ph-y-h)} ${num(w)} ${num(h)} re f`);
 const outline=(x,y,w,h,v,weight=.8,dash='[] 0')=>ops.push(`${color(v)} RG ${weight} w ${dash} d ${num(x)} ${num(ph-y-h)} ${num(w)} ${num(h)} re S`);
 const line=(x,y,x2,y2,v,weight=.8,dash='[] 0')=>ops.push(`${color(v)} RG ${weight} w ${dash} d ${num(x)} ${num(ph-y)} m ${num(x2)} ${num(ph-y2)} l S`);
 const image=(tag,x,y,w,h,rot=false)=>ops.push(rot?`q ${num(-w)} 0 0 ${num(-h)} ${num(x+w)} ${num(ph-y)} cm /${tag} Do Q`:`q ${num(w)} 0 0 ${num(h)} ${num(x)} ${num(ph-y-h)} cm /${tag} Do Q`);
 const circle=(x,y,r,ink)=>{const k=r*.5522847498,a=v=>num(x+v),b=v=>num(ph-y+v);ops.push(`1 1 1 rg ${color(ink)} RG 1.1 w [] 0 d ${a(r)} ${b(0)} m ${a(r)} ${b(k)} ${a(k)} ${b(r)} ${a(0)} ${b(r)} c ${a(-k)} ${b(r)} ${a(-r)} ${b(k)} ${a(-r)} ${b(0)} c ${a(-r)} ${b(-k)} ${a(-k)} ${b(-r)} ${a(0)} ${b(-r)} c ${a(k)} ${b(-r)} ${a(r)} ${b(-k)} ${a(r)} ${b(0)} c B`);};
 return {pw,ph,ops,text,rect,outline,line,image,circle};
}
function flatWicketPage({size,zone,logo,wicketLip,wicketHoleX}) {
 const P=72, f=wicketFlat(size,wicketLip,wicketHoleX), W=f.w*P,H=f.length*P;
 const x=94,y=173,right=x+W,end=y+H,note=right+53;
 const p=drawPage(Math.max(note+211,560),end+90),{text,rect,outline,line,image,circle,pw}=p;
 const cut='#252d39',fold='#166495',seal='#aa422f',safe='#28794e',dim='#536477',tint='#f0f3f6',hair='#a9b5c4';
 const dash='[4 3] 0', blue='[6 3] 0', long=s=>Number(s.toFixed(3)).toString();
 const at=b=>y+b.y*P, endOf=b=>at(b)+b.h*P;
 rect(0,0,pw,6,'#f0810a');if(logo)image('Logo',47,21,178,178*logo.height/logo.width);
 text(pw-205,36,'LAYOUT FOR REVIEW  /  01', 'F2',11,'#a95000');
 text(47,84,'Full flat dieline', 'F2',31,cut);
 text(48,105,`Wicketed bag  |  ${long(size.w)} x ${long(size.g)} x ${long(size.l)} in (W x G x body L)`, 'F1',12,dim);
 text(48,124,'Illustrative flat layout. Not for production.', 'F2',11,cut);
 // Front and back adjoin the full gusset in the flat; the back is 180 degrees to the front.
 image('Front',x,at(f.front),W,f.front.h*P);rect(x,at(f.gusset),W,f.gusset.h*P,tint);
 image('Back',x,at(f.back),W,f.back.h*P,true);rect(x,at(f.lip),W,f.lip.h*P,tint);
 const z=zone.safe, B=f.back.h*P;
 outline(x+z.x0*P,at(f.front)+z.y0*P,(z.x1-z.x0)*P,(z.y1-z.y0)*P,safe,.95,dash);
 outline(x+W-z.x1*P,at(f.back)+B-z.y1*P,(z.x1-z.x0)*P,(z.y1-z.y0)*P,safe,.95,dash);
 for(const a of [x+zone.seal*P,right-zone.seal*P])line(a,y,a,end,seal,1.1,dash);
 line(x,y+zone.trim*P,right,y+zone.trim*P,seal,.85,dash);
 line(x,at(f.lip)-zone.trim*P,right,at(f.lip)-zone.trim*P,seal,.85,dash);
 for(const yy of [at(f.gusset),y+f.gusset.center*P,at(f.back)])line(x,yy,right,yy,fold,1.05,blue);
 line(x,at(f.lip),right,at(f.lip),cut,1.15,dash);
 line(x,at(f.lip)+.235*P,right,at(f.lip)+.235*P,dim,.7,'[2 3] 0');
 const holeY=end-Math.min(.9,f.lip.h*.45)*P;for(const hx of f.holes)circle(x+hx*P,holeY,.236*P,cut);
 outline(x,y,W,H,cut,1.65);
 // Dimension lines are outside the only continuous silhouette.
 line(x,y-25,right,y-25,dim,.85);for(const a of [x,right]){line(a,y-32,a,y-7,hair,.75);line(a-3,y-22,a+3,y-28,dim,.85);}
 text(x+W/2-22,y-32,`${long(f.w)} in`,'F2',11,dim);
 line(x-34,y,x-34,end,dim,.85);for(const yy of [y,end]){line(x-42,yy,x-8,yy,hair,.75);line(x-37,yy+3,x-31,yy-3,dim,.85);}
 text(x-40,y+H/2+42,`${long(f.length)} in flat length`,'F2',11,dim,true);
 const lead=(b,tag,sub)=>{const yy=(at(b)+endOf(b))/2;line(right+5,yy,note-9,yy,hair,.8);text(note,yy-4,tag,'F2',13,cut);text(note,yy+14,sub,'F1',11,dim);};
 lead(f.front,'01  FRONT',`${long(f.front.h)} in body - opening at top`);
 lead(f.gusset,'02  BOTTOM GUSSET',`${long(f.gusset.h)} in - center fold shown`);
 lead(f.back,'03  BACK',`${long(f.back.h)} in body - rotated 180 degrees`);
 lead(f.lip,'04  WICKET LIP',`${long(f.lip.h)} in - hole positions illustrative`);
 const yy=y+25;
 text(note,yy,'GUIDE KEY','F2',10,cut);
 for(const [idx,ink,pattern,label] of [[0,cut,'[] 0','Outer layout edge'],[1,fold,blue,'Gusset folds'],[2,seal,dash,'Seal / mouth guides'],[3,safe,dash,'Safe artwork area']]){
  const ny=yy+20+idx*17;line(note,ny-3,note+23,ny-3,ink,1.18,pattern);text(note+30,ny,label,'F1',10,ink);
 }
 line(note,yy+98,pw-38,yy+98,hair,.65);
 text(note,yy+119,`Flat layout: ${long(f.w)} x ${long(f.length)} in`, 'F2',11,cut);
 text(note,yy+137,'Dimensions are shown at 100%.','F1',10,dim);
 text(note,yy+153,'Refer to page 2 for upright artwork.','F1',10,dim);
 const footer=end+37;line(47,footer-15,pw-37,footer-15,hair,.7);
 text(47,footer,'Design review only. Confirm construction, measurements, holes and separations with Metro.','F1',10,cut);
 text(47,footer+17,'METROPOLITAN PACKAGING  |  metropack.com  |  Sales@metropack.com','F2',9,dim);
 const barX=pw-116;line(barX,footer+15,barX+72,footer+15,cut,1);for(const a of [barX,barX+72])line(a,footer+11,a,footer+19,cut,1);
 text(barX,footer+31,'1 in at 100%','F1',8,dim);
 return p;
}
function serializeProof(pages,front,back,logo) {
 const ascii=s=>new TextEncoder().encode(s), objects=[];
 const jpg=cv=>Uint8Array.from(atob(cv.toDataURL('image/jpeg',.95).split(',')[1]),ch=>ch.charCodeAt(0));
 const plain=s=>objects.push([ascii(s)]),stream=(d,b)=>objects.push([ascii(`<< ${d} /Length ${b.length} >>\nstream\n`),b,ascii('\nendstream')]);
 const assets=[['Front',front],['Back',back],...(logo?[['Logo',logo]]:[])];
 const pageIds=pages.map((_,i)=>5+assets.length+2*i), xobj=assets.map(([key],i)=>`/${key} ${5+i} 0 R`).join(' ');
 plain('<< /Type /Catalog /Pages 2 0 R >>');plain(`<< /Type /Pages /Kids [${pageIds.map(i=>`${i} 0 R`).join(' ')}] /Count ${pages.length} >>`);
 plain('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');plain('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 for(const [,cv] of assets)stream(`/Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`,jpg(cv));
 for(const [i,p] of pages.entries()){
  plain(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p.pw} ${p.ph}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xobj} >> >> /Contents ${pageIds[i]+1} 0 R >>`);
  stream('',ascii(p.ops.join('\n')));
 }
 const parts=[ascii('%PDF-1.7\n%Metro design review\n')],ofs=[0];let at=parts[0].length;objects.forEach((o,i)=>{ofs.push(at);const a=[ascii(`${i+1} 0 obj\n`),...o,ascii('\nendobj\n')];parts.push(...a);for(const b of a)at+=b.length;});
 parts.push(ascii(`xref\n0 ${ofs.length}\n0000000000 65535 f \n${ofs.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size ${ofs.length} /Root 1 0 R >>\nstartxref\n${at}\n%%EOF\n`));
 return new Blob(parts,{type:'application/pdf'});
}
function proofPdf({type, size,film,front,back,logo,zone,plan,wicketLip=2,wicketHoleX=Math.min(2.5,size.w*.275),warnings=0}) {
 const P=72, num=n=>String(Math.round(n*1000)/1000), W=size.w*P,L=size.l*P,G=size.g*P;
 const isW=type==='wicket', lip=wicketLip*P, schematic=isW, gap=34;
 const xx=48,yy=isW?143:117,hh=isW?L+lip:2*L+G, pw=isW?2*W+2*xx+gap:Math.max(572,W+245), totalRows=Math.ceil(plan.items.length/2), footH=164+totalRows*20, bottom=yy+hh+48, ph=bottom+footH+22;
 const page=drawPage(pw,ph);const {text,rect,outline,line,image,circle}=page;
 const exact=n=>Number(n.toFixed(3)).toString(); const sizeText=`${exact(size.w)} x ${exact(size.g)} x ${exact(size.l)} in (W x G x L)`;
 rect(0,0,pw,7,'#f0810a'); const logoW=196;if(logo)image('Logo',xx,22,logoW,logoW*logo.height/logo.width);
 text(pw-184,43,isW?'ARTWORK REVIEW  /  02':'DESIGN REVIEW PROOF','F2',12,'#a95000'); text(xx,86,isW?'Wicketed bag':'Bottom gusset bread bag','F2',23);text(xx,104,isW?'Review only - wicket and seal geometry is indicative':'Not press-ready  |  Template and separations require Metro approval','F1',11,'#4e5966');
 if(!isW){
 image('Front',xx,yy,W,L);rect(xx,yy+L,W,G,'#fff4dc');image('Back',xx,yy+L+G,W,L,true);
 const flipY=(y,h)=>yy+hh-y-h, addZones=(back)=>{const trans=(x,y,w,h)=>back?[xx+W-x-w,flipY(y,h),w,h]:[xx+x,yy+y,w,h];const lt=zone.trim*P,ss=zone.seal*P;for(const t of [[0,0,W,lt],[0,lt,ss,L-lt],[W-ss,lt,ss,L-lt]])outline(...trans(...t),'#bd463a',1,'[4 2] 0');
   const f=zone.safe;outline(...trans(f.x0*P,f.y0*P,(f.x1-f.x0)*P,(f.y1-f.y0)*P),'#137548',.85,'[3 2] 0');const t=trans(0,zone.twist*P,W,0);line(t[0],t[1],t[0]+W,t[1],'#ab770f',.9,'[4 3] 0');};addZones(false);addZones(true);
 outline(xx,yy,W,hh,'#182c3c',1.25);line(xx,yy+L,xx+W,yy+L,'#182c3c',.95);line(xx,yy+L+G,xx+W,yy+L+G,'#182c3c',.95);line(xx,yy+L+G/2,xx+W,yy+L+G/2,'#ab770f',1,'[5 3] 0');
 const aside=xx+W+22;[['FRONT',yy+L/2,`${exact(size.l)} in`],['BOTTOM GUSSET',yy+L+G/2,`${exact(size.g)} in - center fold`],['BACK',yy+L+G+L/2,`${exact(size.l)} in - reversed on roll`]].forEach(([n,y,d])=>{line(xx+W,y,aside-5,y,'#b9c4ce');text(aside,y-4,n,'F2',11);text(aside,y+13,d,'F1',10,'#536477');});
 text(aside,yy+30,'PROOF GEOMETRY','F2',10);text(aside,yy+49,'Outer rule: full flat cut','F1',10);text(aside,yy+65,'Green dash: safe margin','F1',10,'#137548');text(aside,yy+81,'Red dash: seals and trim','F1',10,'#a93c30');text(aside,yy+97,'Gold dash: folds / gathers','F1',10,'#805b18');
 text(aside,yy+135,'Print at 100% to check scale.','F1',9);line(aside,yy+157,aside+72,yy+157,'#263342',1.1);line(aside,yy+153,aside,yy+161,'#263342',1.1);line(aside+72,yy+153,aside+72,yy+161,'#263342',1.1);text(aside,yy+174,'1 inch check bar','F1',9);
 } else {
 const bx=xx+W+gap, by=yy+lip, holeSpacing=2*wicketHoleX*P, holeY=yy+Math.min(.9,wicketLip*.45)*P;
 text(xx,yy-19,`FRONT   |   ${exact(size.w)} in W x ${exact(size.l)} in L`,'F2',12);text(bx,yy-19,`BACK   |   ${exact(wicketLip)} in wicket lip shown`,'F2',12);
 rect(bx,yy,W,lip,'#e8ebf1');outline(bx,yy,W,lip,'#263342',1.1);
 text(bx+13,yy+17,'BACK LIP - NO ARTWORK','F2',10,'#4e5966');
 for(const x of [bx+W/2-holeSpacing/2,bx+W/2+holeSpacing/2])circle(x,holeY,.236*P,'#263342');
 line(bx,by-.236*P,bx+W,by-.236*P,'#6d687b',1,'[5 3] 0');
 image('Front',xx,by,W,L);image('Back',bx,by,W,L);
 for(const tx of [xx,bx]){const f=zone.safe,ss=zone.seal*P;
  outline(tx,by,W,L,'#263342',1.1);outline(tx,by,ss,L,'#bd463a',.75,'[5 3] 0');outline(tx+W-ss,by,ss,L,'#bd463a',.75,'[5 3] 0');
  outline(tx+f.x0*P,by+f.y0*P,(f.x1-f.x0)*P,(f.y1-f.y0)*P,'#137548',.8,'[5 3] 0');
  line(tx,by+L-.45*P,tx+W,by+L-.45*P,'#ab770f',1,'[5 3] 0');
 }
 text(xx,by+L+24,'Dashed guides show margins, seals and folds for review only.','F1',10,'#536477');
 }
 const second=pw/2+10;rect(xx,bottom-9,pw-2*xx,footH-2,'#f2f5f7');line(xx,bottom-9,pw-xx,bottom-9,'#f0810a',2);const q=xx+14;
 text(q,bottom+15,'DIELINE DETAILS','F2',13);text(second,bottom+15,'INKS FOR REVIEW','F2',13);
 text(q,bottom+38,`Bag: ${sizeText}`,'F1',11);text(q,bottom+55,isW?`Body: ${exact(size.w)} x ${exact(size.l)} in; bottom gusset: ${exact(size.g)} in`:`Flat cut: ${exact(size.w)} x ${exact(2*size.l+size.g)} in`,'F1',11);text(q,bottom+72,`Film: ${film==='white'?'White':'Clear'}   |   ${isW?'Both sides upright (page 2)':'Front / fold / back'}`,'F1',10);text(q,bottom+89,isW?'Back lip and wicket holes: illustrative only':`Side seals ${exact(zone.seal)} in ea.   |   Opening trim ${exact(zone.trim)} in`,'F1',10);text(q,bottom+106,`Safe inset ${exact(zone.margin)} in  |  ${warnings} placement flag${warnings===1?'':'s'} to review`,'F1',10);
 text(second,bottom+38,`${plan.items.length} ${plan.artworkUnknown?'known + imported artwork TBD':'listed'} ink${plan.items.length===1?'':'s'}`,'F2',11);text(second,bottom+55,'Design selections and declared inks; not press plates.','F1',9);
 plan.items.forEach((v,i)=>{const dy=bottom+75+Math.floor(i/2)*20;const x=second+(i%2)*(pw/4-21);if(v.c){rect(x,dy-9,10,10,v.c);outline(x,dy-9,10,10,'#a0aeb9',.4);}text(x+(v.c?14:0),dy,`${String(v.name).slice(0,pw<680?20:29)}${v.c&&v.c.toLowerCase()!==v.name.toLowerCase()?' '+v.c.toUpperCase():''}`,'F1',8.7);});
 const fy=bottom+footH-25;line(q,fy-14,pw-q,fy-14,'#c5cfd8');text(q,fy,'METROPOLITAN PACKAGING  |  metropack.com  |  Sales@metropack.com','F2',10);
 text(q,fy+14,(schematic?'Confirm wicket measurements, print separations and label content before production.':'Indicative template only. Confirm dimensions, print separations and label content before production.'),'F1',9,'#3c4d5b');
 return serializeProof(isW?[flatWicketPage({size,zone,logo,wicketLip,wicketHoleX}),page]:[page],front,back,logo);
}

globalThis.MetroProof={NF,foot,E,SHAPES,nfSvg,nfCanvas,nfOps,barcode,checkDigit,barSvg,barCanvas,inkPlan,wicketFlat,proofPdf};
})();