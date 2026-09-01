# StockFlow Frontend

Interface web de StockFlow, une application de gestion de stock destinée aux PME.

Ce dépôt contient le frontend Angular. Le backend Spring Boot est maintenu dans un dépôt
distinct et ne doit pas être modifié depuis ce projet.

## Prérequis

- Node.js `24.15.0` recommandé (voir `.nvmrc`)
- npm `11`

Angular 22 requiert actuellement Node.js `^22.22.3`, `^24.15.0` ou `>=26.0.0`.

## Installation

```bash
npm ci
```

## Commandes

```bash
npm start       # serveur de développement sur http://localhost:4200
npm test        # tests unitaires
npm run build   # build de production dans dist/
```

## Socle technique

- Angular 22
- TypeScript en mode strict
- composants standalone
- Angular Router
- Tailwind CSS 4 avec PostCSS
- tests unitaires avec Vitest

L'authentification et les fonctionnalités métier seront ajoutées dans leurs Issues dédiées.
Aucun endpoint backend ni DTO n'est supposé dans cette initialisation.

## Architecture cible

Le code applicatif évoluera progressivement sous `src/app` :

```text
src/app/
├── core/       # authentification, guards, interceptors et services globaux
├── features/   # fonctionnalités métier chargées par route
└── shared/     # composants, modèles et utilitaires réutilisables
```

Seuls les dossiers nécessaires à l'Issue en cours doivent être créés.
