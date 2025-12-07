// ========================================
// V1.3 INTEGRATION PATCH
// Add this code to main.js to integrate v1.3 features
// ========================================

/*
INTEGRATION INSTRUCTIONS:

1. Replace the old playSound function (around line 55-82) with calls to audioMixer:
   - playSound('select') → audioMixer.playSelect()
   - playSound('waypoint') → audioMixer.playWaypoint()
   - playSound('emergency') → audioMixer.playEmergency()
   - playSound('collision') → audioMixer.playCollision()
   - playSound('landing') → audioMixer.playLanding()

2. Add new sounds:
   - When airplane spawns → audioMixer.playSpawn()
   - When altitude changes → audioMixer.playAltitudeChange()
   - On UI hover → audioMixer.playUIHover()
   - On UI click → audioMixer.playUIClick()

3. Initialize MapGraphics after canvas setup (around line 650):
   const mapGraphics = new MapGraphics(ctx, MAP_SIZE);
   window.mapGraphics = mapGraphics;

4. In drawBackground() function (around line 680), replace with:
   if (mapGraphics) {
       mapGraphics.drawAll(performance.now());
   } else {
       // Fallback to old background
       ctx.fillStyle = '#0d1117';
       ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
   }

5. In Airplane constructor, add spawn sound:
   audioMixer.playSpawn();

6. In altitude change buttons, add sound:
   audioMixer.playAltitudeChange();

7. Add UI sounds to buttons:
   document.querySelectorAll('button').forEach(btn => {
       btn.addEventListener('mouseenter', () => audioMixer.playUIHover());
       btn.addEventListener('click', () => audioMixer.playUIClick());
   });
*/

// COMPLETE INTEGRATION CODE BELOW
// Copy this into main.js at appropriate locations

// ========================================
// REPLACE playSound function (DELETE OLD ONE)
// ========================================
function playSound(soundName) {
    if (!gameState.soundEnabled || !audioMixer) return;

    switch (soundName) {
        case 'select':
            audioMixer.playSelect();
            break;
        case 'waypoint':
            audioMixer.playWaypoint();
            break;
        case 'emergency':
            audioMixer.playEmergency();
            break;
        case 'collision':
            audioMixer.playCollision();
            break;
        case 'landing':
            audioMixer.playLanding();
            break;
    }
}

// ========================================
// ADD after canvas setup (around line 650)
// ========================================
const mapGraphics = new MapGraphics(ctx, MAP_SIZE);
window.mapGraphics = mapGraphics;

// ========================================
// REPLACE drawBackground function
// ========================================
function drawBackground() {
    if (mapGraphics) {
        mapGraphics.drawAll(performance.now());
    } else {
        // Fallback
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
    }

    // Draw grid (keep existing grid code)
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= MAP_SIZE; x += 500) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MAP_SIZE);
        ctx.stroke();
    }

    for (let y = 0; y <= MAP_SIZE; y += 500) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(MAP_SIZE, y);
        ctx.stroke();
    }

    // Finer grid
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.05)';
    for (let x = 0; x <= MAP_SIZE; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MAP_SIZE);
        ctx.stroke();
    }

    for (let y = 0; y <= MAP_SIZE; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(MAP_SIZE, y);
        ctx.stroke();
    }
}

// ========================================
// ADD to Airplane class constructor (after this.waypoints = [])
// ========================================
// Play spawn sound
if (audioMixer && gameState.soundEnabled) {
    audioMixer.playSpawn();
}

// ========================================
// ADD to altitude change button handlers
// ========================================
document.getElementById('btn-increase-alt').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.targetAltitude = Math.min(
            gameState.selectedAirplane.targetAltitude + 1000,
            10000
        );
        audioMixer.playAltitudeChange(); // ADD THIS
        updateUI();
    }
});

document.getElementById('btn-decrease-alt').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.targetAltitude = Math.max(
            gameState.selectedAirplane.targetAltitude - 1000,
            1000
        );
        audioMixer.playAltitudeChange(); // ADD THIS
        updateUI();
    }
});

// ========================================
// ADD at end of file (before initGame call)
// ========================================
// Add UI sounds to all buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (audioMixer && gameState.soundEnabled) {
                audioMixer.playUIHover();
            }
        });
    });
});
