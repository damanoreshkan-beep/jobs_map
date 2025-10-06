(()=>{
  const S=window,D=document;
  const log=(...a)=>console.log('[geoPulse]',...a);
  const $=s=>D.querySelector(s), C=(t,p={})=>Object.assign(D.createElement(t),p);

  // Base styles
  Object.assign(D.documentElement.style,{height:'100%'});
  Object.assign(D.body.style,{
    margin:'0',height:'100%',background:'#0a0f0a',
    fontFamily:'system-ui,Segoe UI,Arial',color:'#eaffea',
    overflow:'hidden',touchAction:'pan-y'
  });

  // Root + layers
  const root=C('div',{id:'jc-root'});
  const anim=C('canvas',{id:'jc-anim','aria-hidden':'true'});
  const mapWrap=C('div',{id:'jc-map'});
  const panel=C('div',{id:'jc-panel','aria-live':'polite'});
  const head=C('div',{id:'jc-head'});
  const ttl=C('div',{id:'jc-ttl',textContent:'Готуємо дані…'});
  const cnt=C('div',{id:'jc-cnt',textContent:'0 / 0'});
  const pro=C('button',{id:'jc-pro',textContent:'PRO $4.99/y',type:'button'});
  const metaBox=C('div',{id:'jc-meta'});
  head.append(ttl,cnt,pro); panel.append(head,metaBox);
  root.append(anim,mapWrap,panel); D.body.append(root);

  // Styles
  const css=C('style'); css.textContent=`
    #jc-root{position:fixed;inset:0}
    #jc-anim{position:absolute;inset:0;z-index:0}
    #jc-map{position:absolute;inset:0;z-index:1}
    #jc-map .leaflet-container{width:100%;height:100%}
    #jc-panel{
      position:absolute; right:16px; bottom:16px; z-index:3;
      width:min(480px,36vw); max-width:92vw;
      height:42vh; max-height:78vh; min-height:220px;
      display:grid; grid-template-rows:auto 1fr; gap:12px; padding:14px 14px 12px;
      background:linear-gradient(to bottom right, rgba(10,20,10,.58), rgba(8,12,8,.34));
      border:1px solid rgba(180,255,210,.18);
      border-right-color:rgba(180,255,210,.28);
      border-top-color:rgba(180,255,210,.24);
      box-shadow:0 18px 50px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter:blur(14px) saturate(1.18);
      -webkit-backdrop-filter:blur(14px) saturate(1.18);
      border-radius:14px;
    }
    #jc-head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px}
    #jc-ttl{font-size:18px;font-weight:800;line-height:1.25;color:#b9ffb9;text-shadow:0 0 12px rgba(0,255,120,.25)}
    #jc-cnt{font-weight:700;color:#9cff9c;opacity:.9}
    #jc-pro{appearance:none;border:1px solid rgba(0,255,120,.25);background:rgba(0,0,0,.35);
      color:#b9ffb9;font-weight:800;border-radius:999px;padding:8px 12px}
    #jc-pro:active{transform:scale(.98)}
    #jc-meta{overflow:auto;padding-right:6px}
    #jc-meta::-webkit-scrollbar{width:6px}
    #jc-meta::-webkit-scrollbar-thumb{background:#1b3;border-radius:99px}
    .kv{display:grid;grid-template-columns:140px 1fr;gap:8px 10px;align-items:start}
    .k{color:#8dfb8d;font-weight:700;white-space:nowrap}
    .v{color:#eaffea;word-break:break-word}
    .jc-dot-normal{}
    .jc-dot-active{filter:drop-shadow(0 0 6px rgba(0,255,160,.6))}
    @media (max-width:900px){
      #jc-panel{left:0;right:0;bottom:0;margin:0;width:100%;max-width:none;
        height:52vh;max-height:86vh;border-radius:16px 16px 0 0;padding:16px 14px 12px}
      .kv{grid-template-columns:110px 1fr} #jc-ttl{font-size:17px}
    }
    @media (max-width:560px){ #jc-panel{height:58vh} .kv{grid-template-columns:96px 1fr} }

    /* Loader overlay */
    #jc-load{
      position:absolute;inset:0;z-index:4;display:grid;place-items:center;
      background:radial-gradient(1200px 800px at 50% 50%, rgba(0,40,20,.35), rgba(0,0,0,.85));
      backdrop-filter:blur(6px) saturate(1.05); -webkit-backdrop-filter:blur(6px) saturate(1.05);
    }
    #jc-load-card{
      width:min(720px,90vw);border-radius:16px;padding:18px 18px 14px;
      background:linear-gradient( to bottom right, rgba(10,30,16,.6), rgba(6,14,10,.36) );
      border:1px solid rgba(0,255,140,.15);
      box-shadow:0 18px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);
    }
    #jc-load-title{font-weight:900;color:#b9ffb9;margin:0 0 10px 0}
    #jc-bar{height:10px;border-radius:999px;background:#072;position:relative;overflow:hidden}
    #jc-bar>i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:999px;background:linear-gradient(90deg,#0b4,#0f8)}
    #jc-bar>u{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 12px, rgba(255,255,255,.06) 12px 24px)}
    #jc-stats{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:#9cff9c;font-weight:700}
    #jc-grid{margin-top:12px;height:160px;position:relative;border-radius:12px;background:#051;overflow:hidden;border:1px solid rgba(0,255,120,.15)}
    #jc-grid>canvas{position:absolute;inset:0;display:block}
  `; D.head.append(css);

  pro.onclick=()=>alert('Бета-версія PRO оформлена. Дякуємо! Це попередній перегляд — скоро стане доступно.');

  // Helpers
  const pickTitle=o=>(o?.title||o?.position||o?.name||o?.header||o?.role||'Без назви')+'';
  const latOf=o=>o?.lat??o?.latitude??o?.geo?.lat??o?.coordinates?.[1];
  const lonOf=o=>o?.lon??o?.lng??o?.longitude??o?.geo?.lon??o?.coordinates?.[0];
  const chooseArray=j=>{
    if(Array.isArray(j)) return j;
    if(j && typeof j==='object'){
      for(const k of ['data','items','results','list']) if(Array.isArray(j[k])) return j[k];
      const firstArr=Object.values(j).find(v=>Array.isArray(v)); if(firstArr) return firstArr;
    }
    return [];
  };
  const flatten=(obj)=>{
    const out=[], push=(k,v)=>{ if(v==null||v==='') return; out.push([k, typeof v==='object'? JSON.stringify(v): String(v)]) };
    if(Array.isArray(obj)){ push('items', JSON.stringify(obj)); return out }
    for(const k of Object.keys(obj||{})){
      const v=obj[k];
      if(typeof v==='object' && v && !Array.isArray(v) && Object.keys(v).length<=6){
        for(const kk of Object.keys(v)) push(`${k}.${kk}`, v[kk])
      }else push(k,v);
    }
    return out;
  };
  const topKeys=['company','employer','org','addr','address','street','city','location','salary','description','desc','about','url','link'];

  // Loader UI
  const loadOverlay=C('div',{id:'jc-load'});
  const loadCard=C('div',{id:'jc-load-card'});
  const loadTitle=C('h3',{id:'jc-load-title',textContent:'Завантаження вакансій…'});
  const bar=C('div',{id:'jc-bar'}), barFill=C('i'), barSheen=C('u');
  bar.append(barFill,barSheen);
  const stats=C('div',{id:'jc-stats'});
  const sLeft=C('div',{textContent:'0 з 0'}), sPct=C('div',{textContent:'0%'}); stats.append(sLeft,sPct);
  const grid=C('div',{id:'jc-grid'}), gridCanvas=C('canvas'); grid.append(gridCanvas);
  loadCard.append(loadTitle,bar,stats,grid); loadOverlay.append(loadCard); root.append(loadOverlay);

  const setProgress=(done,total)=>{
    const pct=total? Math.round((done/total)*100) : 0;
    barFill.style.width=`${pct}%`;
    sLeft.textContent=`${done} з ${total}`;
    sPct.textContent=`${pct}%`;
  };
  const showLoader=()=>{ loadOverlay.style.display='grid' };
  const hideLoader=()=>{ loadOverlay.style.display='none' };

  // Pre-grid micro animation (inside loader) — green chaos with pulses
  const startGridAnim=()=>{
    const ctx=gridCanvas.getContext('2d',{alpha:false});
    const fit=()=>{ const r=grid.getBoundingClientRect(); gridCanvas.width=r.width; gridCanvas.height=r.height; };
    fit(); new ResizeObserver(fit).observe(grid);
    const dots=[...Array(120)].map(()=>({
      x:Math.random()*gridCanvas.width,
      y:Math.random()*gridCanvas.height,
      vx:(Math.random()-.5)*0.4,
      vy:(Math.random()-.5)*0.4,
      t:Math.random()*200
    }));
    const step=()=>{
      const {width:w,height:h}=gridCanvas;
      ctx.fillStyle='#051'; ctx.fillRect(0,0,w,h);
      // grid lines
      ctx.globalAlpha=0.15; ctx.beginPath();
      for(let x=0;x<w;x+=16){ ctx.moveTo(x,0); ctx.lineTo(x,h) }
      for(let y=0;y<h;y+=16){ ctx.moveTo(0,y); ctx.lineTo(w,y) }
      ctx.strokeStyle='#083'; ctx.lineWidth=1; ctx.stroke(); ctx.globalAlpha=1;

      for(const d of dots){
        d.x+=d.vx; d.y+=d.vy; d.t=(d.t+1)%240;
        if(d.x<0||d.x>w) d.vx*=-1;
        if(d.y<0||d.y>h) d.vy*=-1;

        // pulse
        const phase=(d.t/240);
        const r=6+phase*22;
        ctx.beginPath(); ctx.arc(d.x,d.y,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,140,${0.25*(1-phase)})`; ctx.lineWidth=1.5; ctx.stroke();

        ctx.beginPath(); ctx.arc(d.x,d.y,2,0,Math.PI*2);
        ctx.fillStyle='#0f8'; ctx.fill();
      }
      S.requestAnimationFrame(step);
    };
    step();
  };
  startGridAnim();

  // Map + items
  let map=null, layer=null, items=[], markers=[], current=null;

  const ensureLeaflet=async()=>{
    if(S.L) return true;
    const lc=C('link',{rel:'stylesheet',href:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',crossOrigin:''});
    const sc=C('script',{src:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',crossOrigin:''});
    D.head.append(lc); await new Promise(r=>{sc.onload=r; D.head.append(sc)});
    return !!S.L;
    };
  const setupMap=async()=>{
    const ok=await ensureLeaflet(); if(!ok) return false;
    map=L.map(mapWrap,{zoomControl:false,attributionControl:false,preferCanvas:true});
    const tiles='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tiles,{minZoom:2,maxZoom:20,crossOrigin:true}).addTo(map);
    layer=L.featureGroup().addTo(map);
    S.setTimeout(()=>map.invalidateSize(),50);
    return true;
  };

  const styleNormal={radius:4,weight:1,color:'#00ff78',fillColor:'#00aa55',fillOpacity:.75,className:'jc-dot-normal'};
  const styleActive={radius:7,weight:2,color:'#7bffb7',fillColor:'#00dd77',fillOpacity:.9,className:'jc-dot-active'};

  const highlight=(idx)=>{
    if(current!=null && markers[current]) markers[current].setStyle(styleNormal);
    current=idx;
    if(markers[idx]) markers[idx].setStyle(styleActive);
  };

  const renderPanel=(it,i)=>{
    if(!it){ ttl.textContent='Наведіть на точку…'; cnt.textContent=items.length?`0 / ${items.length}`:''; metaBox.innerHTML=''; return }
    ttl.textContent=pickTitle(it);
    cnt.textContent=`${i+1} / ${items.length}`;
    const kv=C('div',{className:'kv'});
    const pairs=flatten(it).filter(([k])=>!/^id$|^title$|^name$|^position$|^header$|^role$/i.test(k));
    pairs.sort((a,b)=> (topKeys.includes(a[0])?-1:0)-(topKeys.includes(b[0])?-1:0) || a[0].localeCompare(b[0]));
    metaBox.innerHTML='';
    for(const [k,v] of pairs.slice(0,80)){
      const dk=C('div',{className:'k',textContent:k});
      const dv=C('div',{className:'v'});
      if(/^https?:\/\//.test(v)){ dv.append(C('a',{href:v,target:'_blank',textContent:v,style:'color:#9cff9c;text-decoration:underline'})) }
      else dv.textContent=v;
      kv.append(dk,dv);
    }
    metaBox.append(kv);
  };

  const addAllPoints=arr=>{
    markers=[]; layer.clearLayers();
    let bounds=null, count=0;
    arr.forEach((it,i)=>{
      const la=+latOf(it), lo=+lonOf(it);
      if(!Number.isFinite(la)||!Number.isFinite(lo)) return;
      const m=L.circleMarker([la,lo],styleNormal);
      m.on('mouseover',()=>{renderPanel(it,i); highlight(i)});
      m.on('click',()=>{renderPanel(it,i); highlight(i)});
      layer.addLayer(m); markers.push(m); count++;
      bounds=bounds?bounds.extend([la,lo]):L.latLngBounds([la,lo],[la,lo]);
    });
    log('Rendered points:', count);
    if(layer.getLayers().length && bounds?.isValid()){
      map.fitBounds(bounds.pad(Math.min(0.15,0.33)),{animate:false});
    }else{
      map.setView([50.4501,30.5234],12);
    }
  };

  // Background radio-wave field (after map render)
  const startBackAnim=()=>{
    const ctx=anim.getContext('2d',{alpha:false});
    const fit=()=>{ anim.width=innerWidth; anim.height=innerHeight; };
    fit(); S.addEventListener('resize',fit,{passive:true});
    const N=Math.min(320, Math.floor((innerWidth*innerHeight)/8000));
    const dots=[...Array(N)].map(()=>({
      x:Math.random()*anim.width,
      y:Math.random()*anim.height,
      vx:(Math.random()-.5)*0.25,
      vy:(Math.random()-.5)*0.25,
      t:Math.random()*400|0,
      off:(Math.random()*Math.PI*2)
    }));
    const step=()=>{
      const {width:w,height:h}=anim;
      // dark base
      ctx.fillStyle='#0a0f0a'; ctx.fillRect(0,0,w,h);
      // subtle cell grid
      ctx.globalAlpha=0.10; ctx.beginPath();
      for(let x=0;x<w;x+=24){ ctx.moveTo(x,0); ctx.lineTo(x,h) }
      for(let y=0;y<h;y+=24){ ctx.moveTo(0,y); ctx.lineTo(w,y) }
      ctx.strokeStyle='#0b331f'; ctx.lineWidth=1; ctx.stroke(); ctx.globalAlpha=1;

      // dots + radio pulses
      for(const d of dots){
        d.x+=d.vx; d.y+=d.vy; d.t=(d.t+1)%420;
        if(d.x<0||d.x>w) d.vx*=-1;
        if(d.y<0||d.y>h) d.vy*=-1;

        const phase=(d.t/420);
        const r1=8 + 40*phase, r2=18 + 70*((phase+.33)%1), r3=28 + 100*((phase+.66)%1);
        const alpha=0.28*(1-phase);

        ctx.beginPath(); ctx.arc(d.x,d.y,r1,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,140,${alpha})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,r2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,200,120,${alpha*0.8})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,r3,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,150,100,${alpha*0.6})`; ctx.lineWidth=1; ctx.stroke();

        ctx.beginPath(); ctx.arc(d.x,d.y,2,0,Math.PI*2);
        ctx.fillStyle='#0f8'; ctx.fill();
      }
      S.requestAnimationFrame(step);
    };
    step();
  };

  // Fetch chunk list first
  const getPicks=async()=>{
    const list=await fetch('/jobs/chunks-list.json',{cache:'no-store'})
      .then(r=>{ if(!r.ok) throw new Error('chunks-list.json not found'); return r.json() })
      .then(j=>Array.isArray(j)?j:chooseArray(j))
      .catch(e=>{ log('Error list:', e); return [] });
    log('Chunk URLs:', list);
    return list;
  };

  // Main load with progress-first, then map render
  const load=async()=>{
    showLoader();
    ttl.textContent='Завантаження вакансій…';

    const picks=await getPicks();
    setProgress(0,picks.length);
    cnt.textContent=`0 / 0`;

    if(!picks.length){
      loadTitle.textContent='Не знайшов перелік чанків';
      hideLoader();
      return;
    }

    // Concurrent fetch with live progress
    let done=0; items=[];
    const fetchOne=async(u)=>{
      try{
        const r=await fetch(u,{cache:'no-store'});
        if(!r.ok) throw new Error('HTTP '+r.status);
        const j=await r.json();
        const arr=chooseArray(j);
        if(arr?.length) items.push(...arr);
        log('loaded', u, 'items:', arr?.length||0);
      }catch(err){
        log('fail', u, err?.message||err);
      }finally{
        done++; setProgress(done,picks.length);
      }
    };

    await Promise.allSettled(picks.map(fetchOne));

    log('Total items:', items.length);
    loadTitle.textContent=items.length ? `Готово: ${items.length} вакансій` : 'Даних не знайдено';

    // Only now setup map and render once
    const ok=await setupMap();
    if(ok && items.length){
      addAllPoints(items);
      renderPanel(null,-1);
      cnt.textContent=`0 / ${items.length}`;
    }else{
      ttl.textContent='Не вдалося відрендерити карту';
    }

    // Start subtle background radio waves
    startBackAnim();

    // Hide loader
    S.setTimeout(hideLoader, 400);
  };

  // Meta rendering once map is ready
  const topIntro=()=>{
    metaBox.innerHTML='';
    const kv=C('div',{className:'kv'});
    const lines=[
      ['hint','Наведіть на точку на карті'],
      ['loaded','Очікуємо завантаження…'],
      ['pro','PRO відкриє фільтри, пошук, експорт']
    ];
    for(const [k,v] of lines){
      kv.append(C('div',{className:'k',textContent:k}), C('div',{className:'v',textContent:v}));
    }
    metaBox.append(kv);
  };
  topIntro();

  // Kick off
  load();
})();