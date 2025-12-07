# ✈️ SkyLine Control

> Un jeu de contrôle aérien 2D immersif avec terrain procédural et graphismes améliorés

[![Démo Live](https://img.shields.io/badge/Démo-Live-success?style=for-the-badge)](https://github.com/votre-username/skyline-control)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Version](https://img.shields.io/badge/Version-1.3.0--lite-brightgreen?style=for-the-badge)](https://github.com/votre-username/skyline-control/releases)

![SkyLine Control Gameplay](screenshot.png)

## 🎮 À propos

**SkyLine Control** est un simulateur de contrôle aérien où vous gérez le trafic d'avions pour éviter les collisions. Guidez les avions vers leurs destinations en traçant des trajectoires, en gérant les altitudes et en répondant aux urgences. 

**Nouveau dans v1.3 Lite:** Terrain procédural vivant avec rivières, montagnes, forêts, villes et nuages animés!

## ✨ Fonctionnalités

### 🎨 Graphismes Procéduraux (v1.3 Lite)
- (🏞️ **Terrain généré procéduralement** - Chaque partie est unique)
- (🌊 **Rivières sinueuses** - Tracés naturels et organiques)
- (⛰️ **Montagnes** - Massifs avec plusieurs pics)
- (🌲 **Forêts** - Zones boisées groupées)
- (🏙️ **Villes** - Bâtiments avec lumières animées)
- (☁️ **Nuages animés** - Se déplacent en temps réel)
- (🌈 **Background amélioré** - Gradient radial avec texture)

### 🎮 Gameplay Core
- 🗺️ **Carte immense** - 3000x3000 pixels avec 8 zones de sortie
- 📹 **Système de caméra** - Pan (WASD/clic-glisser) et zoom (50%-200%)
- 🎯 **Gestion de trajectoires** - Système de waypoints par clic
- ✨ **Désélection d'avions** - Cliquez sur avion sélectionné ou Escape (v1.3)
- 🚨 **Urgences** - Carburant faible, pannes moteur
- 📊 **Minimap** - Vue d'ensemble temps réel
- 🎚️ **3 altitudes** - FL0 (vert), FL1 (jaune), FL2 (rouge)
- 📈 **Difficulté progressive** - S'intensifie avec le score

### 🎛️ Système de Paramètres (v1.2a)
- **HUD** - Personnalisation complète de l'interface
- **Audio** - Volumes indépendants (master, effets, ambiance)
- **Gameplay** - Difficulté, vitesse, nombre d'avions
- **Caméra** - Vitesse, sensibilité zoom, inversion

### 🏆 Leaderboard (v1.2a)
- **Top 10** - Meilleurs scores avec nom, niveau, avions gérés
- **Statistiques globales** - Total avions, urgences, temps de jeu
- **Sauvegarde locale** - Persistance via localStorage

### 🎓 Tutoriel Interactif (v1.1)
- **5 étapes guidées** - Apprendre les bases
- **Highlights visuels** - Éléments mis en évidence
- **Sauvegarde progression** - Ne s'affiche qu'une fois

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
| Désélectionner avion | Clic sur avion sélectionné OU Escape |
| Ajouter waypoint | Clic sur la carte (avion sélectionné) |
| Monter altitude | Bouton ▲ |
| Descendre altitude | Bouton ▼ |
| Hold pattern | Bouton ⭕ |
| Effacer route | Bouton 🗑️ |
| Atterrissage urgence | Bouton 🚨 (urgences uniquement) |
| Pause | Espace |
| Paramètres | Bouton ⚙️ |
| Leaderboard | Bouton 🏆 |

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
- **LocalStorage API** - Sauvegarde scores et paramètres
- **Web Audio API** - Effets sonores procéduraux

## 📁 Structure du projet

```
skyline-control/
├── index.html          # Structure HTML et UI
├── style.css           # Styles de base
├── v1.2-styles.css     # Styles settings/leaderboard
├── main.js             # Moteur de jeu principal
├── v1.2-features.js    # Settings et leaderboard
├── v1.3-graphics.js    # Génération terrain procédural
├── v1.3-audio.js       # AudioMixer avancé (non intégré)
├── README.md           # Ce fichier
├── LICENSE             # Licence MIT
└── .gitignore          # Fichiers ignorés par Git
```

## 🎨 Captures d'écran

### Terrain Procédural v1.3 Lite
![Terrain amélioré](screenshot-terrain.png)

### Vue d'ensemble avec minimap
![Gameplay avec minimap](screenshot-minimap.png)

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

### Génération Procédurale
- **Rivières**: 3-5 par carte, tracés sinueux
- **Montagnes**: 8-12 massifs, 24-84 pics
- **Forêts**: 12-20 zones, 60-300 arbres
- **Villes**: 5-10 zones, 20-100 bâtiments
- **Nuages**: 15-25 éléments animés

## 📝 Versions

### v1.3.0-lite (Actuelle)
- ✨ Terrain procédural avec rivières, montagnes, forêts, villes
- ✨ Nuages animés en temps réel
- ✨ Désélection d'avions (clic + Escape)
- 🐛 Correction bugs critiques (drawExitZones, classe dupliquée)
- 📚 Documentation complète

### v1.2a
- ⚙️ Système de paramètres complet (4 onglets)
- 🏆 Leaderboard avec top 10 et stats globales
- 📊 Statistiques de session
- 💾 Sauvegarde localStorage

### v1.1
- 🎓 Tutoriel interactif (5 étapes)
- 🔊 Toggle son avec bouton
- 📖 Documentation améliorée

### v1.0
- 🎮 Jeu de base fonctionnel
- 🗺️ Carte 3000x3000
- 🚨 Système d'urgences
- 💾 High score

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

### v1.3 Full (Prochain)
- [ ] Intégration audio complète (AudioMixer)
- [ ] Ambient radar loop
- [ ] Sons ADSR avec harmoniques

### v1.4 (Futur)
- [ ] Mode jour/nuit
- [ ] Météo dynamique (pluie, brouillard)
- [ ] Saisons
- [ ] Achievements

### v2.0 (Vision)
- [ ] Mode multijoueur coopératif
- [ ] Campagne avec missions
- [ ] Leaderboard en ligne
- [ ] Replay système

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ par BAKENO

## 🙏 Remerciements

- Inspiré par les jeux de simulation ATC classiques
- Polices: [Google Fonts](https://fonts.google.com/) (Orbitron, Rajdhani)
- Icônes: Emojis Unicode
- Communauté de testeurs pour les retours précieux

---

⭐ Si vous aimez ce projet, n'oubliez pas de lui donner une étoile sur GitHub!

🎮 **Bon vol, contrôleur!**
