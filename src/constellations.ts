/**
 * Invented navigation constellations for the atlas.
 * These are intentionally whimsical and are not real sky charts.
 */
export type SkyPoint = readonly [number,number];
export type SkyPattern = {
  name:string;
  note:string;
  points:readonly SkyPoint[];
  edges:readonly (readonly [number,number])[];
};

type ShapeSpec={name:string;note:string;guide:SkyPoint[]};

const shapes:Record<string,ShapeSpec>={
  'gp-cocci':{name:'The Microscope',note:'Invented constellation inspired by a laboratory microscope.',guide:[[250,450],[350,360],[445,240],[540,175],[615,205],[560,290],[500,360],[590,420],[710,430],[790,350],[735,255],[635,250]]},
  'gp-rods':{name:'The MALDI',note:'A fanciful bench-top MALDI-TOF silhouette.',guide:[[170,420],[255,420],[310,245],[495,245],[535,210],[760,210],[840,250],[840,395],[745,430],[565,430],[515,380],[350,380],[285,445]]},
  'gn-enteric':{name:'The PCR Cycler',note:'A stylised thermocycler with a lifted lid.',guide:[[175,440],[280,310],[400,220],[520,170],[650,210],[770,300],[885,420],[745,455],[555,455],[385,445],[245,450]]},
  'gn-other':{name:'The Petri Dish',note:'An invented dish-like constellation with a sampling sweep.',guide:[[250,310],[310,215],[425,165],[550,150],[690,180],[790,255],[835,360],[790,450],[680,515],[530,535],[385,500],[285,420],[260,315],[470,250],[610,300],[540,390],[410,350]]},
  'anaerobes':{name:'The Pipette',note:'A made-up pipette-shaped navigation figure.',guide:[[225,175],[365,175],[480,255],[615,390],[760,520],[680,560],[545,425],[420,300],[320,240],[215,205]]},
  'curved-intracellular':{name:'The Double Helix',note:'A playful DNA-like atlas constellation.',guide:[[250,175],[355,220],[460,305],[560,390],[670,460],[795,500],[770,420],[655,340],[545,250],[440,175],[320,135],[255,205],[360,300],[470,390],[585,470],[700,520]]},
  'taxonomy-a-d':{name:'The Culture Plate',note:'Invented constellation patterned after a culture plate.',guide:[[295,205],[420,160],[570,150],[715,185],[810,285],[805,405],[705,495],[560,535],[410,520],[290,450],[245,330],[285,225],[425,250],[575,265],[685,340],[610,435],[470,450],[360,385]]},
  'taxonomy-e-k':{name:'The Sequencer',note:'A whimsical sequencing-instrument motif.',guide:[[180,455],[280,355],[395,245],[505,190],[640,165],[790,195],[860,305],[800,405],[670,445],[520,445],[395,430],[275,500],[230,565]]},
  'taxonomy-l-p':{name:'The Laboratory Lamp',note:'A made-up lamp constellation for taxonomic navigation.',guide:[[350,525],[445,420],[545,320],[605,245],[555,165],[440,135],[330,170],[265,265],[305,355],[415,405],[565,420],[705,430],[800,355],[805,250]]},
  'taxonomy-q-z':{name:'The Cryo Rack',note:'A stylised rack of tubes for the remaining genera.',guide:[[205,465],[325,445],[445,425],[565,405],[685,390],[805,365],[765,255],[645,235],[525,225],[405,215],[285,205],[235,295],[245,405]]},
  'ictv-mapped':{name:'The Capsid',note:'A geometric capsid-inspired virus map.',guide:[[330,170],[540,135],[745,180],[845,315],[790,465],[610,535],[405,505],[260,390],[275,230],[440,215],[610,230],[710,340],[630,435],[475,440],[370,350]]},
  'ictv-pending':{name:'The Virome Cloud',note:'A provisional cloud for unresolved formal viral taxa.',guide:[[250,350],[305,230],[430,170],[595,165],[730,215],[815,320],[790,430],[680,505],[525,530],[375,500],[285,440],[240,345]]},
  'hepatitis':{name:'The Hepatic Arc',note:'Clinical grouping of hepatitis viruses shown in one arc.',guide:[[295,385],[385,285],[500,220],[615,215],[735,270],[815,380],[730,465],[585,500],[435,485],[320,435]]},
  'herpes':{name:'The Latency Crown',note:'An imagined crown-like constellation for herpesviruses.',guide:[[210,390],[305,245],[435,180],[545,145],[665,175],[790,255],[875,395],[735,490],[555,535],[355,500]]},
  'respiratory':{name:'The Aerosol Drift',note:'A drifting aerosol-inspired constellation.',guide:[[220,350],[305,260],[415,205],[540,185],[650,205],[760,265],[855,360],[785,435],[665,470],[535,485],[405,465],[295,420]]},
  'arboviruses':{name:'The Mosquito',note:'A fanciful mosquito-shaped clinical constellation.',guide:[[215,345],[315,245],[455,205],[560,240],[675,190],[800,225],[855,330],[760,375],[650,350],[545,315],[450,390],[355,475],[280,550]]},
  'viral-other':{name:'The Plaque Field',note:'A made-up plaque-style constellation for other viruses.',guide:[[250,230],[390,165],[555,150],[715,190],[835,290],[845,410],[740,495],[575,535],[395,510],[275,435],[220,325],[340,310],[500,315],[650,335],[735,395],[620,445],[470,430],[345,390]]},
  'yeasts':{name:'The Budding Cell',note:'An invented budding-yeast silhouette.',guide:[[270,380],[315,260],[410,190],[525,170],[615,205],[680,290],[685,385],[635,470],[540,525],[430,520],[345,455],[305,375],[470,340],[555,405]]},
  'moulds':{name:'The Hyphal Fan',note:'A branched mould-like constellation.',guide:[[275,500],[355,390],[455,295],[565,230],[700,180],[805,160],[740,265],[655,360],[570,455],[480,530],[420,455],[365,355],[305,260]]},
  'mucorales':{name:'The Sporangium',note:'A circular sporangium-inspired figure.',guide:[[325,220],[455,165],[610,160],[740,220],[820,340],[805,455],[700,535],[550,560],[390,535],[290,445],[260,330],[310,240],[455,275],[610,275],[705,340],[625,430],[485,445],[380,390]]},
  'dimorphic':{name:'The Split Form',note:'A two-form constellation for dimorphic fungi.',guide:[[245,420],[315,295],[410,205],[540,165],[655,205],[755,295],[815,420],[715,485],[585,515],[470,510],[350,470]]},
  'dermatophytes':{name:'The Keratin Loop',note:'A looped invented shape for superficial fungi.',guide:[[290,240],[410,180],[560,170],[705,220],[780,330],[740,445],[620,515],[465,530],[330,475],[265,365],[285,255],[455,290],[620,340],[560,430],[420,430]]},
  'fungi-other':{name:'The Mycelial Bloom',note:'A whimsical bloom-like fungal constellation.',guide:[[255,355],[330,235],[455,175],[585,170],[710,220],[805,335],[785,445],[690,525],[560,560],[435,545],[335,480],[265,390],[410,330],[560,300],[700,350]]},
  'protozoa':{name:'The Trophozoite',note:'An invented amoeboid constellation.',guide:[[230,375],[295,260],[405,190],[545,170],[670,210],[770,300],[815,415],[740,505],[610,555],[455,545],[330,475],[245,390],[365,355],[500,320],[635,345]]},
  'helminths':{name:'The Coil',note:'A coiled helminth-inspired path.',guide:[[220,290],[305,210],[430,175],[565,185],[680,240],[750,330],[770,435],[730,520],[640,570],[525,575],[420,540],[345,470],[320,380],[350,300],[425,245],[515,235],[605,265],[660,335],[670,425],[635,495],[565,530],[475,525]]},
  'arthropods':{name:'The Arthropod',note:'A fanciful jointed-body figure.',guide:[[230,340],[310,255],[430,205],[560,205],[695,245],[795,330],[855,430],[760,455],[660,420],[560,380],[460,420],[355,495],[265,550],[325,435],[420,345],[535,300],[655,325],[735,390]]}
};

