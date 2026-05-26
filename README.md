# ARTE Faceted Filter (Power BI Custom Visual)

Filtre à facettes Power BI conçu par la **Plateforme Data ARTE** pour ARTE.

## MVP livré
- Plusieurs segments combinés dans un panneau unique (jusqu'à 8 facettes)
- Cascade interne : la sélection dans une facette restreint dynamiquement les options des autres
- Mise en page horizontale ou verticale (auto ou forcée)
- Types de sélecteurs au choix par facette : liste déroulante, vignettes (chips), bascules (toggles), liste, boutons radio, cases à cocher
- Modes single / multi
- Recherche dans chaque facette
- Application réelle des filtres Power BI via `applyJsonFilter` (filtre `In` par colonne)
- Charte graphique ARTE — thème clair / sombre / personnalisé partagé avec `arte-calendar-date-slicer`

## Lancer localement
```bash
npm install
npm run start
```

## Générer un package
```bash
npm run package
```

Le package est généré dans `dist/`.

## Note environnement
`powerbi-visuals-tools` peut échouer en fin d'exécution avec Node `v24` (bug connu Webpack logger) même si le package `.pbiviz` est bien créé. Utiliser Node 18/20 est recommandé pour un flux stable.
