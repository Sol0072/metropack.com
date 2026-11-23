/* A quiet control shell; rendering and exports stay in designer.js. */
(() => {
 const $=(q)=>document.querySelector(q), tabs=Array.from(document.querySelectorAll('[data-edit-tab]'));
 const activate=(name,focus=false)=>{
  tabs.forEach(t=>{const on=t.dataset.editTab===name;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1; document.getElementById(t.getAttribute('aria-controls')).hidden=!on;if(on&&focus)t.focus({preventScroll:true});});
 };
 $('#editTabs').addEventListener('click',e=>{const t=e.target.closest('[data-edit-tab]');if(t)activate(t.dataset.editTab);});
 $('#editTabs').addEventListener('keydown',e=>{const i=tabs.indexOf(e.target);if(i<0)return; const n={ArrowLeft:(i-1+tabs.length)%tabs.length,ArrowRight:(i+1)%tabs.length,Home:0,End:tabs.length-1}[e.key];if(n!==undefined){e.preventDefault();activate(tabs[n].dataset.editTab,true);}});
 document.addEventListener('click',e=>{const t=e.target.closest('[data-jump-tab]');if(t)activate(t.dataset.jumpTab,true);if(e.target.closest('#empty [data-act="logo"]'))activate('art');const menu=$('.quiet-menu');if(menu.open&&(!menu.contains(e.target)||e.target.closest('.menu-content button')))menu.open=false;},true);
})();