const fallbackShapes:ShapeSpec[]=[
  {name:'The Orbital Array',note:'Invented navigation figure for this atlas.',guide:[[260,330],[340,225],[470,165],[610,170],[740,235],[805,350],[760,465],[645,540],[500,560],[365,520],[275,430]]},
  {name:'The Signal Trace',note:'A whimsical signal-trace constellation.',guide:[[200,450],[310,315],[430,235],[560,195],[690,215],[805,285],[855,390],[790,490],[650,545],[500,530],[360,470],[250,390]]}
];

const distance=(a:SkyPoint,b:SkyPoint)=>Math.hypot(b[0]-a[0],b[1]-a[1]);

function sampleGuide(guide:SkyPoint[],count:number):SkyPoint[]{
  if(count<=0)return [];
  if(count===1)return [[540,300] as const];
  const lengths:number[]=[];
  let total=0;
  for(let i=0;i<guide.length-1;i++){const d=distance(guide[i],guide[i+1]);lengths.push(d);total+=d}
  const points:SkyPoint[]=[];
  for(let i=0;i<count;i++){
    const target=(i/(count-1))*total;
    let remaining=target,segment=0;
    while(segment<lengths.length-1&&remaining>lengths[segment]){remaining-=lengths[segment];segment++}
    const segLength=lengths[segment]||1;
    const [x1,y1]=guide[segment];
    const [x2,y2]=guide[segment+1]||guide[segment];
    const t=segLength===0?0:remaining/segLength;
    const x=x1+(x2-x1)*t;
    const y=y1+(y2-y1)*t;
    const wobble=((i%2===0)?1:-1)*Math.min(8,Math.max(2,22/count));
    points.push([x,y+((i%3===0)?wobble:0)] as const);
  }
  return points;
}

