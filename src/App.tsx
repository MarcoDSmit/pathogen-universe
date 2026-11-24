import {useEffect,useMemo,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,ChevronRight,Compass,FlaskConical,Gauge,HelpCircle,Info,Microscope,Orbit,Pause,Play,Rocket,Satellite,Search,Settings2,ShieldAlert,X} from 'lucide-react';
import {antibioticName,Classification,Genus,groups,Organism,organisms,regimens,speciesShortName,syndromeName,Tab} from './atlas';
import './style.css';
import {getSkyPattern,getLabMotif} from './constellations';
import {AtlasArtworkMap,hasDrawnConstellations} from './AtlasArtworkMap';
import {splitFeaturedSpecies,sanfordCoverage,isMaldiClaimMatched,isManuallyFeatured,getEucastLabel,getEucastTriage} from './priorities';
import {galaxies,getSectors,getClusters,getCluster,getClusterFor,getClusterOrganisms,countGalaxy,searchOrganisms,findOrganism} from './catalog';
import sanford from './data/sanford.json';
import type {Galaxy} from './catalog';
import release from './data/release.json';

type Level='intro'|'universe'|'galaxy'|'sector'|'system';
type Speed='subtle'|'normal';
const GALAXIES=galaxies;
const STARFIELD=Array.from({length:230},(_,i)=>({x:(i*173+23)%1440,y:(i*227+37)%900,r:i%13===0?1.9:i%4===0?1.15:.65,o:.15+(i%8)*.075}));
const hint='Artistic celestial forms are decorative. Scientific classifications and clinical details are provided in text.';
const makeKey=(fn:()=>void)=>(e:KeyboardEvent<SVGGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}};

function Backdrop(){return <div className="starscape" aria-hidden="true">{STARFIELD.map((s,i)=><span key={i} style={{left:`${s.x/14.4}%`,top:`${s.y/9}%`,width:s.r,height:s.r,opacity:s.o}}/>)}</div>}
function SVGDefs(){return <defs>
  <radialGradient id="stellarSun" cx="34%" cy="27%" r="75%"><stop stopColor="#fff3ca"/><stop offset=".4" stopColor="#f8c77c"/><stop offset=".82" stopColor="#dc8756"/><stop offset="1" stopColor="#8e5162"/></radialGradient>
  <radialGradient id="bacterialPlanet" cx="28%" cy="25%" r="90%"><stop stopColor="#f2d1f2"/><stop offset=".38" stopColor="#bc8de0"/><stop offset="1" stopColor="#433d83"/></radialGradient>
  <radialGradient id="tealPlanet" cx="28%" cy="25%" r="90%"><stop stopColor="#b9f1e8"/><stop offset=".4" stopColor="#76bfbf"/><stop offset="1" stopColor="#20586e"/></radialGradient>
  <radialGradient id="coralPlanet" cx="28%" cy="25%" r="90%"><stop stopColor="#f6ddbd"/><stop offset=".4" stopColor="#ec9b86"/><stop offset="1" stopColor="#824a65"/></radialGradient>
  <radialGradient id="goldPlanet" cx="28%" cy="25%" r="90%"><stop stopColor="#fff5c2"/><stop offset=".4" stopColor="#e3ae69"/><stop offset="1" stopColor="#846356"/></radialGradient>
  <linearGradient id="nebulaStroke" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7fd1c7" stopOpacity=".02"/><stop offset=".5" stopColor="#8cb7c9" stopOpacity=".36"/><stop offset="1" stopColor="#dcb48f" stopOpacity=".08"/></linearGradient>
  <filter id="planetGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="nebulaBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>}

