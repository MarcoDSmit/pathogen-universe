/** v0.5.2 integrated catalog + preserved legacy regimens: integrity checks (no packages). */
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL(`../src/data/${n}.json`,import.meta.url),'utf8'));
const rows=read('organisms'),groups=read('organism_groups'),regimens=read('regimens');
const drugs=read('antibiotics'),syndromes=read('syndromes'),release=read('release');
const err=[];
const ids=new Set(rows.map(o=>o.id)),groupIds=new Set(groups.map(g=>g.id)),drugIds=new Set(drugs.map(x=>x.id)),syndromeIds=new Set(syndromes.map(x=>x.id));
const check=(ok,msg)=>{if(!ok)err.push(msg)};
check(ids.size===rows.length, 'Duplicate organism IDs');
check(rows.length===release.total_entries, 'Release record count mismatch');
const validGalaxies=new Set(['bacteria','viruses','fungi','parasites']);
for(const o of rows){
 check(o.id && o.scientificName && o.taxonomyName,`Missing scientific or taxonomy name: ${o.id}`);
 check(validGalaxies.has(o.galaxy),`Unknown galaxy ${o.galaxy}: ${o.id}`);
 check(o.clinicalConstellation && o.genusId,`No clinical constellation: ${o.id}`);
 check(typeof o.needsTaxonomyReview==='boolean',`Missing nomenclature review flag: ${o.id}`);
 for(const id of o.groupIds||[])check(groupIds.has(id),`Unknown legacy group ${id} in ${o.id}`);
}
for(const g of groups)for(const id of g.memberOrganismIds||[])check(ids.has(id),`Unknown group organism ${id}`);
for(const r of regimens){
 if(r.organismId)check(ids.has(r.organismId),`Regimen ${r.id} refers to unknown organism ${r.organismId}`);
 if(r.organismGroupId||r.groupId)check(groupIds.has(r.organismGroupId||r.groupId),`Unknown group on regimen ${r.id}`);
 if(r.syndromeId)check(syndromeIds.has(r.syndromeId),`Unknown syndrome ${r.syndromeId}`);
 for(const id of r.antibioticIds||[])check(drugIds.has(id),`Unknown antibiotic ${id}`);
}
const domains=Object.fromEntries([...validGalaxies].map(g=>[g,rows.filter(o=>o.galaxy===g).length]));
check(Object.values(domains).every(x=>x>0),'At least one galaxy has no imported records');
for(const name of ['hepatitis-a-virus','hepatitis-b-virus','hepatitis-c-virus','hepatitis-d-virus','hepatitis-e-virus']){
 const o=rows.find(x=>x.id===name);check(o?.clinicalConstellation==='Hepatitis viruses',`Hepatitis clinical constellation missing ${name}`);
}
if(err.length){console.error(`Validation failed: ${err.length} error(s)\n${err.slice(0,30).join('\n')}`);process.exitCode=1;}
else console.log(`Validated ${rows.length} entries in 4 galaxies: ${JSON.stringify(domains)}; ${groups.length} legacy groups and ${regimens.length} preserved draft regimens.`);
