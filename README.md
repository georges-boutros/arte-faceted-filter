# ARTE Faceted Filter (Power BI Custom Visual)

Filtre à facettes Power BI conçu par la **Plateforme Data ARTE** pour ARTE.

## Limitations connues
- **Field parameters multiples** : binder plus d'un *field parameter* sur le rôle Facets peut ne renvoyer aucune valeur — Power BI ne résout pas proprement la jonction multi-paramètres dans un dataView catégoriel. Workaround : binder soit des colonnes classiques, soit **un seul** field parameter mélangé avec des colonnes normales.
- **Mélanger field parameter + colonne classique** : peut être instable selon le modèle. Si une facette reste vide, swap-la avec une colonne directe pour confirmer que c'est bien le field parameter qui est en cause.
- **Tri** : le sens de tri est unique pour toutes les facettes (paramètre global `Facet Defaults → Default Sort Order`). Pas de tri par facette individuelle.

## MVP livré
- Plusieurs segments combinés dans un panneau unique (jusqu'à 8 facettes)
- Titre du visual pilotable par une **mesure DAX** via la role *Title (measure)* — permet de traduire le titre via `SWITCH(USERCULTURE(), …)` dans les rapports multilingues
- Cascade interne **optionnelle** (désactivée par défaut) : la sélection dans une facette restreint dynamiquement les options des autres. À n'activer que quand les facettes partagent un même fait/dimension (ex. Catégorie → Sous-catégorie → Marque dans une table Produit). Pour des dimensions indépendantes (Région, Date, Segment…) laisser **off** — chaque facette se comporte alors comme un slicer autonome qui filtre uniquement sa propre colonne.
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