// Artwork is original SVG. These shapes are illustrative silhouettes, not taxonomy.
function GalaxyArt({kind}:{kind:Galaxy}){
  if(kind==='bacteria')return <g><ellipse rx="104" ry="63" fill="#57bdb6" opacity=".13" filter="url(#nebulaBlur)"/><ellipse rx="96" ry="50" fill="none" stroke="#96d7c7" strokeWidth="2" opacity=".67" transform="rotate(-24)"/><ellipse rx="75" ry="34" fill="#84c5bb" opacity=".12" transform="rotate(-24)"/>
    {Array.from({length:68},(_,i)=>{const a=i*2.399,rad=Math.sqrt((i+1)/69)*82;return <circle key={i} cx={Math.cos(a)*rad} cy={Math.sin(a)*rad*.55} r={i%8===0?2.1:1.15} fill={i%3===0?'#f2d4a4':'#9bdcd1'} transform="rotate(-24)" opacity=".9"/>})}
    <path d="M89 20 C120 -3 113 59 159 39 S192 68 175 82" fill="none" stroke="#77b9ac" strokeWidth="2" opacity=".65" strokeLinecap="round" strokeDasharray="4 8"/>
  </g>;
  if(kind==='viruses')return <g><circle r="72" fill="#69b5cf" opacity=".15" filter="url(#nebulaBlur)"/><circle r="55" fill="none" stroke="#8fcfe2" strokeWidth="2" opacity=".7"/>
    {Array.from({length:16},(_,i)=>{return <g key={i} transform={`rotate(${i*22.5})`}><path d="M0 -54V-77" stroke="#83d1e5" strokeWidth="2" opacity=".76"/><circle cx="0" cy="-78" r="4.2" fill="#91dce9" opacity=".85"/></g>})}
    {Array.from({length:44},(_,i)=>{const a=i*2.399,r=Math.sqrt((i+1)/44)*48;return <circle key={i} cx={Math.cos(a)*r} cy={Math.sin(a)*r} r={i%6===0?2.5:1.2} fill="#b3ebfa" opacity=".77"/>})}
  </g>;
  if(kind==='fungi')return <g><path d="M-84 1 Q-78 -76 0 -84 Q78 -76 84 1 Q42 24 0 18 Q-42 24 -84 1Z" fill="#b890c8" opacity=".14" stroke="#c2a4dc" strokeWidth="2"/><path d="M-21 19L-27 88 Q0 104 27 88 L21 19" fill="#a0bace" opacity=".13" stroke="#c2a4dc" strokeWidth="2"/>
    {Array.from({length:74},(_,i)=>{const x=((i*41)%165)-82,cap=((i*71)%100)<65;const y=cap ? -Math.sin(Math.acos(Math.min(Math.abs(x)/85,1)))*70+((i%7)*8):20+((i*27)%68);return <circle key={i} cx={cap?x:x*.28} cy={y} r={i%9===0?2.2:1} fill={i%3===0?'#f1c6a2':'#d8b9e7'} opacity=".8"/>})}
  </g>;
  return <g>{[-55,55].map((cx,j)=><g key={j} transform={`translate(${cx} 0)`}>{Array.from({length:95},(_,i)=>{const t=i*.19,r=i*.77;return <circle key={i} cx={Math.cos(t+j*2.2)*r} cy={Math.sin(t+j*2.2)*r*.76} r={i%8===0?2.1:1.05} fill={j===0?'#90d1a9':'#b6a3e6'} opacity={.25+.72*(i/95)}/>})}<circle r="8" fill={j===0?'#9be3bd':'#cfb8f9'}/></g>)}</g>
}
function GalaxyMap({onSelect}:{onSelect:(id:Galaxy)=>void}){
  const spots=[{x:290,y:305,scale:1.35},{x:785,y:175,scale:.80},{x:815,y:460,scale:.76},{x:480,y:485,scale:.78}];
  return <div className="map-shell"><svg className="atlas-svg" viewBox="0 0 1080 670" role="group" aria-label="Map of pathogen galaxies"><SVGDefs/>
    <ellipse cx="540" cy="335" rx="450" ry="258" className="chart-orbit" transform="rotate(-10 540 335)"/>
    <path d="M290 305 Q535 130 785 175 M290 305 Q600 345 815 460 M290 305 Q365 410 480 485" className="chart-connection"/>
    {GALAXIES.map((galaxy,i)=>{const p=spots[i];return <g key={galaxy.id} className={`galaxy-node ${galaxy.ready?'is-ready':'is-disabled'}`} transform={`translate(${p.x} ${p.y})`} role={galaxy.ready?'button':'group'} tabIndex={galaxy.ready?0:undefined} onClick={()=>galaxy.ready&&onSelect(galaxy.id)} onKeyDown={galaxy.ready?makeKey(()=>onSelect(galaxy.id)):undefined} aria-label={`${galaxy.name}: ${galaxy.ready?'Enter galaxy':'Coming later'}`}>
      <g transform={`scale(${p.scale})`}><GalaxyArt kind={galaxy.id}/></g>
      <circle r={i===0?133:96} fill="transparent"/>
      <text y={i===0?141:112} className="galaxy-name" textAnchor="middle">{galaxy.name}</text>
      <text y={i===0?162:131} className="galaxy-subtitle" textAnchor="middle">{`${countGalaxy(galaxy.id)} ENTRIES`}</text>
    </g>})}
  </svg><p className="map-bottom-note">Four galaxies · 2,241 provisional organism records · All galaxies available</p></div>
}
function SectorMap({mode,galaxy,onSelect,motion,speed}:{mode:Classification;galaxy:Galaxy;onSelect:(id:string)=>void;motion:boolean;speed:Speed}){
 const sectors=getSectors(galaxy,mode);
 const [time,setTime]=useState(0);
 useEffect(()=>{
  if(!motion){setTime(0);return;}
  let frame=0;
  const tick=(now:number)=>{setTime(now/1000);frame=window.requestAnimationFrame(tick)};
  frame=window.requestAnimationFrame(tick);
  return ()=>window.cancelAnimationFrame(frame);
 },[motion]);
 const center={x:540,y:295};
 const speedMultiplier=speed==='normal'?1:.45;
 const bacteriaClinicalPositions:Record<string,{x:number;y:number;orbit:{rx:number;ry:number;tilt:number;base:number;period:number}}>= {
  'gp-cocci':{x:190,y:155,orbit:{rx:356,ry:176,tilt:-0.22,base:-2.5,period:1550}},
  'gp-rods':{x:555,y:108,orbit:{rx:220,ry:138,tilt:0.08,base:-1.55,period:1320}},
  'gn-enteric':{x:865,y:170,orbit:{rx:360,ry:172,tilt:0.22,base:-0.38,period:1600}},
  'gn-other':{x:845,y:430,orbit:{rx:338,ry:178,tilt:0.1,base:0.7,period:1480}},
  'anaerobes':{x:520,y:485,orbit:{rx:250,ry:132,tilt:-0.18,base:1.65,period:1360}},
  'curved-intracellular':{x:165,y:410,orbit:{rx:360,ry:188,tilt:-0.05,base:2.65,period:1620}},
 };
 const genericLayouts=[
  {rx:380,ry:170,base:-2.35,period:1440,tilt:-0.16},
  {rx:235,ry:120,base:-1.25,period:1220,tilt:0.14},
  {rx:385,ry:165,base:-0.25,period:1500,tilt:0.18},
  {rx:340,ry:175,base:0.95,period:1420,tilt:0.06},
  {rx:240,ry:128,base:1.95,period:1240,tilt:-0.12},
  {rx:395,ry:180,base:2.8,period:1540,tilt:0.04}
 ] as const;
 return <div className="map-shell"><svg className="atlas-svg" viewBox="0 0 1080 600" role="group" aria-label={`${mode} map of ${galaxy} sectors`}><SVGDefs/>
    <ellipse cx="550" cy="285" rx="460" ry="245" className="chart-orbit" transform="rotate(-14 550 285)"/>
    <ellipse cx="550" cy="285" rx="340" ry="184" className="chart-orbit faint" transform="rotate(22 550 285)"/>
    <circle cx={center.x} cy={center.y} r="62" fill="#5da3a9" opacity=".13" filter="url(#nebulaBlur)"/>
    <text x={center.x} y={center.y-1} className="map-center-label" textAnchor="middle">{galaxy.toUpperCase()}</text><text x={center.x} y={center.y+18} className="map-center-subtitle" textAnchor="middle">{mode==='clinical'?'CLINICAL MAP':'TAXONOMY MAP'}</text>
    {sectors.map((s,i)=>{
      const keyed=(galaxy==='bacteria'&&mode==='clinical'&&bacteriaClinicalPositions[s.id])?bacteriaClinicalPositions[s.id]:undefined;
      const orbit=keyed?.orbit||genericLayouts[i%genericLayouts.length];
      const angularVelocity=(2*Math.PI/orbit.period)*speedMultiplier;
      const angle=orbit.base+(motion?time*angularVelocity:0);
      const rawX=Math.cos(angle)*orbit.rx;
      const rawY=Math.sin(angle)*orbit.ry;
      const x=keyed?(keyed.x+(motion?Math.cos(time*(speed==='normal'?0.13:0.06)+i)*9:0)):(center.x+rawX*Math.cos(orbit.tilt)-rawY*Math.sin(orbit.tilt));
      const y=keyed?(keyed.y+(motion?Math.sin(time*(speed==='normal'?0.13:0.06)+i)*7:0)):(center.y+rawX*Math.sin(orbit.tilt)+rawY*Math.cos(orbit.tilt));
      const visibleCount=galaxy!=='bacteria'?s.count:getClusters(galaxy,mode,s.id).filter(c=>splitFeaturedSpecies(getClusterOrganisms(c.id)).featured.length>0).length;
      return <g key={s.id} className="sector-node" role="button" tabIndex={0} aria-label={`Explore ${s.name}`} onClick={()=>onSelect(s.id)} onKeyDown={makeKey(()=>onSelect(s.id))}>
        <ellipse cx={center.x} cy={center.y} rx={orbit.rx} ry={orbit.ry} className="chart-orbit faint sector-orbit" transform={`rotate(${orbit.tilt*180/Math.PI} ${center.x} ${center.y})`}/>
        <circle cx={x} cy={y} r="51" fill={s.color} opacity=".07" filter="url(#planetGlow)"/>
        <circle cx={x} cy={y} r="32" fill="none" stroke={s.color} strokeWidth="1.2" opacity=".7"/>
        {Array.from({length:8},(_,j)=>{const a=j*Math.PI/4;return <circle key={j} cx={x+Math.cos(a)*22} cy={y+Math.sin(a)*22} r={j%3===0?3.2:1.8} fill={s.color}/>})}
        <circle cx={x} cy={y} r="60" fill="transparent"/>
        <text x={x} y={y+68} className="sector-name" textAnchor="middle">{s.name}</text>
        <text x={x} y={y+86} className="sector-subtitle" textAnchor="middle">{visibleCount} featured · {s.count} total</text>
      </g>
    })}
  </svg><p className="map-bottom-note">Select a sector orbit to reveal the constellation map on a single page · {motion?'Sector motion follows your orbital setting':'Sector motion is paused'}{mode==='taxonomic'?' · Taxonomic assignments are provisional navigation metadata':''}</p></div>
}

