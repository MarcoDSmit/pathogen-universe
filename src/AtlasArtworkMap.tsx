import {useMemo,useState} from 'react';
import type {KeyboardEvent} from 'react';
import type {Genus} from './atlas';
import designsSource from './data/user_constellations.json';
import './artworks.css';

type Coordinate = readonly [number,number];
type Design = {id:string;sector:string;name:string;meaning:string;expectedStars:number;art:string;points:number[][]};
type AssignedStar = {genus:Genus;point:Coordinate;ordinal:number};
type Card = {id:string;name:string;meaning:string;art:string;stars:AssignedStar[];totalPositions:number;overflow:boolean};
const designs = designsSource as Design[];
const keySelect = (e:KeyboardEvent<SVGGElement>,action:()=>void) => {
  if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}
};

/** Choose separated anchors when a curated map shows fewer genera than the
 * original user drawing. No points are invented in these sourced cards. */
function spreadAnchors(points:number[][],count:number):Coordinate[]{
  if(count>=points.length)return points.map(p=>[p[0],p[1]] as const);
  if(count<1)return [];
  const chosen:number[]=[];
  let bestFirst=0, bestDist=-1;
  for(let i=0;i<points.length;i++){
    const dx=points[i][0]-152.5,dy=points[i][1]-122.5;
    const dist=dx*dx+dy*dy;
    if(dist>bestDist){bestDist=dist;bestFirst=i;}
  }
  chosen.push(bestFirst);
  while(chosen.length<count){
    let best=-1,bestScore=-1;
    for(let i=0;i<points.length;i++){
      if(chosen.includes(i))continue;
      const nearest=Math.min(...chosen.map(j=>Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1])));
      if(nearest>bestScore){bestScore=nearest;best=i;}
    }
    if(best<0)break;
    chosen.push(best);
  }
  chosen.sort((a,b)=>a-b);
  return chosen.map(i=>[points[i][0],points[i][1]] as const);
}

function createCards(genera:Genus[],sectorId:string):Card[]{
  const specs=designs.filter(d=>d.sector===sectorId);
  const result:Card[]=[];
  let pointer=0;
  for(const spec of specs){
    if(pointer>=genera.length)break;
    const subset=genera.slice(pointer,pointer+spec.expectedStars);
    pointer+=subset.length;
    const anchors=spreadAnchors(spec.points,subset.length);
    result.push({id:spec.id,name:spec.name,meaning:spec.meaning,art:spec.art,totalPositions:spec.expectedStars,overflow:false,
      stars:subset.map((genus,ordinal)=>({genus,point:anchors[ordinal],ordinal}))});
  }
  // Extended View is deliberately more crowded. Additional genera remain on
  // the same page; overflow appears on clearly labelled secondary starfields.
  let overflowNumber=0;
  while(pointer<genera.length){
    overflowNumber++;
    const subset=genera.slice(pointer,pointer+18);pointer+=subset.length;
    const grid:Coordinate[]=Array.from({length:subset.length},(_,i)=>{
      const col=i%6,row=Math.floor(i/6);
      return [32+col*48,46+row*78] as const;
    });
    result.push({id:`extended-${sectorId}-${overflowNumber}`,name:`Deep-field extension ${overflowNumber}`,
      meaning:'Additional genera in Extended View',art:'',totalPositions:subset.length,overflow:true,
      stars:subset.map((genus,ordinal)=>({genus,point:grid[ordinal],ordinal}))});
  }
  return result;
}

export function hasDrawnConstellations(sectorId:string){return designs.some(d=>d.sector===sectorId)}

