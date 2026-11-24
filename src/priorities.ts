/**
 * Display curation only, not an epidemiological frequency ranking.
 * Public VITEK MS claims give a modest bonus for species listed on a clinical
 * MALDI-TOF platform; the curated list prioritises familiar/important organisms.
 * The complete set of source organisms remains in src/data/organisms.json.
 */
import type {Organism} from './atlas';
import maldiData from './data/maldi_public_claim_subset.json';
import sanfordRoster from './data/sanford_roster.json';
import eucastTriage from './data/eucast_triage.json';

const nameKey=(value:string)=>value.toLocaleLowerCase('en').trim().replace(/\s+/g,' ');
const maldiNames=new Set(maldiData.names.map(nameKey));

/** Editorial educational priorities; spelling preserved from source names/aliases. */
const priorityNames=`
Staphylococcus aureus|Staphylococcus epidermidis|Staphylococcus saprophyticus|Staphylococcus lugdunensis|Staphylococcus haemolyticus|Staphylococcus hominis|Staphylococcus capitis|Staphylococcus warneri|Staphylococcus pseudintermedius|Staphylococcus schleiferi|Staphylococcus simulans|Staphylococcus intermedius
Streptococcus pyogenes|Streptococcus agalactiae|Streptococcus pneumoniae|Streptococcus dysgalactiae|Streptococcus anginosus|Streptococcus intermedius|Streptococcus constellatus|Streptococcus gallolyticus|Streptococcus mutans|Streptococcus sanguinis|Streptococcus mitis|Streptococcus oralis|Streptococcus salivarius|Streptococcus suis
Enterococcus faecalis|Enterococcus faecium|Enterococcus gallinarum|Enterococcus casseliflavus|Enterococcus avium|Enterococcus durans
Escherichia coli|Klebsiella pneumoniae|Klebsiella oxytoca|Klebsiella variicola|Klebsiella aerogenes
Enterobacter cloacae|Enterobacter hormaechei|Enterobacter asburiae|Enterobacter kobei|Enterobacter ludwigii|Enterobacter aerogenes
Pseudomonas aeruginosa|Pseudomonas putida|Pseudomonas fluorescens|Pseudomonas stutzeri|Pseudomonas mendocina
Acinetobacter baumannii|Acinetobacter pittii|Acinetobacter nosocomialis|Acinetobacter lwoffii|Acinetobacter haemolyticus|Acinetobacter calcoaceticus|Acinetobacter junii
Citrobacter freundii|Citrobacter koseri|Citrobacter braakii|Citrobacter amalonaticus
Proteus mirabilis|Proteus vulgaris|Proteus penneri
Serratia marcescens|Serratia liquefaciens|Serratia rubidaea
Salmonella enterica|Shigella sonnei|Shigella flexneri|Shigella dysenteriae|Shigella boydii
Neisseria meningitidis|Neisseria gonorrhoeae|Neisseria lactamica|Neisseria cinerea|Neisseria mucosa|Neisseria sicca
Haemophilus influenzae|Haemophilus parainfluenzae|Haemophilus ducreyi|Haemophilus haemolyticus
Campylobacter jejuni|Campylobacter coli|Campylobacter fetus|Campylobacter upsaliensis
Helicobacter pylori|Helicobacter cinaedi|Helicobacter fennelliae|Helicobacter heilmannii
Bacteroides fragilis|Bacteroides thetaiotaomicron|Bacteroides ovatus|Bacteroides vulgatus|Bacteroides uniformis|Bacteroides caccae|Bacteroides stercoris
Clostridium perfringens|Clostridium difficile|Clostridioides difficile|Clostridium tetani|Clostridium botulinum|Clostridium septicum|Clostridium sordellii|Clostridium novyi|Clostridium tertium|Clostridium innocuum|Clostridium ramosum
Cutibacterium acnes|Propionibacterium acnes|Cutibacterium avidum|Cutibacterium granulosum
Mycobacterium tuberculosis|Mycobacterium bovis|Mycobacterium africanum|Mycobacterium avium|Mycobacterium intracellulare|Mycobacterium abscessus|Mycobacterium chelonae|Mycobacterium fortuitum|Mycobacterium kansasii|Mycobacterium marinum|Mycobacterium leprae|Mycobacterium ulcerans|Mycobacterium gordonae|Mycobacterium xenopi|Mycobacterium haemophilum
Nocardia farcinica|Nocardia cyriacigeorgica|Nocardia brasiliensis|Nocardia nova|Nocardia abscessus|Nocardia otitidiscaviarum|Nocardia pseudobrasiliensis|Nocardia transvalensis|Nocardia veterana
Corynebacterium diphtheriae|Corynebacterium striatum|Corynebacterium jeikeium|Corynebacterium urealyticum|Corynebacterium amycolatum|Corynebacterium minutissimum|Corynebacterium ulcerans|Corynebacterium pseudotuberculosis|Corynebacterium kroppenstedtii|Corynebacterium afermentans
Bacillus anthracis|Bacillus cereus|Bacillus subtilis|Bacillus licheniformis|Bacillus thuringiensis|Bacillus megaterium|Bacillus pumilus
Legionella pneumophila|Legionella longbeachae|Legionella micdadei|Legionella bozemanii|Legionella dumoffii|Legionella anisa|Legionella jordanis
Borrelia burgdorferi|Borrelia afzelii|Borrelia garinii|Borrelia recurrentis|Borrelia miyamotoi|Borrelia hermsii|Borrelia duttonii
Leptospira interrogans|Leptospira kirschneri|Leptospira borgpetersenii
Bartonella henselae|Bartonella quintana|Bartonella bacilliformis|Bartonella elizabethae|Bartonella vinsonii|Bartonella koehlerae
Burkholderia cepacia|Burkholderia cenocepacia|Burkholderia multivorans|Burkholderia pseudomallei|Burkholderia mallei|Burkholderia gladioli|Burkholderia contaminans|Burkholderia vietnamiensis
Aeromonas hydrophila|Aeromonas caviae|Aeromonas veronii|Aeromonas sobria|Aeromonas jandaei
Vibrio cholerae|Vibrio vulnificus|Vibrio parahaemolyticus|Vibrio alginolyticus|Vibrio fluvialis|Vibrio mimicus
Yersinia pestis|Yersinia enterocolitica|Yersinia pseudotuberculosis|Yersinia ruckeri
Rickettsia rickettsii|Rickettsia conorii|Rickettsia typhi|Rickettsia prowazekii|Rickettsia africae|Rickettsia akari|Rickettsia felis|Rickettsia parkeri
Candida albicans|Candida auris|Candida glabrata|Candida tropicalis|Candida parapsilosis|Candida krusei|Candida dubliniensis|Candida lusitaniae|Candida kefyr|Candida guilliermondii|Candida haemulonii|Candida orthopsilosis|Candida metapsilosis|Candida rugosa
Aspergillus fumigatus|Aspergillus flavus|Aspergillus niger|Aspergillus terreus|Aspergillus nidulans|Aspergillus lentulus|Aspergillus ustus|Aspergillus versicolor|Aspergillus calidoustus
Cryptococcus neoformans|Cryptococcus gattii|Cryptococcus albidus|Cryptococcus laurentii
Fusarium solani|Fusarium oxysporum|Fusarium proliferatum|Fusarium verticillioides
Trichophyton rubrum|Trichophyton interdigitale|Trichophyton tonsurans|Trichophyton violaceum|Trichophyton verrucosum|Trichophyton mentagrophytes
Histoplasma capsulatum|Blastomyces dermatitidis|Coccidioides immitis|Coccidioides posadasii|Paracoccidioides brasiliensis|Sporothrix schenckii
Plasmodium falciparum|Plasmodium vivax|Plasmodium ovale|Plasmodium malariae|Plasmodium knowlesi
Cryptosporidium parvum|Cryptosporidium hominis|Cryptosporidium meleagridis|Cryptosporidium canis|Cryptosporidium felis
Giardia duodenalis|Giardia lamblia|Entamoeba histolytica|Toxoplasma gondii|Leishmania donovani|Leishmania infantum|Leishmania major|Trypanosoma cruzi|Trypanosoma brucei
Schistosoma haematobium|Schistosoma mansoni|Schistosoma japonicum|Ascaris lumbricoides|Strongyloides stercoralis|Enterobius vermicularis|Trichuris trichiura|Taenia solium|Taenia saginata|Echinococcus granulosus|Echinococcus multilocularis
Ixodes scapularis|Ixodes ricinus|Ixodes pacificus|Aedes aegypti|Aedes albopictus|Anopheles gambiae|Culex pipiens|Sarcoptes scabiei
`.split(/[\n|]+/).map(s=>s.trim()).filter(Boolean);