function LabArtwork({sectorId,height}:{sectorId:string;height:number}){
 const motif=getLabMotif(sectorId);
 return <g className="lab-silhouette" transform={`translate(540 ${Math.min(height*.48,340)})`} aria-hidden="true">
  {motif==='microscope'&&<>
   <path d="M-115 -90 l75 -75 35 35 -55 55 35 37 q-45 45 -80 35 l-40 -25"/>
   <path d="M-55 -165 l30 -29 65 67 -30 30 M-170 60 q12 -110 90 -70 M-130 80 H110 q55 0 55 35 H-170 Z M-45 80 V38 q95 18 120 -85"/>
   <circle cx="75" cy="-60" r="31"/>
  </>}
  {motif==='maldi'&&<>
   <path d="M-185 -75 h370 l40 140 h-450 Z M-145 -122 h290 l40 47 h-370 Z M-100 -40 h160 v48 h-160 Z"/>
   <path d="M-95 -145 v-22 h190 v22 M120 -36 h55 M120 -16 h55 M-175 96 h350"/>
   {Array.from({length:15},(_,i)=><circle key={i} cx={-75+(i%5)*30} cy={-28+Math.floor(i/5)*14} r="4"/>)}
   <circle cx="155" cy="33" r="9"/>
  </>}
  {motif==='pcr'&&<>
   <path d="M-180 65 h360 l28 40 h-416 Z M-170 15 l65 -155 h250 l65 155 Z M-100 -110 h200 l-20 85 h-160 Z"/>
   <path d="M-120 40 h240 M-90 58 h180 M-155 80 h55 M-70 80 h55 M35 80 h55"/>
  </>}
  {motif==='petri'&&<>
   <ellipse cx="0" cy="0" rx="205" ry="140"/><ellipse cx="0" cy="10" rx="180" ry="115"/>
   {[[0,0],[65,-55],[-75,45],[105,35],[-95,-65],[25,80]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={12+i%3*7}/>)}
  </>}
  {motif==='pipette'&&<>
   <path d="M-130 -125 l55 -55 85 85 -55 55 Z M-40 -95 l170 170 M-15 -115 l170 170 M115 55 l30 30 -27 48 -43 -39 M-125 -150 l20 -20"/>
   <path d="M120 135 q-25 45 5 65 q30 -20 -5 -65"/>
  </>}
  {motif==='helix'&&<>
   <path d="M-170 -160 C60 -80 -60 80 170 160 M170 -160 C-60 -80 60 80 -170 160"/>
   {Array.from({length:7},(_,i)=>{const y=-135+i*45;const x=Math.sin((i/6)*Math.PI*2)*70;return <path key={i} d={`M${x-75} ${y} L${75-x} ${y}`} />})}
  </>}
  {motif==='other'&&<><path d="M0 -180 L155 -90 L155 90 L0 180 L-155 90 L-155 -90 Z"/><path d="M0 -180 V180 M-155 -90 L155 90 M155 -90 L-155 90"/></>}
 </g>
}
function GeneratedGenusMap({genera,onSelect,mode,sectorId,dimmedIds}:{genera:Genus[];onSelect:(id:string)=>void;mode:Classification;sectorId:string;dimmedIds:ReadonlySet<string>}){
 const pattern=getSkyPattern(genera.length,sectorId);
 if(genera.length===0)return <div className="empty-sector-map"><div className="empty-star"/><h2>No featured genus stars in this sector</h2><p>Its organisms are retained in the reserve genus index below, and individual species remain available through global search.</p></div>;
 const dense=genera.length>8;
 const cols=dense?(genera.length>50?7:genera.length>25?6:4):1;
 const rows=dense?Math.ceil(genera.length/cols):1;
 const mapHeight=dense?Math.max(690,rows*125+150):620;
 const points=genera.map((g,i)=>({g,x:dense?105+(i%cols)*(870/Math.max(1,cols-1)):pattern.points[i][0],y:dense?110+Math.floor(i/cols)*125:pattern.points[i][1]}));
 const selectedEdges=dense?Array.from({length:genera.length-1},(_,i)=>[i,i+1] as const).filter(([a,b])=>Math.floor(a/cols)===Math.floor(b/cols)) : pattern.edges;
 return <div className={`map-shell constellation-map mode-${mode} ${dense?'dense-map':''}`}>
  <svg className="atlas-svg constellation-svg" viewBox={`0 0 1080 ${mapHeight}`} role="group" aria-label={`${pattern.name}, ${genera.length} genus stars on one continuous map`}><SVGDefs/>
    <ellipse cx="545" cy={Math.min(mapHeight*.48,340)} rx="420" ry="190" fill="#6cacc1" opacity=".04" filter="url(#nebulaBlur)"/>
    <LabArtwork sectorId={sectorId} height={mapHeight}/>
    <g className="constellation-lines" aria-hidden="true">{selectedEdges.map(([a,b],i)=><path key={i} d={`M${points[a].x} ${points[a].y} L${points[b].x} ${points[b].y}`}/>)}</g>
    {points.map(({g,x,y})=><g className={`genus-node ${dimmedIds.has(g.id)?'is-background':''}`} key={g.id} role="button" tabIndex={0} aria-label={`Explore ${g.name}`} onClick={()=>onSelect(g.id)} onKeyDown={makeKey(()=>onSelect(g.id))}>
      <title>{g.name}</title>
      <circle cx={x} cy={y} r={dense?24:50} fill="#f2bf78" opacity=".09" filter="url(#planetGlow)"/>
      <circle cx={x} cy={y} r={dense?11:19} fill="url(#stellarSun)"/>
      <circle cx={x} cy={y} r={dense?18:29} fill="none" className="stellar-ring" stroke="#f4c982" strokeDasharray="2 8" opacity=".55"/>
      <circle cx={x} cy={y} r={dense?27:47} fill="transparent"/>
      <text x={x} y={y+(dense?39:53)} className={`star-name ${dense?'star-name-dense':''}`} textAnchor="middle">{dense&&g.name.length>17?g.name.slice(0,16)+'…':g.name}</text>
      {!dense&&<text x={x} y={y+71} className="sector-subtitle" textAnchor="middle">EXPLORE SYSTEM</text>}
    </g>)}
  </svg>
  <div className="constellation-identity" aria-live="polite"><span>IMAGINED LABORATORY CONSTELLATION</span><strong>{pattern.name}</strong><small>{pattern.note}</small></div>
  <p className="map-bottom-note">{genera.length} visible constellations on one map · Laboratory artwork is imaginative, not astronomical or taxonomic</p>
 </div>
}

function GenusMap({genera,onSelect,mode,sectorId,dimmedIds}:{genera:Genus[];onSelect:(id:string)=>void;mode:Classification;sectorId:string;dimmedIds:ReadonlySet<string>}){
  if(mode==='clinical'&&hasDrawnConstellations(sectorId))return <AtlasArtworkMap genera={genera} sectorId={sectorId} onSelect={onSelect} dimmedIds={dimmedIds}/>;
  return <GeneratedGenusMap genera={genera} onSelect={onSelect} mode={mode} sectorId={sectorId} dimmedIds={dimmedIds}/>;
}

