# Déroulé

## Étape 1

Le bouton est sur l'état **Join**
Kirby et Knight sont affichés

## Étape 2

Sélection du personnage Kirby
En attente d'un adversaire
Affichage d'un bouton "Ready"

## Étape 3

L'adversaire rejoint.
Compte à rebourd aléatoire entre 2 et 6 secondes
Affichage d'un point d'excalamation -> événement GO

## Étape 4

Si réaction sans événement GO, le joueur perd.
Quand l'évenement GO, détection premier joueur qui réagit.
Vainqueur

-> Retour Étape 1

# Contraintes

- Fonctionnement mobile
- Savoir son personnage
- État joueur (attente, vainqueur, perdant)
- Tests ?
- Limites (3ieme joueur, déconnexion)

# Bugs

- [x] Waiting for developers -> emit pour tout le monde ?
- [x] Gestion déconnexion
- [x] Plusieurs parties
- [x] Chrono démarre alors que les deux joueurs pas prèts

1h30
1h
1h
