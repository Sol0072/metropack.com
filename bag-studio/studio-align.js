/* Bag Studio · context-aware drag center guides. Geometry is in upright panel inches. */
(function(){'use strict';
const valid=b=>b&&[b.x0,b.y0,b.x1,b.y1].every(Number.isFinite);
const ext=(b,axis)=>axis==='x'?[b.x0,b.x1]:[b.y0,b.y1];
const gap=([a,b],[c,d])=>Math.max(0,c-b,a-d);
const footing=new Set(['shape','band','image']);
function under(e,q,tol){
  if(!footing.has(q.type)||q.index>=e.index||!q.w||!q.h)return false;
  const r=(q.rot||0)*Math.PI/180,s=Math.sin(r),c=Math.cos(r),x=e.x-q.x,y=e.y-q.y;
  if(Math.abs(c*x+s*y)>q.w/2+tol*.4||Math.abs(c*y-s*x)>q.h/2+tol*.4)return false;
  const w=e.box.x1-e.box.x0,h=e.box.y1-e.box.y0;
  return w<=(q.box.x1-q.box.x0)*1.18+tol&&h<=(q.box.y1-q.box.y0)*1.18+tol;
}
function snap(e,others,width,length,tol){
  const pos={x:e.x,y:e.y,guides:[]};if(!valid(e.box)||!Number.isFinite(tol)||tol<=0)return pos;
  const peers=others.filter(q=>q.id!==e.id&&q.panel===e.panel&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&valid(q.box));
  const board=peers.filter(q=>under(e,q,tol)).sort((a,b)=>a.w*a.h-b.w*b.h||b.index-a.index)[0];
  for(const axis of ['x','y']){
    const cross=axis==='x'?'y':'x',near=q=>Math.abs(e[axis]-q[axis])<=tol;
    let target=board&&near(board)?board:null,kind=target?'layer':'';
    if(!target&&!board){
      const dist=q=>gap(ext(q.box,cross),ext(e.box,cross));
      const aligned=peers.filter(q=>near(q)&&dist(q)<=.62);
      aligned.sort((a,b)=>Math.abs(a[axis]-e[axis])-Math.abs(b[axis]-e[axis])||dist(a)-dist(b)||b.index-a.index);
      if(aligned.length){target=aligned[0];kind='peer';}
    }
    if(target){
      const [s0,s1]=ext(target.box,cross),[e0,e1]=ext(e.box,cross);
      pos[axis]=target[axis];
      pos.guides.push({axis,value:target[axis],from:Math.min(s0,e0),to:Math.max(s1,e1),kind,target:target.id});
    }else{
      const v=(axis==='x'?width:length)/2;
      if(Math.abs(e[axis]-v)<=tol){pos[axis]=v;pos.guides.push({axis,value:v,from:0,to:axis==='x'?length:width,kind:'bag'});}
    }
  }
  return pos;
}
const api={snap};globalThis.MetroAlignment=api;if(typeof module==='object')module.exports=api;
})();
