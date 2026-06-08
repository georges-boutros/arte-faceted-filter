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

## Pourquoi le dropdown ne déborde pas sur les autres visuals
Contrairement au slicer natif Power BI, un **custom visual ne peut jamais peindre en dehors de sa frame**. C'est une contrainte de la plateforme : Power BI sandbox chaque custom visual dans une iframe dédiée, et l'iframe clip son contenu aux dimensions allouées au visual.

Ce que le visual fait pour compenser :

- **Flip up / down intelligent** : si la place sous le bouton est insuffisante, le panneau s'ouvre vers le haut.
- **Fallback plein visual** : quand ni au-dessus ni en dessous il n'y a la place, le panneau recouvre **toute la surface du visual** pendant qu'il est ouvert (cliquer ailleurs le ferme et restaure les autres facettes).
- **Recommandation big data** : pour les colonnes à forte cardinalité (programmes, titres, talents), utiliser le sélecteur **Typeahead** plutôt que Dropdown — il n'a besoin que d'un panneau de quelques lignes et ne dépend pas de l'espace vertical.

Ordre de grandeur :

| Cardinalité | Sélecteur recommandé |
|---|---|
| 2–5 valeurs | Toggle / Radio |
| 5–20 valeurs | Chips / Checkbox |
| 20–200 valeurs | Dropdown |
| 200+ valeurs | **Typeahead** |
