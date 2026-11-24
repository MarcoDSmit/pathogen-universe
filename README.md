# Pathogen Universe

An illustrated, source-linked microbiology atlas organised into galaxies and clinical constellations.

Live site: https://marcodsmit.github.io/pathogen-universe/

## Development

Use Node.js 22 and Python 3.12 or later.

```sh
npm ci
npm run dev
```

## Validation and deployment

```sh
npm run validate-data
npm run validate-curation
npm run build
```

Pushing to `main` runs these checks and deploys `dist` to GitHub Pages. The Vite base path is `/pathogen-universe/`.

## Evidence and review

This repository contains the application and its current curated data. Raw Sanford captures, downloaded full texts, and the evidence review workspace remain outside this public repository. Source identifiers and references remain attached to the published data; local XML paths are represented by filenames.

Clinical content remains subject to human appraisal and approval. Deployment does not approve pending claims. The atlas is an educational research project and does not replace clinical judgement or current prescribing guidance.
