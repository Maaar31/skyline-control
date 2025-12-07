# ✈️ SkyLine Control

> Un jeu de contrôle aérien 2D immersif où vous gérez le trafic aérien pour éviter les collisions

[![Démo Live](https://img.shields.io/badge/Démo-Live-success?style=for-the-badge)](https://github.com/votre-username/skyline-control)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

![SkyLine Control Gameplay](screenshot.png)

## 🎮 À propos

SkyLine Control est un jeu de simulation de contrôle aérien où vous incarnez un contrôleur aérien gérant une carte de 3000x3000 pixels. Guidez les avions vers leurs destinations, gérez les urgences, et évitez les collisions catastrophiques!

### ✨ Fonctionnalités principales

- 🗺️ **Carte immense**: Explorez une carte 3000x3000 avec 8 zones de sortie
- 📹 **Système de caméra**: Pan (WASD/clic-glisser) et zoom (50%-200%)
- 🎯 **Gestion de trajectoires**: Système de waypoints par clic
- 🚨 **Urgences**: Carburant faible, pannes moteur avec commande d'atterrissage d'urgence
- 📊 **Minimap**: Vue d'ensemble temps réel de tous les avions
- 🎚️ **3 altitudes**: Évitez les collisions en gérant les niveaux de vol
- 📈 **Difficulté progressive**: Le jeu s'intensifie avec votre score
- 💾 **High score**: Votre meilleur score est sauvegardé
- 🔊 **Effets sonores**: Audio immersif pour toutes les actions
- ⏸️ **Pause**: Mettez le jeu en pause avec Espace

## 🚀 Démarrage rapide

### Installation

1. Clonez le repository:
```bash
git clone https://github.com/votre-username/skyline-control.git
cd skyline-control
```

2. Ouvrez `index.html` dans votre navigateur:
```bash
# Sur Windows
start index.html

# Sur macOS
open index.html

# Sur Linux
xdg-open index.html
```

C'est tout! Aucune dépendance, aucun build nécessaire. 🎉

### Démo en ligne

Jouez directement dans votre navigateur: [Démo Live](https://votre-username.github.io/skyline-control)

## 🎯 Comment jouer

### Contrôles de base

| Action | Contrôle |
|--------|----------|
| Sélectionner avion | Clic sur l'avion |
| Ajouter waypoint | Clic sur la carte |
| Monter altitude | Bouton ▲ ou sélection + clic |
| Descendre altitude | Bouton ▼ |
| Hold pattern | Bouton ⭕ |
| Atterrissage urgence | Bouton 🚨 (urgences uniquement) |
| Pause | Espace |

### Navigation caméra

| Action | Contrôle |
|--------|----------|
| Déplacer vue | Clic-glisser OU WASD |
| Zoom avant | Molette haut |
| Zoom arrière | Molette bas |
| Voir carte complète | Minimap (coin supérieur droit) |

### Objectifs

1. **Guidez les avions** vers les zones de sortie (N, NE, E, SE, S, SW, W, NW) ou la piste centrale
2. **Évitez les collisions** - les avions à la même altitude peuvent entrer en collision!
3. **Gérez les urgences** - utilisez l'atterrissage d'urgence pour sauver les avions en détresse
4. **Maximisez votre score** - +10 points par avion, +20 pour atterrissages d'urgence

### Altitudes

- 🟢 **FL0 (Vert)**: Altitude basse - requis pour atterrissage
- 🟡 **FL1 (Jaune)**: Altitude moyenne
- 🔴 **FL2 (Rouge)**: Altitude haute

**Important**: Les avions à la même altitude peuvent entrer en collision! Utilisez les changements d'altitude pour éviter les accidents.

## 🛠️ Technologies

- **HTML5 Canvas** - Rendu 2D haute performance
- **Vanilla JavaScript (ES6+)** - Aucun framework, code pur
- **CSS3** - Glassmorphism et animations modernes
- **LocalStorage API** - Sauvegarde du high score
- **Web Audio API** - Effets sonores immersifs

## 📁 Structure du projet

```
skyline-control/
├── index.html          # Structure HTML et UI
├── style.css           # Styles modernes avec glassmorphism
├── main.js             # Moteur de jeu et logique
├── sounds/             # Effets sonores
│   ├── select.mp3
│   ├── waypoint.mp3
│   ├── emergency.mp3
│   ├── collision.mp3
│   └── landing.mp3
├── README.md           # Ce fichier
├── LICENSE             # Licence MIT
└── .gitignore          # Fichiers ignorés par Git
```

## 🎨 Captures d'écran

### Vue d'ensemble avec minimap
![Gameplay avec minimap](screenshot-minimap.png)

### Zoom arrière (50%)
![Vue dézoomée](screenshot-zoom-out.png)

### Gestion d'urgence
![Atterrissage d'urgence](screenshot-emergency.png)

## 🏆 Fonctionnalités avancées

### Système de caméra
- Carte 9x plus grande que l'écran
- Zoom fluide de 50% à 200%
- Navigation WASD pour exploration rapide
- Minimap avec vue d'ensemble temps réel

### Gestion d'urgences
- **Carburant faible**: Priorité d'atterrissage requise
- **Panne moteur**: Vitesse réduite
- **Commande d'urgence**: Route automatique vers la piste
- **Bonus**: +20 points pour atterrissages d'urgence réussis

### Difficulté progressive
- Taux d'apparition augmente avec le score
- Plus d'urgences à haute difficulté
- Intervalle minimum de 2 secondes entre apparitions

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

- [ ] Mode multijoueur coopératif
- [ ] Modes de jeu alternatifs (Zen, Hardcore, Campagne)
- [ ] Achievements et statistiques détaillées
- [ ] Thèmes visuels (jour/nuit, rétro)
- [ ] Tutoriel interactif
- [ ] Leaderboard en ligne

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ par [Votre Nom]

## 🙏 Remerciements

- Inspiré par les jeux de simulation ATC classiques
- Polices: [Google Fonts](https://fonts.google.com/) (Orbitron, Rajdhani)
- Icônes: Emojis Unicode

---

⭐ Si vous aimez ce projet, n'oubliez pas de lui donner une étoile sur GitHub!

🎮 **Bon vol, contrôleur!**