const priorityIndex=new Map(priorityNames.map((name,i)=>[nameKey(name),i]));

export function isMaldiClaimMatched(o:Organism){
 if(o.galaxy!=='bacteria'&&o.galaxy!=='fungi')return false;
 return [o.scientificName,o.taxonomyName,...(o.aliases||[])].some(name=>maldiNames.has(nameKey(name||'')));
}
export function isManuallyFeatured(o:Organism){
 return [o.scientificName,o.taxonomyName,...(o.aliases||[])].some(name=>priorityIndex.has(nameKey(name||'')));
}
function priorityScore(o:Organism){
 const keys=[o.scientificName,o.taxonomyName,...(o.aliases||[])].map(name=>nameKey(name||''));
 const positions=keys.map(k=>priorityIndex.get(k)).filter((v):v is number=>v!==undefined);
 const curated=positions.length ? 2000-Math.min(...positions) : 0;
 const maldi=isMaldiClaimMatched(o)?35:0;
 const clinical=Math.min(12,(o.clinicalSyndromes?.length||0)*4+(o.clinicalSyndromeIds?.length||0)*4);
 const info=Math.min(4,(o.virulenceFactors?.length||0)*2);
 return curated+maldi+clinical+info;
}
export type EucastTriage = {
 eucast_match:string;
 eucast_sheet:string;
 scope_grade:string;
 proposed_tier:string;
 rationale:string;
};
const audited=eucastTriage as Record<string,EucastTriage>;
export function getEucastTriage(o:Organism):EucastTriage|undefined{return audited[o.id]}
export function getEucastLabel(o:Organism):string{
 if(o.galaxy!=='bacteria')return 'Not assessed by bacterial EUCAST tables';
 const rec=getEucastTriage(o);
 if(!rec)return 'Not assessed';
 const labels:Record<string,string>={
  species_table:'Species/anaerobe section',
  explicit_extension:'Explicit named scope',
  named_in_group:'Named in clinical group',
  genus_section:'Genus-level section; agent caveats apply',
  order_candidate:'Provisional Enterobacterales assignment',
  guidance_no_breakpoints:'Guidance only — no EUCAST breakpoints',
  not_named:'Not named in v16.1',
  outside_scope:'Outside scope'
 };
 return labels[rec.eucast_match]||'Not assessed';
}
export const sanfordCoverage: Partial<Record<string,{clinicalNotes:string[];listedIn:string[]}>> = sanfordRoster;

export function isSanfordListed(o:Organism){
 return Object.hasOwn(sanfordCoverage,o.id);
}

export function splitFeaturedSpecies(species:readonly Organism[],limit=15){
 const sorted=[...species].sort((a,b)=>priorityScore(b)-priorityScore(a)||a.scientificName.localeCompare(b.scientificName));
 if(species[0]?.galaxy!=='bacteria'){
   return {featured:sorted.slice(0,limit),extended:sorted.slice(limit)};
 }
 return {featured:sorted.filter(isSanfordListed),extended:sorted.filter(o=>!isSanfordListed(o))};
}
export const maldiReferenceInfo={
 source:maldiData.source,
 url:maldiData.url,
 coveredNamedClaims:maldiData.names.length,
 scope:maldiData.scope,
};