export function AtlasArtworkMap({genera,sectorId,onSelect,dimmedIds}:{
  genera:Genus[];sectorId:string;onSelect:(id:string)=>void;dimmedIds:ReadonlySet<string>;
}){
  const [hovered,setHovered]=useState<string|null>(null);
  const cards=useMemo(()=>createCards(genera,sectorId),[genera,sectorId]);
  if(genera.length===0)return <div className="empty-sector-map"><div className="empty-star"/><h2>No featured genus stars in this sector</h2><p>Its organisms remain searchable in the extended genus archive below.</p></div>;
  const artBase='/pathogen-universe/';
  return <div className="drawn-atlas-shell">
    <div className="drawn-atlas-heading"><span>THE ILLUSTRATED CONSTELLATIONS</span><p>Original atlas drawings · Select a luminous star or its labelled entry below · All constellations stay on this page</p></div>
    <div className={`drawn-atlas-grid ${cards.length===1?'single-constellation':''}`}>
    {cards.map(card=>{
      const hoveredStar=card.stars.find(s=>s.genus.id===hovered);
      return <section key={card.id} className={`drawn-card ${card.overflow?'drawn-card-overflow':''}`} aria-label={`${card.name} · ${card.stars.length} genus stars`}>
        <div className="drawn-card-top"><div><span>CONSTELLATION · {card.stars.length} {card.stars.length===1?'STAR':'STARS'}</span><h2>{card.name}</h2><p>{card.meaning}</p></div><div className="drawn-card-count" aria-hidden="true">{String(card.stars.length).padStart(2,'0')}</div></div>
        <div className="drawn-sky">
          <svg className="drawn-sky-svg" viewBox="0 0 305 245" role="group" aria-label={`Interactive stars of ${card.name}`}>
            <defs><radialGradient id={`drawn-glow-${card.id}`}><stop stopColor="#f9deb4" stopOpacity=".36"/><stop offset="1" stopColor="#f9deb4" stopOpacity="0"/></radialGradient></defs>
            {card.art&&<image href={`${artBase}${card.art}`} x="0" y="0" width="305" height="245" preserveAspectRatio="xMidYMid meet" className="drawn-silhouette"/>}
            {card.overflow&&<g aria-hidden="true">{Array.from({length:64},(_,i)=><circle key={i} cx={9+(i*83)%293} cy={12+(i*47)%226} r={i%4===0?.8:.45} fill="#a6c5e2" opacity=".15"/>)}</g>}
            {card.stars.map((star)=>{
              const [x,y]=star.point;
              const active=hovered===star.genus.id;
              return <g key={star.genus.id} role="button" tabIndex={0} aria-label={`Open ${star.genus.name}`} className={`drawn-star ${active?'is-active':''} ${dimmedIds.has(star.genus.id)?'is-background':''}`}
                onMouseEnter={()=>setHovered(star.genus.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(star.genus.id)} onBlur={()=>setHovered(null)}
                onClick={()=>onSelect(star.genus.id)} onKeyDown={e=>keySelect(e,()=>onSelect(star.genus.id))}>
                <title>{star.genus.name}</title>
                <circle cx={x} cy={y} r={active?15:10} fill={`url(#drawn-glow-${card.id})`} opacity={active?1:.75}/>
                <circle cx={x} cy={y} r={active?4.1:2.8} fill={active?'#fff3d2':'#f5d6a6'} stroke="#fff4d8" strokeWidth={active?1:.5}/>
                <circle cx={x} cy={y} r="8.2" fill="transparent"/>
              </g>;
            })}
          </svg>
        </div>
        <div className="drawn-hover-status" aria-live="polite">{hoveredStar?<><span className="drawn-twinkle">✦</span> {hoveredStar.genus.name}</>:<span>Hover a star to identify its genus</span>}</div>
        <div className="drawn-name-grid" aria-label={`Genera within ${card.name}`}>
          {card.stars.map((star,i)=><button key={star.genus.id} type="button" onMouseEnter={()=>setHovered(star.genus.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(star.genus.id)} onBlur={()=>setHovered(null)} onClick={()=>onSelect(star.genus.id)} className={`drawn-genus-button ${hovered===star.genus.id?'is-active':''} ${dimmedIds.has(star.genus.id)?'is-background':''}`} title={`Open ${star.genus.name}`}>
            <span>{String(i+1).padStart(2,'0')}</span><strong>{star.genus.name}</strong>
          </button>)}
        </div>
      </section>;
    })}
    </div>
    <p className="drawn-atlas-footnote">Illustrated designs and star anchors follow the supplied atlas. Species data, taxonomic names and clinical importance are maintained separately. Star-to-genus assignments are navigation choices, not evidence of biological relationships.</p>
  </div>;
}
