import {organisms} from './atlas';
import type {Classification,Organism,Sector,Genus} from './atlas';

export type Galaxy='bacteria'|'viruses'|'fungi'|'parasites';
export const galaxies:{id:Galaxy;name:string;subtitle:string;accent:string;ready:boolean}[]=[
  {id:'bacteria',name:'Bacteria',subtitle:`${organisms.filter(o=>o.galaxy==='bacteria'&&!o.canonicalOrganismId).length.toLocaleString()} organism entries`,accent:'#e9bb76',ready:true},
  {id:'viruses',name:'Viruses',subtitle:'Viruses and prions',accent:'#8bd1e7',ready:true},
  {id:'fungi',name:'Fungi',subtitle:'Fungi and fungus-like taxa',accent:'#d3a5dc',ready:true},
  {id:'parasites',name:'Parasites',subtitle:'Parasites and medically important arthropods',accent:'#89cfac',ready:true}
];
type Cluster=Genus & {galaxy:Galaxy;mode:Classification;memberIds:string[]};
export type CatalogSector=Sector & {count:number};
const color=['#c4a5e6','#f0bc79','#79d7d0','#6eafdc','#e89585','#a1cc9b'];
const item=(id:string,name:string,subtitle:string):Sector=>({id,name,subtitle,x:0,y:0,color:color[0]});
const clinicalSectors:Record<Galaxy,Sector[]>={
 bacteria:[item('gp-cocci','Gram-positive cocci','Staphylococci, streptococci and relatives'),item('gp-rods','Gram-positive rods','Coryneforms, mycobacteria, and related'),item('gn-enteric','Gram-negative enteric','Enterobacterales and related rods'),item('gn-other','Other Gram-negative','Nonfermenters and fastidious organisms'),item('anaerobes','Anaerobes','Anaerobic cocci and rods'),item('curved-intracellular','Spirochaetes & atypicals','Curved, spiral and intracellular agents')],
 viruses:[item('hepatitis','Hepatitis viruses','HAV to HEV; clinical association'),item('herpes','Herpesviruses','HSV, VZV, EBV, CMV and relatives'),item('respiratory','Respiratory viruses','Influenza, coronaviruses and childhood viruses'),item('arboviruses','Vector & rodent-borne','Arboviruses and hantaviruses'),item('viral-other','Other viral infections','Enteric, pox, retro, and other viruses')],
 fungi:[item('yeasts','Yeasts','Candida, Cryptococcus and other yeasts'),item('moulds','Moulds','Aspergillus, Fusarium and relatives'),item('mucorales','Mucorales','Mucormycosis and related organisms'),item('dimorphic','Dimorphic fungi','Systemic mycoses'),item('dermatophytes','Superficial fungi','Dermatophytes and similar fungi'),item('fungi-other','Other fungi','Melanized, rare and fungus-like taxa')],
 parasites:[item('protozoa','Protozoa','Malaria, amoebae and other protozoa'),item('helminths','Helminths','Nematodes, cestodes and flukes'),item('arthropods','Arthropods','Vectors and ectoparasites')],
};
const taxLetterSectors:Sector[]=[item('taxonomy-a-d','Genera A–D','Alphabetical taxon listing'),item('taxonomy-e-k','Genera E–K','Alphabetical taxon listing'),item('taxonomy-l-p','Genera L–P','Alphabetical taxon listing'),item('taxonomy-q-z','Genera Q–Z','Alphabetical taxon listing')];
const taxVirusSectors:Sector[]=[item('ictv-mapped','Mapped ICTV taxa','Current formal species name available'),item('ictv-pending','ICTV unresolved','Formal taxon not independently resolved')];
function initial(name:string){return (name.trim().charAt(0)||'?').toUpperCase()}
function taxSector(name:string){const c=initial(name);return c<='D'?'taxonomy-a-d':c<='K'?'taxonomy-e-k':c<='P'?'taxonomy-l-p':'taxonomy-q-z'}
function sourceChapter(o:Organism){return o.sourceChapter||0}
function clinicalSector(o:Organism):string{
 if(o.clinicalSectorOverride)return o.clinicalSectorOverride;
 const c=sourceChapter(o),grp=(o.clinicalConstellation||'').toLowerCase();
 if(o.galaxy==='bacteria'){
   if(c>=20&&c<=24)return 'gp-cocci';if(c>=25&&c<=32)return 'gp-rods';
   if(c>=33&&c<=41)return 'gn-enteric';if(c>=42&&c<=49)return 'gn-other';
   if(c>=50&&c<=54)return 'anaerobes';if(c>=55&&c<=67)return 'curved-intracellular';
   return 'gp-cocci';
 }
 if(o.galaxy==='viruses'){
   if(grp.includes('hepatitis'))return 'hepatitis';if(grp.includes('herpes'))return 'herpes';
   if(grp.includes('respiratory')||grp.includes('influenza')||grp.includes('corona'))return 'respiratory';
   if(grp.includes('arbovirus')||grp.includes('rodent'))return 'arboviruses';return 'viral-other';
 }
 if(o.galaxy==='fungi'){
   if(c===117)return 'yeasts';if(c===118||c===119||c===120)return 'moulds';
   if(c===121)return 'mucorales';if(c===122)return 'dimorphic';if(c===123)return 'dermatophytes';return 'fungi-other';
 }
 if(o.sourceDomain==='Arthropoda')return 'arthropods';if(c>=143&&c<=147)return 'helminths';return 'protozoa';
}
function formalVirusGenus(o:Organism){return o.ictvSpecies?.split(/\s+/)[0]||''}
function groupName(o:Organism,mode:Classification){
 if(mode==='clinical')return o.clinicalConstellation || o.taxonomyGenus || 'Other';
 if(o.galaxy==='viruses')return formalVirusGenus(o)||'Unresolved ICTV species';
 return o.taxonomyGenus || o.taxonomyName?.split(' ')[0] || 'Unresolved';
}
function groupSector(o:Organism,mode:Classification){
 if(mode==='clinical')return clinicalSector(o);
 if(o.galaxy==='viruses')return o.ictvSpecies?'ictv-mapped':'ictv-pending';
 return taxSector(groupName(o,mode));
}
const allClusters:Cluster[]=[];
const clusterMap=new Map<string,Cluster>();
for(const o of organisms){
 if(o.canonicalOrganismId)continue;
 const galaxy=o.galaxy as Galaxy;
 for(const mode of ['clinical','taxonomic'] as const){
   const name=groupName(o,mode);
   const sector=groupSector(o,mode);
   const id=`${galaxy}--${mode}--${sector}--${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
   let cluster=clusterMap.get(id);
   if(!cluster){cluster={id,name,clinicalSector:sector,taxonomicSector:sector,status:'available',galaxy,mode,memberIds:[]};clusterMap.set(id,cluster);allClusters.push(cluster)}
   cluster.memberIds.push(o.id);
 }
}
allClusters.sort((a,b)=>a.name.localeCompare(b.name));
const organismById=new Map(organisms.map(o=>[o.id,o]));
export function findOrganism(id:string|null){
 const entry=id?organismById.get(id):undefined;
 return entry?.canonicalOrganismId?organismById.get(entry.canonicalOrganismId):entry;
}
export function getCluster(id:string){return clusterMap.get(id)}
export function getClusterFor(o:Organism,mode:Classification){
 const name=groupName(o,mode),sector=groupSector(o,mode);
 return clusterMap.get(`${o.galaxy}--${mode}--${sector}--${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`);
}
export function getClusterOrganisms(id:string){return (clusterMap.get(id)?.memberIds||[]).map(id=>organismById.get(id)).filter((x):x is Organism=>!!x)}
export function getClusters(galaxy:Galaxy,mode:Classification,sectorId:string){return allClusters.filter(g=>g.galaxy===galaxy&&g.mode===mode&&g.clinicalSector===sectorId)}
export function getSectors(galaxy:Galaxy,mode:Classification):CatalogSector[]{
 const base=mode==='clinical'?clinicalSectors[galaxy]:galaxy==='viruses'?taxVirusSectors:taxLetterSectors;
 return base.map((s,i)=>({...s,color:color[i%color.length],count:allClusters.filter(g=>g.galaxy===galaxy&&g.mode===mode&&g.clinicalSector===s.id).length})).filter(s=>s.count>0);
}
export function countGalaxy(galaxy:Galaxy){return organisms.filter(o=>o.galaxy===galaxy&&!o.canonicalOrganismId).length}
export function searchOrganisms(term:string){const q=term.trim().toLowerCase();if(!q)return [];
 return organisms.filter(o=>!o.canonicalOrganismId&&[o.scientificName,o.taxonomyName,o.ictvSpecies,...(o.aliases||[])].some(v=>v?.toLowerCase().includes(q))).slice(0,18)}
