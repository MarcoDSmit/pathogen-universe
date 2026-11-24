#!/usr/bin/env python3
"""Verify catalog reachability and the Sanford bacterial display roster."""
import json
from collections import defaultdict, Counter
from pathlib import Path
base=Path(__file__).resolve().parents[1]
orgs=json.loads((base/'src/data/organisms.json').read_text(encoding='utf-8'))
triage=json.loads((base/'src/data/eucast_triage.json').read_text(encoding='utf-8'))
maldi=json.loads((base/'src/data/maldi_public_claim_subset.json').read_text(encoding='utf-8'))
release=json.loads((base/'src/data/release.json').read_text(encoding='utf-8'))
roster=json.loads((base/'src/data/sanford_roster.json').read_text(encoding='utf-8'))
guide=json.loads((base/'src/data/sanford.json').read_text(encoding='utf-8'))
topics={entry['id'] for entry in guide['entries']}
bacteria={o['id'] for o in orgs if o['galaxy']=='bacteria' and not o.get('canonicalOrganismId')}
assert set(roster)<=bacteria
for coverage in roster.values():
    references=coverage['clinicalNotes']+coverage['listedIn']
    assert references and set(references)<=topics
assert len(orgs)==release['total_entries'], f'Unexpected organism count {len(orgs)}'
ids=[o['id'] for o in orgs]
assert len(set(ids))==len(orgs),'Duplicate IDs detected'
assert set(ids)-set(triage)==set(release.get('sanford_additions', [])), 'Triage coverage mismatch'
assert set(triage)<=set(ids), 'Unknown triage records'
assert len(maldi['names'])==len(set(maldi['names'])),'Duplicate MALDI claim names'
for mode in ('clinical','taxonomic'):
    groups=defaultdict(list)
    for o in orgs:
        if o.get('canonicalOrganismId'):
            continue
        if mode=='clinical': group=o.get('clinicalConstellation') or o.get('taxonomyGenus') or 'Other'
        elif o['galaxy']=='viruses': group=(o.get('ictvSpecies') or '').split(' ')[0] or 'Unresolved ICTV species'
        else: group=o.get('taxonomyGenus') or (o.get('taxonomyName') or '').split(' ')[0] or 'Unresolved'
        groups[(o['galaxy'],group)].append(o)
    seen=set(); main=0; archive=0; hidden_bacterial_genera=0
    counts=Counter()
    for (galaxy,group),species in groups.items():
        if galaxy=='bacteria':
            featured=[o for o in species if o['id'] in roster]
            if not featured:
                hidden_bacterial_genera+=1
                assert len(species)>0
        else:
            featured=species[:15]
        picked={o['id'] for o in featured}
        assert len(picked)==len(featured)
        assert len(picked)<=15 or galaxy=='bacteria'
        extended=[o for o in species if o['id'] not in picked]
        assert len(featured)+len(extended)==len(species)
        for o in species:
            assert o['id'] not in seen, f'{mode}: record appears twice: {o["id"]}'
            seen.add(o['id'])
        main+=len(featured);archive+=len(extended)
        counts[galaxy]+=len(featured)
    assert counts['bacteria']==len(roster)
    assert seen=={o['id'] for o in orgs if not o.get('canonicalOrganismId')}, f'{mode}: unreachable records'
    print(f'{mode}: {len(groups)} constellations, {main} featured species, '
          f'{archive} in species archives, {hidden_bacterial_genera} bacteria-only genera '
          f'in the sector archive, all {len(seen)} canonical records reachable')
    print('  featured by galaxy:',dict(counts))
print(f'{len(roster)} Sanford-listed bacteria and {len(bacteria-roster.keys())} searchable reserve bacteria.')