function buildEdges(count:number){
  const edges:(readonly [number,number])[]=[];
  for(let i=0;i<count-1;i++)edges.push([i,i+1] as const);
  for(let i=0;i<count-3;i+=3)edges.push([i,i+3] as const);
  return edges;
}

function pickShape(sectorId:string){
  if(shapes[sectorId])return shapes[sectorId];
  const hash=sectorId.split('').reduce((acc,ch)=>acc+ch.charCodeAt(0),0);
  return fallbackShapes[hash%fallbackShapes.length];
}

export function getSkyPattern(count:number,sectorId=''):SkyPattern {
  if(count===0)return {name:'Uncharted sky',note:'No genus stars mapped here yet.',points:[],edges:[]};
  const spec=pickShape(sectorId);
  const points=sampleGuide(spec.guide,count);
  return {name:spec.name,note:spec.note,points,edges:buildEdges(points.length)};
}

/** Visual motifs are decorative; taxonomy is never derived from the artwork. */
export function getLabMotif(sectorId:string):'microscope'|'maldi'|'pcr'|'petri'|'pipette'|'helix'|'other'{
 if(sectorId==='gp-cocci')return 'microscope';
 if(sectorId==='gp-rods')return 'maldi';
 if(sectorId==='gn-enteric')return 'pcr';
 if(sectorId==='gn-other'||sectorId==='taxonomy-a-d')return 'petri';
 if(sectorId==='anaerobes'||sectorId==='taxonomy-l-p')return 'pipette';
 if(sectorId==='curved-intracellular'||sectorId==='taxonomy-e-k')return 'helix';
 if(sectorId==='hepatitis'||sectorId==='herpes'||sectorId==='respiratory'||sectorId==='arboviruses')return 'helix';
 if(sectorId==='moulds'||sectorId==='yeasts'||sectorId==='fungi-other'||sectorId==='dimorphic')return 'petri';
 return 'other';
}
