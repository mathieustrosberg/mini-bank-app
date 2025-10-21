# Projet 1 : mini-bank-app

## Lancer le projet
```bash
npm start
```

## Fonctionnalités
- Créer des clients et comptes
- Dépôt, retrait, transfert d'argent
- Consultation des soldes et historiques
- Menu interactif (options 0-12)

## Structures de données
- **Client** : `{ id, firstName, lastName }`
- **Compte** : `{ id, clientId, balance }`
- **Transaction** : `{ id, type, amount, date, accountId }`
