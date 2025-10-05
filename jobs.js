(()=>{
  const S=window,D=document;
  const picks=['/jobs.json'];
  const $=s=>D.querySelector(s), C=(t,p={})=>Object.assign(D.createElement(t),p);

  Object.assign(D.documentElement.style,{height:'100%'});
  Object.assign(D.body.style,{margin:'0',height:'100%',background:'#0a0f0a',fontFamily:'system-ui,Segoe UI,Arial',color:'#eaffea',overflow:'hidden',touchAction:'pan-y'});

  const root=C('div',{id:'jc-root'}), mapWrap=C('div',{id:'jc-map'}), panel=C('div',{id:'jc-panel','aria-live':'polite'});
  const head=C('div',{id:'jc-head'}), ttl=C('div',{id:'jc-ttl',textContent:'Наведіть на точку…'}), cnt=C('div',{id:'jc-cnt',textContent:''});
  const metaBox=C('div',{id:'jc-meta'}), pro=C('button',{id:'jc-pro',textContent:'PRO $4.99/y',type:'button'});
  head.append(ttl,cnt,pro); panel.append(head,metaBox); root.append(mapWrap,panel); D.body.append(root);

  const css=C('style'); css.textContent=`
    /* Base layout */
    #jc-root{position:fixed;inset:0}
    #jc-map{position:absolute;inset:0;z-index:0}
    #jc-map .leaflet-container{width:100%;height:100%}

    /* Glass panel: desktop = neat bottom-right, fixed height; mobile = full-width bottom sheet */
    #jc-panel{
      position:absolute; right:16px; bottom:16px; z-index:1000000;
      width:min(480px,36vw); max-width:92vw;
      height:42vh; max-height:78vh; min-height:220px;
      display:grid; grid-template-rows:auto 1fr; gap:12px; padding:14px 14px 12px;
      background:linear-gradient( to bottom right, rgba(10,20,10,.58), rgba(8,12,8,.34) );
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
    #jc-meta::-webkit-scrollbar{width:6px} #jc-meta::-webkit-scrollbar-thumb{background:#1b3;border-radius:99px}
    .kv{display:grid;grid-template-columns:140px 1fr;gap:8px 10px;align-items:start}
    .k{color:#8dfb8d;font-weight:700;white-space:nowrap}
    .v{color:#eaffea;word-break:break-word}

    /* Hover/selection marker emphasis */
    .jc-dot-normal{ }
    .jc-dot-active{ filter: drop-shadow(0 0 6px rgba(0,255,160,.6)); }

    /* Mobile/adaptive: panel at 100% width as bottom sheet */
    @media (max-width:900px){
      #jc-panel{
        left:0; right:0; bottom:0; margin:0;
        width:100%; max-width:none;
        height:52vh; max-height:86vh; border-radius:16px 16px 0 0;
        padding:16px 14px 12px;
      }
      .kv{grid-template-columns:110px 1fr}
      #jc-ttl{font-size:17px}
    }
    @media (max-width:560px){
      #jc-panel{height:58vh}
      .kv{grid-template-columns:96px 1fr}
    }
  `; D.head.append(css);

  pro.onclick=()=>alert('Бета-версія PRO оформлена. Дякуємо! Функція стане доступною найближчим часом.');

  const pickTitle=o=>(o?.title||o?.position||o?.name||o?.header||o?.role||'Без назви').toString();
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

  const renderPanel=(it,i)=>{
    if(!it){ ttl.textContent='Наведіть на точку…'; cnt.textContent=''; metaBox.innerHTML=''; return }
    ttl.textContent=pickTitle(it);
    cnt.textContent=`${i+1} / ${items.length}`;
    const kv=C('div',{className:'kv'});
    const pairs=flatten(it).filter(([k])=>!/^id$|^title$|^name$|^position$|^header$|^role$/i.test(k));
    pairs.sort((a,b)=> (topKeys.includes(a[0])?-1:0)-(topKeys.includes(b[0])?-1:0) || a[0].localeCompare(b[0]));
    metaBox.innerHTML='';
    for(const [k,v] of pairs.slice(0,80)){
      const dk=C('div',{className:'k',textContent:k});
      const dv=C('div',{className:'v'});
      if(/^https?:\/\//.test(v)){ dv.append(C('a',{href:v,target:'_blank',textContent:v,style:'color:#9cff9c;textDecoration:underline'})) }
      else dv.textContent=v;
      kv.append(dk,dv);
    }
    metaBox.append(kv);
  };

  const styleNormal={radius:4,weight:1,color:'#00ff78',fillColor:'#00aa55',fillOpacity:.75,className:'jc-dot-normal'};
  const styleActive={radius:7,weight:2,color:'#7bffb7',fillColor:'#00dd77',fillOpacity:.9,className:'jc-dot-active'};

  const highlight=(idx)=>{
    if(current!=null && markers[current]) markers[current].setStyle(styleNormal);
    current=idx;
    if(markers[idx]) markers[idx].setStyle(styleActive);
  };

  const addAllPoints=arr=>{
    let bounds=null;
    items=arr; markers=[];
    arr.forEach((it,i)=>{
      const la=+latOf(it), lo=+lonOf(it);
      if(!Number.isFinite(la)||!Number.isFinite(lo)) return;
      const m=L.circleMarker([la,lo],styleNormal);
      m.on('mouseover',()=>{renderPanel(it,i); highlight(i)});
      m.on('click',()=>{renderPanel(it,i); highlight(i)});
      layer.addLayer(m); markers.push(m);
      bounds=bounds?bounds.extend([la,lo]):L.latLngBounds([la,lo],[la,lo]);
    });
    if(layer.getLayers().length && bounds?.isValid()){
      map.fitBounds(bounds.pad(Math.min(0.15,0.33)),{animate:false});
    }else{
      map.setView([50.4501,30.5234],12);
    }
  };

  const load=async()=>{
    const ok=await setupMap(); if(!ok) return;
    for(const u of picks){
      try{
        const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw 0;
        const j=await r.json(); const arr=chooseArray(j);
        if(arr.length){ addAllPoints(arr); renderPanel(null,-1); return }
      }catch{}
    }
    ttl.textContent='Не знайшов файл з вакансіями'; cnt.textContent=''; metaBox.textContent='';
    map.setView([50.4501,30.5234],12);
  };

  load();
})();