function useOrbitalClock(running:boolean){
 const [elapsed,setElapsed]=useState(0);
 const elapsedRef=useRef(0);
 useEffect(()=>{
  if(!running)return;
  let raf=0,last=0,lastRender=0;
  const tick=(now:number)=>{
   if(last)elapsedRef.current+=Math.min(now-last,250);
   last=now;
   if(now-lastRender>=33){setElapsed(elapsedRef.current);lastRender=now}
   raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(raf);
 },[running]);
 return elapsed;
}
function SystemMap({species,systemName,selected,extraCount,rareSelected,onSelect,onOpenExtra,onCategory,motion,speed}:{species:Organism[];systemName:string;selected:Organism|null;extraCount:number;rareSelected:Organism|null;onSelect:(id:string)=>void;onOpenExtra:()=>void;onCategory:(tab:Tab)=>void;motion:boolean;speed:Speed}){
 const [hovered,setHovered]=useState<string|null>(null);
 const elapsed=useOrbitalClock(motion&&!selected&&!hovered);
 const planets=useMemo(()=>species.map((org,i)=>{
   const ring=i<4?0:i<10?1:2;
   const ordinal=ring===0?i:ring===1?i-4:i-10;
   const capacity=ring===0?Math.min(species.length,4):ring===1?Math.min(Math.max(species.length-4,0),6):Math.max(species.length-10,0);
   return {s:org,r:[125,204,275][ring],period:680+ring*230,angle:((ordinal+.2*ring)*2*Math.PI)/Math.max(1,capacity)-Math.PI/2,size:ring===0?15:ring===1?12:10.5,paint:['bacterialPlanet','tealPlanet','coralPlanet','goldPlanet'][i%4]};
 }),[species]);
 const loc=(p:typeof planets[number])=>{const a=p.angle+(elapsed/(p.period*(speed==='normal'?.65:1)*1000))*2*Math.PI;return {x:480+Math.cos(a)*p.r,y:360+Math.sin(a)*p.r*.82}};
 const chosen=planets.find(p=>p.s.id===selected?.id);
 const rareCoords={x:850,y:245};
 const coords=rareSelected?rareCoords:chosen?loc(chosen):null;
 const categories:{id:Tab;label:string;angle:number;color:string}[]=[{id:'clinical',label:'Syndromes',angle:-2.35,color:'#e6a57c'},{id:'treatment',label:'Treatment',angle:-.78,color:'#eebc70'},{id:'diagnostics',label:'Diagnostics',angle:.78,color:'#88d7ce'},{id:'virulence',label:'Virulence',angle:2.35,color:'#c6aaed'}];
 return <div className="system-scroll"><svg className="system-svg" viewBox="0 0 1030 765" role="group" aria-label={`${systemName}: ${species.length} featured species and ${extraCount} more in an eccentric outer orbit`}><SVGDefs/>
    {Array.from(new Set(planets.map(p=>p.r))).map(r=><ellipse key={`orb-${r}`} cx="480" cy="360" rx={r} ry={r*.82} className="chart-orbit system-orbit"/>)}
    {extraCount>0&&<ellipse cx="480" cy="360" rx="485" ry="260" className="chart-orbit pluto-orbit" transform="rotate(-24 480 360)"/>}
    <circle cx="480" cy="360" r="84" fill="#edb16e" opacity=".10" filter="url(#planetGlow)"/>
    <circle cx="480" cy="360" r="38" fill="url(#stellarSun)"/><circle cx="469" cy="348" r="10" fill="#fff1bc" opacity=".21"/>
    <text x="480" y="423" className="star-label" textAnchor="middle">{systemName}</text>
    {planets.map(p=>{const {x,y}=loc(p),active=selected?.id===p.s.id;return <g key={p.s.id} className={`species-node ${active?'is-selected':''}`} role="button" tabIndex={0} aria-label={`Open ${p.s.scientificName}`} onMouseEnter={()=>setHovered(p.s.id)} onMouseLeave={()=>setHovered(null)} onClick={()=>onSelect(p.s.id)} onKeyDown={makeKey(()=>onSelect(p.s.id))}>
      <title>{p.s.scientificName}</title>
      {active&&<circle cx={x} cy={y} r={p.size+9} fill="none" stroke="#f2d4a0" strokeWidth="1.2" strokeDasharray="3 4"/>}
      <circle cx={x} cy={y} r="29" fill="transparent"/><circle cx={x} cy={y} r={p.size} fill={`url(#${p.paint})`} stroke={active?'#ffffff':'#b7bed4'} strokeWidth={active?2:0.7}/>
      <ellipse cx={x-3} cy={y-4} rx="3" ry="2" fill="#ffffff" opacity=".16"/>
      <text x={x} y={y+p.size+17} className="species-label" textAnchor="middle">{speciesShortName(p.s.scientificName)}</text>
    </g>})}
    {extraCount>0&&<g className="pluto-node" role="button" tabIndex={0} aria-label={`Open ${extraCount} additional species in the outer orbit`} onClick={onOpenExtra} onKeyDown={makeKey(onOpenExtra)}>
      <title>{extraCount} additional species retained in the complete catalog</title>
      <circle cx={rareCoords.x} cy={rareCoords.y} r="42" fill="#7a88b2" opacity=".12" filter="url(#planetGlow)"/>
      <circle cx={rareCoords.x} cy={rareCoords.y} r="25" fill="transparent" stroke="#a9a1d8" strokeDasharray="2 5"/>
      <circle cx={rareCoords.x} cy={rareCoords.y} r="13" fill="url(#bacterialPlanet)" stroke="#d9c7ef" strokeWidth="1"/>
      <circle cx={rareCoords.x} cy={rareCoords.y} r="39" fill="transparent"/>
      <text x={rareCoords.x} y={rareCoords.y+51} className="pluto-title" textAnchor="middle">THE OUTER ORBIT</text>
      <text x={rareCoords.x} y={rareCoords.y+67} className="pluto-subtitle" textAnchor="middle">+{extraCount} additional worlds</text>
    </g>}
    {rareSelected&&<g className="species-node is-selected" role="button" tabIndex={0} aria-label={`Selected outer-orbit species ${rareSelected.scientificName}`} onClick={onOpenExtra} onKeyDown={makeKey(onOpenExtra)}>
      <circle cx="915" cy="177" r="12" fill="url(#coralPlanet)" stroke="#ffffff" strokeWidth="1.5"/>
      <text x="915" y="165" className="species-label" textAnchor="middle">{speciesShortName(rareSelected.scientificName)}</text>
    </g>}
    {coords&&categories.map(c=>{const anchorX=rareSelected?915:coords.x,anchorY=rareSelected?177:coords.y;const x=anchorX+Math.cos(c.angle)*58,y=anchorY+Math.sin(c.angle)*58;return <g key={c.id} className="object-node" role="button" tabIndex={0} aria-label={`Open ${c.label} for ${selected?.scientificName}`} onClick={()=>onCategory(c.id)} onKeyDown={makeKey(()=>onCategory(c.id))}>
      <g className={`reference-floater ${!motion?'reference-still':''}`} style={{animationDelay:`${categories.indexOf(c)*-2.4}s`}}><circle cx={x} cy={y} r="19" fill="#1d3744" stroke={c.color} strokeWidth="1.4"/>
        {c.id==='treatment'?<Rocket x={x-10} y={y-10} width={20} height={20} color={c.color}/>:c.id==='virulence'?<Satellite x={x-10} y={y-10} width={20} height={20} color={c.color}/>:c.id==='diagnostics'?<Microscope x={x-10} y={y-10} width={20} height={20} color={c.color}/>:<BookOpen x={x-10} y={y-10} width={20} height={20} color={c.color}/>}
        <circle cx={x} cy={y} r="25" fill="transparent"/><text x={x} y={y+(Math.sin(c.angle)>0?35:-30)} textAnchor="middle" className="object-label">{c.label}</text>
      </g>
    </g>})}
  </svg></div>
}
function OuterOrbitTable({entries,mode,onChoose,onClose}:{entries:Organism[];mode:Classification;onChoose:(id:string)=>void;onClose:()=>void}){
 const [filter,setFilter]=useState('');
 const filtered=useMemo(()=>entries.filter(o=>[o.scientificName,o.taxonomyName,...(o.aliases||[])].some(name=>name?.toLowerCase().includes(filter.trim().toLowerCase()))),[entries,filter]);
 return <section className="outer-orbit-table" aria-label="Reserve species index">
  <header><div><small>THE OUTER ORBIT · RESERVE SPECIES INDEX</small><h2>{entries.length} species not featured</h2><p>Retained for search and reference. These organisms have not been prioritised for the main map; this does not establish that they are rare or clinically insignificant. Select a name to open its reference panel.</p></div><button className="icon-button" onClick={onClose} aria-label="Close outer orbit"><X size={17}/></button></header>
  <div className="outer-orbit-search"><Search size={17}/><input autoFocus aria-label="Search extended species archive" placeholder="Search archived species or historical names…" value={filter} onChange={e=>setFilter(e.target.value)}/><span>{filtered.length} matches</span></div>
  <div className="outer-orbit-table-scroll"><table><thead><tr><th>Species / clinical name</th><th>Taxonomy</th><th>Reference</th><th>Open</th></tr></thead><tbody>
   {filtered.map(o=><tr key={o.id}><td><strong>{o.scientificName}</strong></td><td>{mode==='taxonomic'?(o.ictvSpecies||o.taxonomyName||'Unresolved'):(o.taxonomyName||'Unresolved')}</td><td>{o.galaxy==='bacteria'?getEucastLabel(o):isMaldiClaimMatched(o)?'Public VITEK MS claim':isManuallyFeatured(o)?'Clinical curation':'Other reference'}</td><td><button className="table-open" onClick={()=>onChoose(o.id)} aria-label={`Open ${o.scientificName}`}><ChevronRight size={17}/></button></td></tr>)}
   {!filtered.length&&<tr><td colSpan={4}>No matches in this genus. Global search can find species in other constellations.</td></tr>}
  </tbody></table></div>
  <p className="outer-notice">Archive placement reflects provisional editorial priorities, not demonstrated organism prevalence, pathogenicity, or MALDI identifiability.</p>
 </section>
}


function SectorArchive({genera,onOpen}:{genera:Genus[];onOpen:(id:string)=>void}){
 const [filter,setFilter]=useState('');
 const needle=filter.trim().toLowerCase();
 const rows=useMemo(()=>genera.map(g=>({genus:g,entries:getClusterOrganisms(g.id)})).filter(({genus,entries})=>
  !needle||genus.name.toLowerCase().includes(needle)||entries.some(o=>[o.scientificName,o.taxonomyName,...(o.aliases||[])].some(v=>v?.toLowerCase().includes(needle)))),[genera,needle]);
 return <section className="outer-orbit-table sector-archive" aria-label="Reserve genus index">
  <header><div><small>CURATED MAP · RESERVE GENUS INDEX</small><h2>{genera.length} genera outside the featured map</h2><p>These genera remain in the complete catalog but have no species on the Sanford roster. This does not establish rarity or lack of pathogenic potential. Open a genus to browse its species table.</p></div></header>
  <div className="outer-orbit-search"><Search size={17}/><input aria-label="Search archived genera and species" placeholder="Find a genus or species…" value={filter} onChange={e=>setFilter(e.target.value)}/><span>{rows.length} genera</span></div>
  <div className="outer-orbit-table-scroll"><table><thead><tr><th>Genus / clinical constellation</th><th>Retained entries</th><th>Explore</th></tr></thead><tbody>
   {rows.map(({genus,entries})=><tr key={genus.id}><td><strong>{genus.name}</strong></td><td>{entries.length}</td><td><button className="table-open" onClick={()=>onOpen(genus.id)} aria-label={`Explore archived genus ${genus.name}`}><ChevronRight size={17}/></button></td></tr>)}
   {rows.length===0&&<tr><td colSpan={3}>No archived genera match this search. Try global search for a specific organism.</td></tr>}
  </tbody></table></div>
  <p className="outer-notice">All entries remain in the data, available through this archive and global search.</p>
 </section>
}

function ReviewedEvidence({organism,field}:{organism:Organism;field:'syndromes'|'virulence'}){
 const claims=(organism.reviewedClinicalClaims||[]).filter(c=>c.field===field&&c.review_status==='approved_by_user_clinician');
 if(!claims.length)return null;
 return <div className="curated-evidence" aria-label="Clinician-reviewed clinical evidence"><h3>Clinician-reviewed evidence</h3><p className="curated-intro">Each statement has a recorded human approval. Its evidence level and caveats apply to that statement, not to the organism's entire clinical profile.</p>
 {claims.map(c=><article className="curated-claim" key={c.review_id}><div className="curated-claim-meta"><strong>{c.app_display.group==='rare_case_report'?'Rare case report':c.app_display.group==='studied_virulence'?'Study-specific virulence evidence':c.app_display.group==='clinical_series'?'Clinical series':'Clinical association'}</strong><span>{c.evidence_level}</span></div><p>{c.statement}</p><small>Human-approved: {c.approved_date}</small><p className="curated-limit"><strong>Limitations:</strong> {c.limitations}</p><a href={c.source_url} target="_blank" rel="noreferrer">Read original source ({c.review_id})</a>{c.doi&&<small>DOI: {c.doi}</small>}</article>)}
 </div>;
}

function SanfordReference({organism}:{organism:Organism}){
 const coverage=sanfordCoverage[organism.id];
 if(!coverage)return null;
 const entries=sanford.entries.filter(entry=>coverage.clinicalNotes.includes(entry.id));
 const listings=sanford.entries.filter(entry=>coverage.listedIn.includes(entry.id));
 return <div className="curated-evidence">
   <h3>Sanford Guide clinical reference</h3>
   {listings.map(entry=><p key={entry.id}><a href={`${import.meta.env.BASE_URL}technical/sanford/#${entry.id}`}>{entry.topic}</a> · named in shared coverage</p>)}
   {entries.map(entry=><article className="curated-claim" key={entry.id}>
     <div className="curated-claim-meta"><strong>{entry.topic}</strong><span>{entry.scope}</span></div>
     <p>{entry.summary}</p>
     <a href={`${import.meta.env.BASE_URL}technical/sanford/#${entry.id}`}>Source details · accessed {entry.source?.accessedOn??sanford.source.accessedOn}</a>
   </article>)}
 </div>;
}

function Details({organism,mode,tab,onTab,onClose}:{organism:Organism;mode:Classification;tab:Tab;onTab:(t:Tab)=>void;onClose:()=>void}){
 const hasSanford=Boolean(sanfordCoverage[organism.id]);
 const [syndrome,setSyndrome]=useState('all');
 useEffect(()=>setSyndrome('all'),[organism.id]);
 const groupSet=groups.filter(g=>g.memberOrganismIds.includes(organism.id));
 const related=regimens.filter(r=>r.organismId===organism.id||groupSet.some(g=>r.groupId===g.id||r.organismGroupId===g.id));
 const syndromeIds=[...new Set(related.map(r=>r.syndromeId).filter((v):v is string=>!!v))];
 const filtered=related.filter(r=>syndrome==='all'||r.syndromeId===syndrome);
 const tabs:{id:Tab;name:string;Icon:typeof BookOpen}[]=[{id:'clinical',name:'Syndromes',Icon:BookOpen},{id:'treatment',name:'Treatment',Icon:Rocket},{id:'diagnostics',name:'Diagnostics',Icon:Microscope},{id:'virulence',name:'Virulence',Icon:Satellite}];
 const displayName=mode==='taxonomic'?(organism.ictvSpecies||organism.taxonomyName||organism.scientificName):organism.scientificName;
 const uniqueAliases=(organism.aliases||[]).filter(a=>a.toLowerCase()!==displayName.toLowerCase()).slice(0,8);
 return <aside className="details" aria-label={`${displayName} reference panel`}><div className="panel-header"><div><small>ORGANISM PLANET · {(organism.galaxy||'bacteria').toUpperCase()}</small><h2><i>{displayName}</i></h2><p>{uniqueAliases.join(' · ')||'Aliases not recorded'}</p></div><button className="icon-button" onClick={onClose} aria-label="Close panel"><X size={19}/></button></div>
 <div className="identity-card"><strong>{mode==='clinical'?'Current taxonomy':'Clinical display name'}</strong><span>{mode==='clinical'?(organism.ictvSpecies||organism.taxonomyName||'Not resolved'):organism.scientificName}</span><small>{organism.needsTaxonomyReview?'Taxonomy verification pending': 'Name-level check recorded'} · {organism.taxonomyStatus?.replaceAll('_',' ')||'Unverified'}</small>{organism.nomenclatureNote&&<small>{organism.nomenclatureNote}</small>}{organism.taxonomyAuthorityUrl&&<a href={organism.taxonomyAuthorityUrl} target="_blank" rel="noreferrer">Nomenclature source</a>}{organism.galaxy==='bacteria'&&<><small>EUCAST v16.1 scope: {getEucastLabel(organism)}{getEucastTriage(organism)?.eucast_sheet?` · ${getEucastTriage(organism)?.eucast_sheet}`:''}</small><small>Clinical focus triage: {getEucastTriage(organism)?.proposed_tier||'Not assessed'} · display selection only; do not infer susceptibility or treatment</small></>}{(organism.galaxy==='bacteria'||organism.galaxy==='fungi')&&<small>Public VITEK MS claim subset: {isMaldiClaimMatched(organism)?'listed (name may be historical)':'no entry in our selected subset; not a negative identification result'}</small>}</div>
 <nav className="object-tabs" aria-label="Organism information categories">{tabs.map(({id,name,Icon})=><button key={id} className={tab===id?'selected':''} onClick={()=>onTab(id)}><Icon size={19}/><span>{name}</span></button>)}</nav>
 {tab==='clinical'&&<section><h3>Clinical associations</h3>{organism.clinicalSyndromeIds?.length?<ul>{organism.clinicalSyndromeIds.map(id=><li key={id}>{syndromeName(id)}</li>)}</ul>:null}{organism.clinicalSyndromes?.length?<ul>{organism.clinicalSyndromes.map((value,i)=><li key={i}>{value}</li>)}</ul>:null}{!hasSanford&&!organism.clinicalSyndromeIds?.length&&!organism.clinicalSyndromes?.length&&<p className="muted">No supported species-specific association imported. This does not mean the organism is non-pathogenic.</p>}{organism.clinicalRole?.length?<><h3>Clinical role</h3><p>{organism.clinicalRole.join('; ')}</p></>:null}{organism.habitat?.length?<><h3>Habitat / ecology</h3><p>{organism.habitat.join('; ')}</p></>:null}{groupSet.map(g=><div className="info-card" key={g.id}><strong>{g.name}</strong><p className="muted">Group associations: {g.clinicalSyndromeIds?.map(syndromeName).join(', ')||'Not entered'}</p></div>)}{organism.postInfectiousComplications?.length?<><h3>Post-infectious complications</h3><ul>{organism.postInfectiousComplications.map(v=><li key={v}>{v}</li>)}</ul></>:null}<ReviewedEvidence organism={organism} field="syndromes"/><SanfordReference organism={organism}/></section>}
 {tab==='treatment'&&<section><div className="review-note"><ShieldAlert size={18}/><span>Clinical draft only. Treatment information has not been audited for this database. This is not prescribing guidance.</span></div><h3>Regimens by syndrome</h3>{related.length?<><select aria-label="Filter treatments by syndrome" value={syndrome} onChange={e=>setSyndrome(e.target.value)}><option value="all">All syndromes</option>{syndromeIds.map(id=><option key={id} value={id}>{syndromeName(id)}</option>)}</select>{filtered.map(r=><article className="regimen" key={r.id}><div className="regimen-heading"><strong>{r.syndromeId?syndromeName(r.syndromeId):'General / group recommendation'}</strong><span>{r.sourceCategory||'Regimen'}</span></div><p>{(r.antibioticIds||[]).map(antibioticName).join(' + ')||'Treatment entry'}</p><small>{[r.population,r.doseTextFromSource||r.dose,r.route,r.duration].filter(Boolean).join(' · ')}</small>{r.condition&&<small>Condition: {r.condition}</small>}{r.notes&&<small>{r.notes}</small>}</article>)}</>:<p className="muted">No antimicrobial regimen added for this entry. Sanford review pending.</p>}<p className="muted">No antimicrobial efficacy rankings have been inferred from taxonomy or textbook descriptions.</p></section>}
 {tab==='diagnostics'&&<section><h3>Organism characteristics</h3><dl><dt>Source domain</dt><dd>{organism.sourceDomain||'Not recorded'}</dd><dt>Gram stain</dt><dd>{organism.gramStain||'Not recorded'}</dd><dt>Morphology</dt><dd>{organism.morphology||'Not recorded'}</dd><dt>Haemolysis</dt><dd>{organism.hemolysis||'Not recorded'}</dd><dt>Taxonomy genus</dt><dd>{organism.taxonomyGenus||'Not resolved'}</dd><dt>Formal ICTV species</dt><dd>{organism.ictvSpecies||'Not resolved / not applicable'}</dd></dl><h3>Diagnostic clues</h3>{organism.diagnosticClues?.length?<ul>{organism.diagnosticClues.map(v=><li key={v}>{v}</li>)}</ul>:<p className="muted">No validated diagnostic clues recorded.</p>}<h3>Textbook source references</h3>{organism.sourceReferences?.length?<ul>{organism.sourceReferences.map((r,i)=><li key={i}>Chapter {r.chapter??'?'} · printed page {r.printedPage??'?'} <small>({r.scope||'source occurrence'})</small></li>)}</ul>:<p className="muted">Legacy entry / source link unavailable.</p>}</section>}
 {tab==='virulence'&&<section><h3>Virulence factors</h3>{organism.virulenceFactors?.length?<ul>{organism.virulenceFactors.map((v,i)=><li key={i}>{v}</li>)}</ul>:<p className="muted">No virulence factors imported. This is not evidence of absence.</p>}<p className="muted">Other information may be genus-level or extracted provisionally from the 2015 textbook.</p><ReviewedEvidence organism={organism} field="virulence"/></section>}
 <div className="panel-footer">Data: v0.5.2 taxonomy + v0.5.4 approved clinical batch + v0.2.2 legacy · {organism.status?.replaceAll('_',' ')||'draft'} · Taxonomy and clinical review incomplete.</div>
 </aside>
}
function getReducedMotion(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}}
function getSavedMotion(){try{const v=localStorage.getItem('pu-motion');return v===null?!getReducedMotion():v==='on'}catch{return !getReducedMotion()}}
function getSavedSpeed():Speed{try{return localStorage.getItem('pu-speed')==='normal'?'normal':'subtle'}catch{return 'subtle'}}

