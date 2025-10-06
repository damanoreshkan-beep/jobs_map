(()=>{
  const S=window,D=document,log=(...a)=>console.log('[geoPulse]',...a),$=s=>D.querySelector(s),C=(t,p={})=>Object.assign(D.createElement(t),p);

  Object.assign(D.documentElement.style,{height:'100%'});
  Object.assign(D.body.style,{margin:'0',height:'100%',background:'#0a0f0a',fontFamily:'system-ui,Segoe UI,Arial',color:'#eaffea',overflow:'hidden',touchAction:'pan-y'});

  const root=C('div',{id:'jc-root'});
  const anim=C('canvas',{id:'jc-anim','aria-hidden':'true'});
  const mapWrap=C('div',{id:'jc-map'});
  const panel=C('div',{id:'jc-panel','aria-live':'polite'});
  const head=C('div',{id:'jc-head'});
  const ttl=C('div',{id:'jc-ttl',textContent:'Готуємо дані…'});
  const cnt=C('div',{id:'jc-cnt',textContent:'0 / 0'});
  const pro=C('button',{id:'jc-pro',textContent:'PRO $4.99/y',type:'button'});
  const metaBox=C('div',{id:'jc-meta'});
  head.append(ttl,cnt,pro);
  panel.append(head,metaBox);
  root.append(anim,mapWrap,panel);
  D.body.append(root);

  const css=C('style');
  css.textContent=`
    #jc-root{position:fixed;inset:0}
    #jc-anim{position:absolute;inset:0;z-index:0}
    #jc-map{position:absolute;inset:0;z-index:1}
    #jc-map .leaflet-container{width:100%;height:100%}
    #jc-panel{
      position:absolute;right:16px;bottom:16px;z-index:3;
      width:min(480px,36vw);max-width:92vw;height:42vh;max-height:78vh;min-height:220px;
      display:grid;grid-template-rows:auto 1fr;gap:12px;padding:14px 14px 12px;
      background:linear-gradient(to bottom right,rgba(10,20,10,.58),rgba(8,12,8,.34));
      border:1px solid rgba(180,255,210,.18);
      border-right-color:rgba(180,255,210,.28);
      border-top-color:rgba(180,255,210,.24);
      box-shadow:0 18px 50px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter:blur(14px) saturate(1.18);
      -webkit-backdrop-filter:blur(14px) saturate(1.18);
      border-radius:14px
    }
    #jc-head{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px}
    #jc-ttl{font-size:18px;font-weight:800;line-height:1.25;color:#b9ffb9;text-shadow:0 0 12px rgba(0,255,120,.25)}
    #jc-cnt{font-weight:700;color:#9cff9c;opacity:.9}
    #jc-pro{
      appearance:none;border:1px solid rgba(0,255,120,.25);background:rgba(0,0,0,.35);
      color:#b9ffb9;font-weight:800;border-radius:999px;padding:8px 12px
    }
    #jc-pro:active{transform:scale(.98)}
    #jc-meta{overflow:auto;padding-right:6px}
    #jc-meta::-webkit-scrollbar{width:6px}
    #jc-meta::-webkit-scrollbar-thumb{background:#1b3;border-radius:99px}
    .kv{display:grid;grid-template-columns:140px 1fr;gap:8px 10px;align-items:start}
    .k{color:#8dfb8d;font-weight:700;white-space:nowrap}
    .v{color:#eaffea;word-break:break-word}
    .jc-dot-active{filter:drop-shadow(0 0 6px rgba(0,255,160,.6))}
    @media (max-width:900px){
      #jc-panel{left:0;right:0;bottom:0;margin:0;width:100%;max-width:none;height:52vh;max-height:86vh;border-radius:16px 16px 0 0;padding:16px 14px 12px}
      .kv{grid-template-columns:110px 1fr}
      #jc-ttl{font-size:17px}
    }
    @media (max-width:560px){
      #jc-panel{height:58vh}
      .kv{grid-template-columns:96px 1fr}
    }
    #jc-load{
      position:absolute;inset:0;z-index:4;display:grid;place-items:center;
      background:radial-gradient(1200px 800px at 50% 50%, rgba(0,40,20,.35), rgba(0,0,0,.85));
      backdrop-filter:blur(6px) saturate(1.05);
      -webkit-backdrop-filter:blur(6px) saturate(1.05)
    }
    #jc-load-card{
      width:min(720px,90vw);border-radius:16px;padding:18px 18px 14px;
      background:linear-gradient(to bottom right, rgba(10,30,16,.6), rgba(6,14,10,.36));
      border:1px solid rgba(0,255,140,.15);
      box-shadow:0 18px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)
    }
    #jc-load-title{font-weight:900;color:#b9ffb9;margin:0 0 10px 0}
    #jc-bar{height:10px;border-radius:999px;background:#072;position:relative;overflow:hidden}
    #jc-bar>i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:999px;background:linear-gradient(90deg,#0b4,#0f8)}
    #jc-bar>u{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 12px, rgba(255,255,255,.06) 12px 24px)}
    #jc-stats{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:#9cff9c;font-weight:700}
    #jc-grid{margin-top:12px;height:160px;position:relative;border-radius:12px;background:#051;overflow:hidden;border:1px solid rgba(0,255,120,.15)}
    #jc-grid>canvas{position:absolute;inset:0;display:block}
    #jc-substats{margin-top:6px;display:flex;gap:12px;justify-content:flex-end;color:#8dfb8d;font-weight:600;opacity:.9;font-size:12px}
  `;
  D.head.append(css);

  pro.onclick=()=>alert('Бета-версія PRO оформлена. Дякуємо! Це попередній перегляд — скоро стане доступно.');

  const pickTitle=o=>(o?.title||o?.position||o?.name||o?.header||o?.role||'Без назви')+'';
  const latOf=o=>o?.lat??o?.latitude??o?.geo?.lat??o?.coordinates?.[1];
  const lonOf=o=>o?.lon??o?.lng??o?.longitude??o?.geo?.lon??o?.coordinates?.[0];
  const chooseArray=j=>{ if(Array.isArray(j))return j; if(j&&typeof j==='object'){ for(const k of ['data','items','results','list']) if(Array.isArray(j[k])) return j[k]; const a=Object.values(j).find(v=>Array.isArray(v)); if(a) return a } return [] };
  const flatten=obj=>{ const out=[]; const push=(k,v)=>{ if(v==null||v==='')return; out.push([k,typeof v==='object'?JSON.stringify(v):String(v)]) }; if(Array.isArray(obj)){ push('items',JSON.stringify(obj)); return out } for(const k of Object.keys(obj||{})){ const v=obj[k]; if(typeof v==='object'&&v&&!Array.isArray(v)&&Object.keys(v).length<=6){ for(const kk of Object.keys(v)) push(`${k}.${kk}`,v[kk]) } else push(k,v) } return out };
  const topKeys=['company','employer','org','addr','address','street','city','location','salary','description','desc','about','url','link'];

  const loadOverlay=C('div',{id:'jc-load'});
  const loadCard=C('div',{id:'jc-load-card'});
  const loadTitle=C('h3',{id:'jc-load-title',textContent:'Завантаження вакансій…'});
  const bar=C('div',{id:'jc-bar'});
  const barFill=C('i');
  const barSheen=C('u');
  bar.append(barFill,barSheen);
  const stats=C('div',{id:'jc-stats'});
  const sLeft=C('div',{textContent:'0 файлів'});
  const sPct=C('div',{textContent:'0%'});
  stats.append(sLeft,sPct);
  const sub=C('div',{id:'jc-substats'});
  const sMB=C('div',{textContent:'0.00 / 0.00 MB'});
  const sSp=C('div',{textContent:'0.0 MB/s'});
  const sEta=C('div',{textContent:'ETA — ∞'});
  sub.append(sMB,sSp,sEta);
  const grid=C('div',{id:'jc-grid'});
  const gridCanvas=C('canvas');
  grid.append(gridCanvas);
  loadCard.append(loadTitle,bar,stats,sub,grid);
  loadOverlay.append(loadCard);
  root.append(loadOverlay);

  const fmtMB=b=>(b/1048576).toFixed(2);
  let bytesTotal=0,bytesDone=0,filesTotal=0,filesDone=0,t0=performance.now();

  const setProgress=()=>{
    const pct=bytesTotal?Math.min(100,Math.round(bytesDone/bytesTotal*100)):0;
    barFill.style.width=pct+'%';
    sLeft.textContent=`${filesDone} з ${filesTotal} файлів`;
    sPct.textContent=`${pct}%`;
    sMB.textContent=`${fmtMB(bytesDone)} / ${fmtMB(bytesTotal||bytesDone)} MB`;
    const dt=(performance.now()-t0)/1000;
    const sp=dt?bytesDone/1048576/dt:0;
    sSp.textContent=`${sp.toFixed(1)} MB/s`;
    const left=bytesTotal?bytesTotal-bytesDone:0;
    const etaSec=sp?left/1048576/sp:Infinity;
    sEta.textContent=`ETA — ${isFinite(etaSec)?Math.max(0,etaSec).toFixed(0)+'s':'∞'}`;
  };

  const showLoader=()=>{loadOverlay.style.display='grid'};
  const hideLoader=()=>{loadOverlay.style.display='none'};

  const startGridAnim=()=>{
    const ctx=gridCanvas.getContext('2d',{alpha:false});
    const fit=()=>{const r=grid.getBoundingClientRect(); gridCanvas.width=r.width; gridCanvas.height=r.height};
    fit(); new ResizeObserver(fit).observe(grid);
    const dots=[...Array(120)].map(()=>({x:Math.random()*gridCanvas.width,y:Math.random()*gridCanvas.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,t:Math.random()*200}));
    const step=()=>{
      const {width:w,height:h}=gridCanvas;
      ctx.fillStyle='#051'; ctx.fillRect(0,0,w,h);
      ctx.globalAlpha=.15; ctx.beginPath();
      for(let x=0;x<w;x+=16){ctx.moveTo(x,0);ctx.lineTo(x,h)}
      for(let y=0;y<h;y+=16){ctx.moveTo(0,y);ctx.lineTo(w,y)}
      ctx.strokeStyle='#083'; ctx.lineWidth=1; ctx.stroke(); ctx.globalAlpha=1;
      for(const d of dots){
        d.x+=d.vx; d.y+=d.vy; d.t=(d.t+1)%240;
        if(d.x<0||d.x>w)d.vx*=-1;
        if(d.y<0||d.y>h)d.vy*=-1;
        const ph=d.t/240,r=6+ph*22;
        ctx.beginPath(); ctx.arc(d.x,d.y,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,140,${0.25*(1-ph)})`;
        ctx.lineWidth=1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,2,0,Math.PI*2);
        ctx.fillStyle='#0f8'; ctx.fill();
      }
      S.requestAnimationFrame(step);
    };
    step();
  };
  startGridAnim();

  let map=null,layer=null,items=[],markers=[],current=null;

  const ensureLeaflet=async()=>{
    if(S.L) return true;
    const lc=C('link',{rel:'stylesheet',href:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',crossOrigin:''});
    const sc=C('script',{src:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',crossOrigin:''});
    D.head.append(lc);
    await new Promise(r=>{sc.onload=r; D.head.append(sc)});
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

  const highlight=idx=>{
    if(current!=null&&markers[current]) markers[current].setStyle(styleNormal);
    current=idx;
    if(markers[idx]) markers[idx].setStyle(styleActive);
  };

  const renderPanel=(it,i)=>{
    if(!it){ ttl.textContent='Наведіть на точку…'; cnt.textContent=items.length?`0 / ${items.length}`:''; metaBox.innerHTML=''; return }
    ttl.textContent=pickTitle(it);
    cnt.textContent=`${i+1} / ${items.length}`;
    const kv=C('div',{className:'kv'});
    const pairs=flatten(it).filter(([k])=>!/^id$|^title$|^name$|^position$|^header$|^role$/i.test(k));
    pairs.sort((a,b)=>(topKeys.includes(a[0])?-1:0)-(topKeys.includes(b[0])?-1:0)||a[0].localeCompare(b[0]));
    metaBox.innerHTML='';
    for(const [k,v] of pairs.slice(0,80)){
      const dk=C('div',{className:'k',textContent:k});
      const dv=C('div',{className:'v'});
      if(/^https?:\/\//.test(v)) dv.append(C('a',{href:v,target:'_blank',textContent:v,style:'color:#9cff9c;text-decoration:underline'}));
      else dv.textContent=v;
      kv.append(dk,dv);
    }
    metaBox.append(kv);
  };

  const keyCoord=(la,lo)=>`${(+la).toFixed(6)},${(+lo).toFixed(6)}`;
  const m2degLat=m=>m/111320;
  const m2degLon=(m,lat)=>m/(111320*Math.cos(lat*Math.PI/180));
  const orbitPositions=(la,lo,n)=>{
    if(n<=1)return[[la,lo]];
    const out=[],perRing=12,base=18,step=14; let left=n,ring=0;
    while(left>0){
      ring++; const on=Math.min(left,perRing); const r=base+step*(ring-1);
      for(let i=0;i<on;i++){
        const a=(2*Math.PI*i)/on+(ring%2?0:Math.PI/on);
        const dx=r*Math.cos(a),dy=r*Math.sin(a);
        out.push([la+m2degLat(dy),lo+m2degLon(dx,la)]);
      }
      left-=on;
    }
    return out.slice(0,n);
  };

  const addAllPoints=arr=>{
    markers=[]; layer.clearLayers();
    let bounds=null,count=0;
    const withCoords=arr.map((it,i)=>({it,i,la:+latOf(it),lo:+lonOf(it)})).filter(v=>Number.isFinite(v.la)&&Number.isFinite(v.lo));
    const groups=new Map();
    for(const r of withCoords){ const k=keyCoord(r.la,r.lo); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(r) }
    for(const [,grp] of groups.entries()){
      const baseLa=grp[0].la,baseLo=grp[0].lo,pos=orbitPositions(baseLa,baseLo,grp.length);
      grp.forEach((g,idx)=>{
        const [la,lo]=pos[idx];
        const m=L.circleMarker([la,lo],styleNormal);
        m.on('mouseover',()=>{renderPanel(g.it,g.i);highlight(g.i)});
        m.on('click',()=>{renderPanel(g.it,g.i);highlight(g.i)});
        layer.addLayer(m); markers[g.i]=m; count++;
        bounds=bounds?bounds.extend([la,lo]):L.latLngBounds([la,lo],[la,lo]);
      });
    }
    log('Rendered points:',count);
    if(layer.getLayers().length&&bounds?.isValid()) map.fitBounds(bounds.pad(Math.min(0.15,0.33)),{animate:false});
    else map.setView([50.4501,30.5234],12);
  };

  const startBackAnim=()=>{
    const ctx=anim.getContext('2d',{alpha:false});
    const fit=()=>{anim.width=innerWidth;anim.height=innerHeight};
    fit(); S.addEventListener('resize',fit,{passive:true});
    const N=Math.min(320,Math.floor((innerWidth*innerHeight)/8000));
    const dots=[...Array(N)].map(()=>({x:Math.random()*anim.width,y:Math.random()*anim.height,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,t:Math.random()*400|0,off:Math.random()*Math.PI*2}));
    const step=()=>{
      const {width:w,height:h}=anim;
      ctx.fillStyle='#0a0f0a'; ctx.fillRect(0,0,w,h);
      ctx.globalAlpha=.10; ctx.beginPath();
      for(let x=0;x<w;x+=24){ctx.moveTo(x,0);ctx.lineTo(x,h)}
      for(let y=0;y<h;y+=24){ctx.moveTo(0,y);ctx.lineTo(w,y)}
      ctx.strokeStyle='#0b331f'; ctx.lineWidth=1; ctx.stroke(); ctx.globalAlpha=1;
      for(const d of dots){
        d.x+=d.vx; d.y+=d.vy; d.t=(d.t+1)%420;
        if(d.x<0||d.x>w)d.vx*=-1;
        if(d.y<0||d.y>h)d.vy*=-1;
        const ph=d.t/420,r1=8+40*ph,r2=18+70*((ph+.33)%1),r3=28+100*((ph+.66)%1),al=.28*(1-ph);
        ctx.beginPath(); ctx.arc(d.x,d.y,r1,0,Math.PI*2); ctx.strokeStyle=`rgba(0,255,140,${al})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,r2,0,Math.PI*2); ctx.strokeStyle=`rgba(0,200,120,${al*.8})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,r3,0,Math.PI*2); ctx.strokeStyle=`rgba(0,150,100,${al*.6})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(d.x,d.y,2,0,Math.PI*2); ctx.fillStyle='#0f8'; ctx.fill();
      }
      S.requestAnimationFrame(step);
    };
    step();
  };
  startBackAnim();

  const getPicks=async()=>{
    const list=await fetch('./jobs/chunks-list.json',{cache:'no-store'})
      .then(r=>{if(!r.ok) throw new Error('chunks-list.json not found'); return r.json()})
      .then(j=>Array.isArray(j)?j:chooseArray(j))
      .catch(e=>{log('Error list:',e); return []});
    log('Chunk URLs:',list);
    return list;
  };

  const fetchOne=async u=>{
    let szKnown=false;
    try{
      const resp=await fetch('./'+u,{cache:'no-store'});
      if(!resp.ok) throw new Error('HTTP '+resp.status);
      const cl=+resp.headers.get('content-length')||0;
      if(cl>0){ bytesTotal+=cl; szKnown=true; setProgress() }
      const reader=resp.body?.getReader?.();
      const chunks=[]; let recvd=0;
      if(reader){
        for(;;){
          const {done,value}=await reader.read();
          if(done) break;
          recvd+=value.byteLength; bytesDone+=value.byteLength; chunks.push(value); setProgress();
        }
      }else{
        const ab=await resp.arrayBuffer();
        recvd=ab.byteLength; bytesDone+=recvd; chunks.push(new Uint8Array(ab));
        if(!szKnown){ bytesTotal+=recvd; setProgress() }
      }
      if(!szKnown&&recvd>0) setProgress();
      const full=new Blob(chunks,{type:'application/json'});
      const j=JSON.parse(await full.text());
      const arr=chooseArray(j); if(arr?.length) items.push(...arr);
      filesDone++; setProgress(); log('loaded',u,'items:',arr?.length||0,'sizeMB:',fmtMB(recvd));
    }catch(err){
      filesDone++; setProgress(); log('fail',u,err?.message||err);
    }
  };

  const load=async()=>{
    showLoader(); ttl.textContent='Завантаження вакансій…';
    t0=performance.now(); bytesTotal=0; bytesDone=0; filesDone=0;
    const picks=await getPicks(); filesTotal=picks.length; setProgress(); cnt.textContent=`0 / 0`;
    if(!picks.length){ loadTitle.textContent='Не знайшов перелік чанків'; hideLoader(); return }
    await Promise.allSettled(picks.map(fetchOne));
    log('Total items:',items.length);
    loadTitle.textContent=items.length?`Готово: ${items.length} вакансій`:'Даних не знайдено';
    const ok=await setupMap();
    if(ok&&items.length){ addAllPoints(items); renderPanel(null,-1); cnt.textContent=`0 / ${items.length}` } else ttl.textContent='Не вдалося відрендерити карту';
    S.setTimeout(hideLoader,400);
  };

  const topIntro=()=>{
    metaBox.innerHTML='';
    const kv=C('div',{className:'kv'});
    const lines=[['hint','Наведіть на точку на карті'],['loaded','Очікуємо завантаження…'],['pro','PRO відкриє фільтри, пошук, експорт']];
    for(const [k,v] of lines){ kv.append(C('div',{className:'k',textContent:k}),C('div',{className:'v',textContent:v})) }
    metaBox.append(kv);
  };

  topIntro();
  load();
})();