function App(){
 const [linkedEntry]=useState(()=>{
   const params=new URLSearchParams(window.location.search);
   const organism=findOrganism(params.get('organism'));
   const cluster=organism&&getClusterFor(organism,'clinical');
   return {organism:cluster?organism:null,cluster,query:params.get('search')?.trim().slice(0,150)||''};
 });
 const [level,setLevel]=useState<Level>(linkedEntry.organism?'system':linkedEntry.query?'universe':'intro');
 const [mode,setMode]=useState<Classification>('clinical');
 const [galaxy,setGalaxy]=useState<Galaxy>((linkedEntry.organism?.galaxy as Galaxy|undefined)||'bacteria');
 const [sectorId,setSectorId]=useState(linkedEntry.cluster?.clinicalSector||'gp-cocci');
 const [clusterId,setClusterId]=useState(linkedEntry.cluster?.id||'bacteria--clinical--gp-cocci--streptococcus');
 const [selected,setSelected]=useState<Organism|null>(linkedEntry.organism??null);
 const [tab,setTab]=useState<Tab>('clinical');
 const [query,setQuery]=useState(linkedEntry.organism?'':linkedEntry.query);
 const [outerOpen,setOuterOpen]=useState(false);
 const [showHelp,setShowHelp]=useState(false);
 const [showSettings,setShowSettings]=useState(false);
 const [sectorArchiveOpen,setSectorArchiveOpen]=useState(false);
 const [motion,setMotion]=useState(getSavedMotion);
 const [speed,setSpeed]=useState<Speed>(getSavedSpeed);
 useEffect(()=>{try{localStorage.setItem('pu-motion',motion?'on':'off')}catch{/* Optional storage */}},[motion]);
 useEffect(()=>{try{localStorage.setItem('pu-speed',speed)}catch{/* Optional storage */}},[speed]);
 const sectors=getSectors(galaxy,mode);
 const currentSector=sectors.find(s=>s.id===sectorId);
 const clusters=getClusters(galaxy,mode,sectorId);
 const selectedCluster=getCluster(clusterId);
 const allSpecies=getClusterOrganisms(clusterId);
 const unprioritisedClusters=clusters.filter(c=>c.galaxy==='bacteria'&&splitFeaturedSpecies(getClusterOrganisms(c.id)).featured.length===0);
 const hiddenClusterIds=new Set(unprioritisedClusters.map(c=>c.id));
 const visibleClusters=clusters.filter(c=>!hiddenClusterIds.has(c.id));
 const {featured:visibleSpecies,extended:outerSpecies}=useMemo(()=>splitFeaturedSpecies(allSpecies),[clusterId]);
 const rareSelected=galaxy!=='bacteria'&&selected&&outerSpecies.some(o=>o.id===selected.id)?selected:null;
 const matches=useMemo(()=>searchOrganisms(query),[query]);
 const galaxyLabel=GALAXIES.find(g=>g.id===galaxy)?.name||galaxy;
 const goto=(next:Level)=>{setLevel(next);setSelected(null);setOuterOpen(false);setSectorArchiveOpen(false);setShowHelp(false);setShowSettings(false)};
 const chooseGalaxy=(id:Galaxy)=>{setGalaxy(id);const first=getSectors(id,mode)[0];setSectorId(first?.id||'');goto('galaxy')};
 const chooseSector=(id:string)=>{setSectorId(id);goto('sector')};
 const openCluster=(id:string)=>{setClusterId(id);setSelected(null);setOuterOpen(false);setSectorArchiveOpen(false);setLevel('system')};
 const openArchivedCluster=(id:string)=>{setClusterId(id);setSelected(null);setOuterOpen(true);setSectorArchiveOpen(false);setLevel('system')};
 const visit=(id:string)=>{
   const o=findOrganism(id);if(!o)return;
   const g=getClusterFor(o,mode);if(!g)return;
   setGalaxy(o.galaxy as Galaxy);setSectorId(g.clinicalSector);setClusterId(g.id);
   setSelected(o);setTab('clinical');setLevel('system');setQuery('');setOuterOpen(false);
 };
 const changeMode=(next:Classification)=>{
   if(next===mode)return;
   setMode(next);setOuterOpen(false);setSectorArchiveOpen(false);
   if(level==='system'){
     const organism=selected||allSpecies[0];
     const g=organism?getClusterFor(organism,next):undefined;
     if(g){setClusterId(g.id);setSectorId(g.clinicalSector)}
   }else if(level==='sector'){
     const source=clusters[0];const firstOrg=source?getClusterOrganisms(source.id)[0]:undefined;
     const g=firstOrg?getClusterFor(firstOrg,next):undefined;
     setSectorId(g?.clinicalSector||getSectors(galaxy,next)[0]?.id||'');
   }else{setSectorId(getSectors(galaxy,next)[0]?.id||'')}
 };
 const heading=level==='universe'?{eyebrow:'LEVEL 01 · CARTOGRAPHY',title:'Choose a galaxy.',description:`Four domains of the atlas · ${release.total_entries.toLocaleString()} records including legacy additions.`}:
   level==='galaxy'?{eyebrow:`LEVEL 02 · ${galaxyLabel.toUpperCase()} GALAXY`,title:'Choose a sector.',description:mode==='clinical'?'Explore organisms through clinical and chapter-based groupings.':'Explore recorded taxonomic names. Unverified branches remain provisional.'}:
   level==='sector'?{eyebrow:'LEVEL 03 · CONSTELLATION',title:currentSector?.name||'Constellation map',description:`${visibleClusters.length} constellations · ${unprioritisedClusters.length} genera in the reserve index.`}:
   {eyebrow:'LEVEL 04 · SOLAR SYSTEM',title:`${selectedCluster?.name||'Unknown'} system`,description:`${visibleSpecies.length} featured planets${outerSpecies.length?` · ${outerSpecies.length} in the reserve index`:''} · ${allSpecies.length} total entries.`};
 return <div className={`app depth-${level}`}><Backdrop/>
   <header className="topbar"><button className="brand" onClick={()=>goto('intro')} aria-label="Pathogen Universe home"><Orbit size={22}/><span>PATHOGEN <b>UNIVERSE</b></span><small>ATLAS / 0.5.6</small></button>
     <div className="top-controls"><a className="technical-link" href={`${import.meta.env.BASE_URL}technical/`} target="_blank" rel="noopener noreferrer" title="Open evidence register and reference archive"><BookOpen size={16}/> Technical Stuff</a><a className="technical-link" href={`${import.meta.env.BASE_URL}technical/sanford/`}>Sanford Guide</a><div className="mode-switch" aria-label="Choose classification system"><button className={mode==='clinical'?'active':''} onClick={()=>changeMode('clinical')} aria-pressed={mode==='clinical'}>Clinical</button><button className={mode==='taxonomic'?'active':''} onClick={()=>changeMode('taxonomic')} aria-pressed={mode==='taxonomic'}>Taxonomic</button></div><button className="top-icon" onClick={()=>{setShowHelp(!showHelp);setShowSettings(false)}} aria-label="Show navigation guide" title="How to explore"><HelpCircle size={18}/></button><button className={`top-icon ${showSettings?'active':''}`} onClick={()=>{setShowSettings(!showSettings);setShowHelp(false)}} aria-label="Open display settings" title="Display settings"><Settings2 size={19}/></button></div>
   </header>
   {level==='intro'?<main className="intro"><div className="eyebrow">A CLINICAL MICROBIOLOGY ATLAS</div><div className="hero-visual" aria-hidden="true"><div className="hero-halo halo-one"/><div className="hero-halo halo-two"/><div className="hero-sun"/><div className="hero-small one"/><div className="hero-small two"/><div className="hero-small three"/></div><h1>A universe <em>beneath</em><br/>our perception.</h1><p>We look toward the stars and imagine worlds beyond our reach. Yet beneath the limits of human vision lies another universe — one shaped by organisms that coexist with us, and sometimes cause disease.</p><p>Explore galaxies of pathogens. Navigate their constellations, visit species planets, and uncover the microbiology behind human infection.</p><button className="primary" onClick={()=>goto('universe')}>Begin exploring <ArrowRight size={18}/></button><p className="intro-hint">Search across all {organisms.filter(o=>!o.canonicalOrganismId).length.toLocaleString()} entries, or travel between galaxy, sector, constellation and planet.</p><p className="visual-disclaimer">{hint} Scientific names, clinical descriptions and virulence information still require verification.</p></main>:<main className="explorer"><div className="explorer-top"><nav className="breadcrumbs" aria-label="Atlas location"><button onClick={()=>goto('universe')}>Universe</button>{level!=='universe'&&<><ChevronRight size={14}/><button onClick={()=>goto('galaxy')}>{galaxyLabel}</button></>}{(level==='sector'||level==='system')&&<><ChevronRight size={14}/><button onClick={()=>goto('sector')}>{currentSector?.name||'Sectors'}</button></>}{level==='system'&&<><ChevronRight size={14}/><span>{selectedCluster?.name}</span></>}</nav><div className="search"><Search size={17}/><input aria-label="Search organisms" placeholder="Search any organism or virus…" value={query} onChange={e=>setQuery(e.target.value)}/>{matches.length>0&&<div className="search-results">{matches.map(o=><button key={o.id} onClick={()=>visit(o.id)}>{o.scientificName}<small>{o.galaxy} · {o.taxonomyName&&o.taxonomyName!==o.scientificName?o.taxonomyName:'Open planet'}</small></button>)}</div>}</div></div>
     <section className="atlas-heading"><div className="eyebrow">{heading.eyebrow}</div><h1>{heading.title}</h1><p>{heading.description}</p></section>
     {level==='universe'&&<GalaxyMap onSelect={chooseGalaxy}/>}
     {level==='galaxy'&&<SectorMap mode={mode} galaxy={galaxy} motion={motion} speed={speed} onSelect={chooseSector}/>}
     {level==='sector'&&<><GenusMap genera={visibleClusters} onSelect={openCluster} mode={mode} sectorId={sectorId} dimmedIds={new Set<string>()}/>{unprioritisedClusters.length>0&&<div className="sector-archive-entry"><div><strong>{unprioritisedClusters.length} additional genera retained</strong><span>Browse these genera and their species in the reserve index.</span></div><button className="secondary-button" onClick={()=>setSectorArchiveOpen(v=>!v)} aria-expanded={sectorArchiveOpen}>{sectorArchiveOpen?'Close archive':'Open reserve genus index'} <ChevronRight size={16}/></button></div>}{sectorArchiveOpen&&unprioritisedClusters.length>0&&<SectorArchive genera={unprioritisedClusters} onOpen={openArchivedCluster}/>}</>}
     {level==='system'&&(allSpecies.length>0?<><div className={`system-stage ${selected?'with-panel':''}`}>{(visibleSpecies.length>0||galaxy!=='bacteria')&&<SystemMap species={visibleSpecies} systemName={selectedCluster?.name||'Organism'} selected={selected} extraCount={galaxy==='bacteria'?0:outerSpecies.length} rareSelected={rareSelected} onSelect={visit} onOpenExtra={()=>{setSelected(null);setOuterOpen(true)}} onCategory={t=>setTab(t)} motion={motion} speed={speed}/>}<div className="map-legend"><span>◉ Genus star</span><span>● {galaxy==='bacteria'?'Sanford-listed':'Up to 15'} featured planets</span>{galaxy!=='bacteria'&&<span>◌ Eccentric outer orbit opens other species</span>}<span>{motion?'⟳ Slow orbital motion':'Ⅱ Orbital motion paused'}</span></div>{galaxy==='bacteria'&&outerSpecies.length>0&&!outerOpen&&<button className="secondary-button" onClick={()=>setOuterOpen(true)}>Open reserve species index ({outerSpecies.length})</button>}{outerOpen&&outerSpecies.length>0&&<OuterOrbitTable key={clusterId} entries={outerSpecies} mode={mode} onChoose={visit} onClose={()=>setOuterOpen(false)}/>}</div></>:<div className="empty-system"><div className="empty-star"/><h2>No organism records in this constellation.</h2><button className="secondary-button" onClick={()=>goto('sector')}><ArrowLeft size={15}/> Return to constellation</button></div>)}
     {selected&&level==='system'&&<Details organism={selected} mode={mode} tab={tab} onTab={setTab} onClose={()=>setSelected(null)}/>}
   </main>}
   {showSettings&&<div className="floating-menu settings-menu" role="dialog" aria-label="Display settings"><div className="menu-title"><h2>Display settings</h2><button className="icon-button" onClick={()=>setShowSettings(false)} aria-label="Close settings"><X size={17}/></button></div><label className="toggle-line"><span><strong>Orbital movement</strong><small>Animate sector and species orbits slowly</small></span><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/></label><div className="setting-group"><span>Orbital speed</span><div className="speed-picker"><button disabled={!motion} className={speed==='subtle'?'active':''} onClick={()=>setSpeed('subtle')}><Pause size={13}/> Subtle</button><button disabled={!motion} className={speed==='normal'?'active':''} onClick={()=>setSpeed('normal')}><Gauge size={13}/> Normal</button></div></div><p className="settings-note"><Info size={14}/> Orbits are decorative. Reduced-motion preferences are respected by default.</p></div>}
   {showHelp&&<div className="floating-menu help-menu" role="dialog" aria-label="Navigation tutorial"><div className="menu-title"><h2><Compass size={19}/> How to explore</h2><button className="icon-button" onClick={()=>setShowHelp(false)} aria-label="Close tutorial"><X size={17}/></button></div><ol><li>Select any galaxy.</li><li>Choose a clinical or taxonomy sector.</li><li>Visit a constellation star (clinical group or recorded genus).</li><li>Select an organism planet and information category.</li></ol><p>Bacterial constellation maps show species named in the Sanford Guide imports. Use the reserve index or global search for other bacteria.</p><p className="settings-note">{hint}</p></div>}
   <footer className="footer"><span>PATHOGEN UNIVERSE · ILLUSTRATED CONSTELLATIONS v0.5.6</span><span><FlaskConical size={13}/> {release.total_entries.toLocaleString()} records · Taxonomy/clinical review incomplete</span><span><Play size={12}/> {motion?'Motion on':'Motion off'}</span></footer>
 </div>
}
export default App;
