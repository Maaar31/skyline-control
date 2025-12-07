// ========================================
// SKYLINE CONTROL - Air Traffic Control Game
// ========================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Minimap Setup
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');
minimap.width = 200;
minimap.height = 200;

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// GAME STATE
// ========================================
const MAP_SIZE = 3000; // Larger map size

const gameState = {
    running: false,
    paused: false,
    score: 0,
    highScore: 0,
    difficulty: 1,
    airplanes: [],
    selectedAirplane: null,
    spawnTimer: 0,
    spawnInterval: 5000, // milliseconds
    lastTime: 0,
    exitZones: [],
    landingStrip: null,
    nextFlightNumber: 1,
    soundEnabled: true
};

// Camera State
const camera = {
    x: 0,
    y: 0,
    zoom: 1.0,
    minZoom: 0.5,
    maxZoom: 2.0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartCamX: 0,
    dragStartCamY: 0
};

// Keyboard state
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// ========================================
// CONSTANTS
// ========================================
const ALTITUDE_COLORS = {
    0: '#4CAF50', // Green - Low
    1: '#FFC107', // Yellow - Medium
    2: '#F44336'  // Red - High
};

const SPEED_VALUES = {
    slow: 0.8,
    normal: 1.2,
    fast: 1.8
};

const AIRPLANE_RADIUS = 15;
const COLLISION_DISTANCE = 30;
const WAYPOINT_RADIUS = 5;
const HOLD_RADIUS = 60;

// Radio messages
const RADIO_MESSAGES = {
    spawn: [
        "Vol {id}, vous êtes autorisé à entrer dans l'espace aérien",
        "Vol {id}, contact radar établi, bienvenue",
        "Vol {id}, nous vous avons sur nos écrans",
        "{id}, ici la tour, nous vous recevons 5/5"
    ],
    landing: [
        "Vol {id}, atterrissage réussi, bienvenue au sol",
        "{id}, piste dégagée, bon vol",
        "Vol {id} a atterri en toute sécurité"
    ],
    exit: [
        "Vol {id}, vous quittez notre espace aérien, bon vol",
        "{id}, transfert radar effectué, bonne continuation",
        "Vol {id} a quitté notre zone de contrôle"
    ],
    lowFuel: [
        "⚠️ Vol {id} signale un niveau de carburant critique!",
        "⚠️ {id} demande une priorité d'atterrissage - carburant faible",
        "⚠️ Urgence carburant pour le vol {id}!"
    ],
    engineFailure: [
        "⚠️ Vol {id} signale une panne moteur!",
        "⚠️ {id} en difficulté technique, vitesse réduite",
        "⚠️ Problème moteur sur le vol {id}!"
    ]
};

// ========================================
// SOUND SYSTEM
// ========================================
const sounds = {
    select: null,
    waypoint: null,
    emergency: null,
    collision: null,
    landing: null
};

// Simple beep sound generator using Web Audio API
function createBeep(frequency, duration, type = 'sine') {
    if (!gameState.soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(soundName) {
    if (!gameState.soundEnabled) return;

    switch (soundName) {
        case 'select':
            createBeep(800, 0.1);
            break;
        case 'waypoint':
            createBeep(600, 0.05);
            break;
        case 'emergency':
            createBeep(400, 0.3, 'square');
            setTimeout(() => createBeep(400, 0.3, 'square'), 400);
            break;
        case 'collision':
            createBeep(200, 0.5, 'sawtooth');
            break;
        case 'landing':
            createBeep(1000, 0.1);
            setTimeout(() => createBeep(1200, 0.15), 150);
            break;
    }
}

// ========================================
// HIGH SCORE MANAGEMENT
// ========================================
function loadHighScore() {
    try {
        const saved = localStorage.getItem('skylineControlHighScore');
        if (saved) {
            gameState.highScore = parseInt(saved, 10);
        }
    } catch (e) {
        console.log('LocalStorage not available');
    }
}

function saveHighScore() {
    try {
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('skylineControlHighScore', gameState.highScore.toString());
            return true; // New high score!
        }
    } catch (e) {
        console.log('LocalStorage not available');
    }
    return false;
}

// ========================================
// AIRPLANE CLASS
// ========================================
class Airplane {
    constructor(x, y, altitude, destination) {
        this.id = `AF${String(gameState.nextFlightNumber++).padStart(3, '0')}`;
        this.x = x;
        this.y = y;
        this.altitude = altitude;
        this.destination = destination;
        this.waypoints = []; // Player-defined path
        this.currentWaypointIndex = 0;

        // Speed
        const speeds = ['slow', 'normal', 'fast'];
        this.speedType = speeds[Math.floor(Math.random() * speeds.length)];
        this.speed = SPEED_VALUES[this.speedType];

        // Emergency state
        this.emergency = null; // null, 'lowFuel', 'engineFailure'

        // Hold pattern
        this.isHolding = false;
        this.holdCenter = null;
        this.holdAngle = 0;

        // Visual
        this.angle = 0;
        this.trail = [];

        // Set initial waypoint to destination
        this.waypoints.push(destination);
    }

    update(deltaTime) {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) {
            this.trail.shift();
        }

        // Handle hold pattern
        if (this.isHolding && this.holdCenter) {
            this.holdAngle += (this.speed * deltaTime) / 1000;
            this.x = this.holdCenter.x + Math.cos(this.holdAngle) * HOLD_RADIUS;
            this.y = this.holdCenter.y + Math.sin(this.holdAngle) * HOLD_RADIUS;

            // Update angle for visual
            this.angle = this.holdAngle + Math.PI / 2;
            return;
        }

        // Get current target
        let target = null;
        if (this.waypoints.length > 0 && this.currentWaypointIndex < this.waypoints.length) {
            target = this.waypoints[this.currentWaypointIndex];
        }

        if (!target) {
            // No waypoints, head to destination
            target = this.destination;
        }

        // Move towards target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            const moveSpeed = this.speed * (deltaTime / 16.67); // Normalize to 60fps
            this.x += (dx / distance) * moveSpeed;
            this.y += (dy / distance) * moveSpeed;

            // Update angle for visual
            this.angle = Math.atan2(dy, dx);
        } else {
            // Reached waypoint
            this.currentWaypointIndex++;

            // Check if reached final destination
            if (this.currentWaypointIndex >= this.waypoints.length) {
                // Check if at destination
                const destDist = Math.sqrt(
                    (this.x - this.destination.x) ** 2 +
                    (this.y - this.destination.y) ** 2
                );

                if (destDist < 20) {
                    return 'reached'; // Signal to remove airplane
                }
            }
        }

        return null;
    }

    draw() {
        // Draw trail
        ctx.strokeStyle = ALTITUDE_COLORS[this.altitude] + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();

        // Draw waypoints
        ctx.fillStyle = ALTITUDE_COLORS[this.altitude] + '60';
        ctx.strokeStyle = ALTITUDE_COLORS[this.altitude];
        ctx.lineWidth = 1;

        for (let i = this.currentWaypointIndex; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, WAYPOINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw line to next waypoint
            if (i < this.waypoints.length - 1) {
                ctx.beginPath();
                ctx.moveTo(wp.x, wp.y);
                ctx.lineTo(this.waypoints[i + 1].x, this.waypoints[i + 1].y);
                ctx.strokeStyle = ALTITUDE_COLORS[this.altitude] + '40';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw line from airplane to next waypoint
        if (this.waypoints.length > 0 && this.currentWaypointIndex < this.waypoints.length) {
            const nextWp = this.waypoints[this.currentWaypointIndex];
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(nextWp.x, nextWp.y);
            ctx.strokeStyle = ALTITUDE_COLORS[this.altitude] + '60';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw hold pattern circle
        if (this.isHolding && this.holdCenter) {
            ctx.beginPath();
            ctx.arc(this.holdCenter.x, this.holdCenter.y, HOLD_RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = ALTITUDE_COLORS[this.altitude] + '60';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw airplane
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Airplane body
        ctx.fillStyle = ALTITUDE_COLORS[this.altitude];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(AIRPLANE_RADIUS, 0);
        ctx.lineTo(-AIRPLANE_RADIUS / 2, -AIRPLANE_RADIUS / 2);
        ctx.lineTo(-AIRPLANE_RADIUS / 4, 0);
        ctx.lineTo(-AIRPLANE_RADIUS / 2, AIRPLANE_RADIUS / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Emergency indicator
        if (this.emergency) {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, AIRPLANE_RADIUS + 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(this.id, this.x, this.y - 25);

        // Draw altitude
        ctx.fillStyle = ALTITUDE_COLORS[this.altitude];
        ctx.font = 'bold 10px Orbitron';
        ctx.fillText(`FL${this.altitude}`, this.x, this.y - 12);

        // Selection indicator
        if (gameState.selectedAirplane === this) {
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, AIRPLANE_RADIUS + 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    addWaypoint(x, y) {
        this.waypoints.push({ x, y });
        this.isHolding = false;
    }

    clearWaypoints() {
        this.waypoints = [this.destination];
        this.currentWaypointIndex = 0;
        this.isHolding = false;
    }

    changeAltitude(delta) {
        const newAltitude = this.altitude + delta;
        if (newAltitude >= 0 && newAltitude <= 2) {
            this.altitude = newAltitude;
            addRadioMessage(`Vol ${this.id}, altitude changée à FL${this.altitude}`);
        }
    }

    toggleHold() {
        this.isHolding = !this.isHolding;
        if (this.isHolding) {
            this.holdCenter = { x: this.x, y: this.y };
            this.holdAngle = this.angle - Math.PI / 2;
            addRadioMessage(`Vol ${this.id}, maintenez votre position actuelle`);
        } else {
            this.holdCenter = null;
            addRadioMessage(`Vol ${this.id}, reprenez votre route`);
        }
    }

    triggerEmergency() {
        if (this.emergency) return; // Already in emergency

        const emergencies = ['lowFuel', 'engineFailure'];
        this.emergency = emergencies[Math.floor(Math.random() * emergencies.length)];

        if (this.emergency === 'engineFailure') {
            this.speed *= 0.6; // Reduce speed
        }

        const messages = RADIO_MESSAGES[this.emergency];
        addRadioMessage(
            messages[Math.floor(Math.random() * messages.length)].replace('{id}', this.id),
            true
        );

        playSound('emergency');
    }

    emergencyLanding() {
        if (!this.emergency) return;

        // Clear all waypoints and create direct path to runway
        this.waypoints = [{
            x: gameState.landingStrip.x,
            y: gameState.landingStrip.y
        }];
        this.currentWaypointIndex = 0;
        this.isHolding = false;

        // Set altitude to FL0 for landing
        this.altitude = 0;

        addRadioMessage(`🚨 Vol ${this.id}, atterrissage d'urgence autorisé, route directe vers la piste!`, true);
    }
}

// ========================================
// GAME INITIALIZATION
// ========================================
function initGame() {
    gameState.airplanes = [];
    gameState.selectedAirplane = null;
    gameState.score = 0;
    gameState.difficulty = 1;
    gameState.spawnTimer = 0;
    gameState.nextFlightNumber = 1;

    // Create exit zones (8 zones around larger map)
    gameState.exitZones = [
        { x: MAP_SIZE * 0.5, y: 100, label: 'N' },
        { x: MAP_SIZE - 100, y: MAP_SIZE * 0.25, label: 'NE' },
        { x: MAP_SIZE - 100, y: MAP_SIZE * 0.5, label: 'E' },
        { x: MAP_SIZE - 100, y: MAP_SIZE * 0.75, label: 'SE' },
        { x: MAP_SIZE * 0.5, y: MAP_SIZE - 100, label: 'S' },
        { x: 100, y: MAP_SIZE * 0.75, label: 'SW' },
        { x: 100, y: MAP_SIZE * 0.5, label: 'W' },
        { x: 100, y: MAP_SIZE * 0.25, label: 'NW' }
    ];

    // Create landing strip (center of map)
    gameState.landingStrip = {
        x: MAP_SIZE / 2,
        y: MAP_SIZE / 2,
        width: 100,
        height: 20
    };

    // Center camera on map
    camera.x = MAP_SIZE / 2 - canvas.width / 2;
    camera.y = MAP_SIZE / 2 - canvas.height / 2;
    camera.zoom = 1.0;

    // Clear radio
    document.getElementById('radio-messages').innerHTML = '';
    addRadioMessage('Tour de contrôle opérationnelle. Bon vol!');

    updateUI();
}

// ========================================
// SPAWNING
// ========================================
function spawnAirplane() {
    // Random spawn edge of larger map
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
        case 0: // Top
            x = Math.random() * MAP_SIZE;
            y = 0;
            break;
        case 1: // Right
            x = MAP_SIZE;
            y = Math.random() * MAP_SIZE;
            break;
        case 2: // Bottom
            x = Math.random() * MAP_SIZE;
            y = MAP_SIZE;
            break;
        case 3: // Left
            x = 0;
            y = Math.random() * MAP_SIZE;
            break;
    }

    // Random altitude
    const altitude = Math.floor(Math.random() * 3);

    // Random destination (exit zone or landing strip)
    let destination;
    if (Math.random() < 0.3) {
        // Landing strip
        destination = {
            x: gameState.landingStrip.x,
            y: gameState.landingStrip.y
        };
    } else {
        // Exit zone
        const exitZone = gameState.exitZones[Math.floor(Math.random() * gameState.exitZones.length)];
        destination = { x: exitZone.x, y: exitZone.y };
    }

    const airplane = new Airplane(x, y, altitude, destination);
    gameState.airplanes.push(airplane);

    // Radio message
    const messages = RADIO_MESSAGES.spawn;
    addRadioMessage(messages[Math.floor(Math.random() * messages.length)].replace('{id}', airplane.id));

    // Random emergency chance (15% for larger map)
    if (Math.random() < 0.15) {
        setTimeout(() => {
            if (gameState.airplanes.includes(airplane)) {
                airplane.triggerEmergency();
            }
        }, 3000 + Math.random() * 5000);
    }
}

// ========================================
// COLLISION DETECTION
// ========================================
function checkCollisions() {
    for (let i = 0; i < gameState.airplanes.length; i++) {
        for (let j = i + 1; j < gameState.airplanes.length; j++) {
            const a1 = gameState.airplanes[i];
            const a2 = gameState.airplanes[j];

            // Only collide if at same altitude
            if (a1.altitude === a2.altitude) {
                const dx = a1.x - a2.x;
                const dy = a1.y - a2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < COLLISION_DISTANCE) {
                    gameOver(`Collision entre ${a1.id} et ${a2.id}!`);
                    return true;
                }
            }
        }
    }
    return false;
}

// ========================================
// CAMERA FUNCTIONS
// ========================================
function updateCamera(deltaTime) {
    const cameraSpeed = 5;

    // WASD movement
    if (keys.w) camera.y -= cameraSpeed;
    if (keys.s) camera.y += cameraSpeed;
    if (keys.a) camera.x -= cameraSpeed;
    if (keys.d) camera.x += cameraSpeed;

    // Constrain camera to map bounds
    const maxX = MAP_SIZE - canvas.width / camera.zoom;
    const maxY = MAP_SIZE - canvas.height / camera.zoom;

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}

function screenToWorld(screenX, screenY) {
    return {
        x: (screenX / camera.zoom) + camera.x,
        y: (screenY / camera.zoom) + camera.y
    };
}

function worldToScreen(worldX, worldY) {
    return {
        x: (worldX - camera.x) * camera.zoom,
        y: (worldY - camera.y) * camera.zoom
    };
}

function applyCamera() {
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
}

function resetCamera() {
    ctx.restore();
}

// ========================================
// GAME LOOP
// ========================================
function gameLoop(currentTime) {
    if (!gameState.running) return;

    const deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;

    // Update camera
    updateCamera(deltaTime);

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    applyCamera();

    // Draw grid
    drawGrid();

    // Draw exit zones
    drawExitZones();

    // Draw landing strip
    drawLandingStrip();

    // Update and draw airplanes
    for (let i = gameState.airplanes.length - 1; i >= 0; i--) {
        const airplane = gameState.airplanes[i];
        const result = airplane.update(deltaTime);

        if (result === 'reached') {
            // Airplane reached destination
            gameState.airplanes.splice(i, 1);

            // Bonus points for emergency landing
            if (airplane.emergency) {
                gameState.score += 20;
                addRadioMessage(`✅ Atterrissage d'urgence réussi pour ${airplane.id}! +20 points`);
            } else {
                gameState.score += 10;
            }

            // Check if landing or exit
            const distToLanding = Math.sqrt(
                (airplane.x - gameState.landingStrip.x) ** 2 +
                (airplane.y - gameState.landingStrip.y) ** 2
            );

            if (distToLanding < 50) {
                const messages = RADIO_MESSAGES.landing;
                addRadioMessage(messages[Math.floor(Math.random() * messages.length)].replace('{id}', airplane.id));
            } else {
                const messages = RADIO_MESSAGES.exit;
                addRadioMessage(messages[Math.floor(Math.random() * messages.length)].replace('{id}', airplane.id));
            }

            // Deselect if selected
            if (gameState.selectedAirplane === airplane) {
                gameState.selectedAirplane = null;
            }

            updateUI();
        } else {
            airplane.draw();
        }
    }

    // Reset camera transform
    resetCamera();

    // Check collisions
    if (checkCollisions()) {
        return;
    }

    // Spawn new airplanes
    gameState.spawnTimer += deltaTime;
    if (gameState.spawnTimer >= gameState.spawnInterval) {
        spawnAirplane();
        gameState.spawnTimer = 0;

        // Increase difficulty
        if (gameState.score > 0 && gameState.score % 50 === 0) {
            gameState.difficulty++;
            gameState.spawnInterval = Math.max(2000, gameState.spawnInterval - 200);
            addRadioMessage(`Niveau de difficulté augmenté: ${gameState.difficulty}`);
        }
    }

    // Draw minimap
    drawMinimap();

    updateUI();
    requestAnimationFrame(gameLoop);
}

// ========================================
// DRAWING HELPERS
// ========================================
function drawGrid() {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.1)';
    ctx.lineWidth = 1 / camera.zoom;

    const gridSize = 100;

    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const endX = camera.x + canvas.width / camera.zoom;
    const startY = Math.floor(camera.y / gridSize) * gridSize;
    const endY = camera.y + canvas.height / camera.zoom;

    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, camera.y);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(camera.x, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    // Draw map bounds
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.lineWidth = 3 / camera.zoom;
    ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);
}

function drawExitZones() {
    gameState.exitZones.forEach(zone => {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(zone.x, zone.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64b5f6';
        ctx.font = 'bold 16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(zone.label, zone.x, zone.y + 5);
    });
}

function drawLandingStrip() {
    const strip = gameState.landingStrip;

    ctx.save();
    ctx.translate(strip.x, strip.y);
    ctx.rotate(Math.PI / 4);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    ctx.fillRect(-strip.width / 2, -strip.height / 2, strip.width, strip.height);
    ctx.strokeRect(-strip.width / 2, -strip.height / 2, strip.width, strip.height);

    // Stripes
    ctx.fillStyle = '#ffff00';
    for (let i = -strip.width / 2; i < strip.width / 2; i += 15) {
        ctx.fillRect(i, -strip.height / 2, 7, strip.height);
    }

    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('RUNWAY', strip.x, strip.y - 60);
}

// ========================================
// MINIMAP
// ========================================
function drawMinimap() {
    // Clear minimap
    minimapCtx.fillStyle = '#0d1117';
    minimapCtx.fillRect(0, 0, minimap.width, minimap.height);

    const scale = minimap.width / MAP_SIZE;

    // Draw map bounds
    minimapCtx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(0, 0, minimap.width, minimap.height);

    // Draw exit zones
    minimapCtx.fillStyle = 'rgba(100, 200, 255, 0.4)';
    gameState.exitZones.forEach(zone => {
        minimapCtx.beginPath();
        minimapCtx.arc(zone.x * scale, zone.y * scale, 3, 0, Math.PI * 2);
        minimapCtx.fill();
    });

    // Draw landing strip
    minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    minimapCtx.fillRect(
        (gameState.landingStrip.x - 50) * scale,
        (gameState.landingStrip.y - 10) * scale,
        100 * scale,
        20 * scale
    );

    // Draw airplanes
    gameState.airplanes.forEach(airplane => {
        minimapCtx.fillStyle = ALTITUDE_COLORS[airplane.altitude];
        minimapCtx.beginPath();
        minimapCtx.arc(airplane.x * scale, airplane.y * scale, 2, 0, Math.PI * 2);
        minimapCtx.fill();

        // Highlight selected
        if (airplane === gameState.selectedAirplane) {
            minimapCtx.strokeStyle = '#00ff88';
            minimapCtx.lineWidth = 2;
            minimapCtx.beginPath();
            minimapCtx.arc(airplane.x * scale, airplane.y * scale, 4, 0, Math.PI * 2);
            minimapCtx.stroke();
        }
    });

    // Draw camera viewport
    minimapCtx.strokeStyle = '#00ff88';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(
        camera.x * scale,
        camera.y * scale,
        (canvas.width / camera.zoom) * scale,
        (canvas.height / camera.zoom) * scale
    );
}

// ========================================
// UI UPDATES
// ========================================
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('difficulty').textContent = gameState.difficulty;
    document.getElementById('zoom-level').textContent = `${Math.round(camera.zoom * 100)}%`;

    // Update high score display if exists
    const highScoreEl = document.getElementById('high-score');
    if (highScoreEl) {
        highScoreEl.textContent = gameState.highScore;
    }

    if (gameState.selectedAirplane && gameState.airplanes.includes(gameState.selectedAirplane)) {
        document.getElementById('no-selection').style.display = 'none';
        document.getElementById('airplane-info').style.display = 'block';

        const airplane = gameState.selectedAirplane;
        document.getElementById('flight-id').textContent = airplane.id;
        document.getElementById('altitude-display').textContent = `FL${airplane.altitude}`;
        document.getElementById('speed-display').textContent = airplane.speedType.toUpperCase();

        const statusDisplay = document.getElementById('status-display');
        if (airplane.emergency === 'lowFuel') {
            statusDisplay.textContent = '⚠️ CARBURANT FAIBLE';
            statusDisplay.className = 'emergency';
        } else if (airplane.emergency === 'engineFailure') {
            statusDisplay.textContent = '⚠️ PANNE MOTEUR';
            statusDisplay.className = 'emergency';
        } else {
            statusDisplay.textContent = 'Normal';
            statusDisplay.className = '';
        }

        // Enable buttons
        document.getElementById('btn-altitude-up').disabled = airplane.altitude >= 2;
        document.getElementById('btn-altitude-down').disabled = airplane.altitude <= 0;
        document.getElementById('btn-hold').disabled = false;
        document.getElementById('btn-clear-path').disabled = false;
        document.getElementById('btn-emergency-land').disabled = !airplane.emergency;
    } else {
        document.getElementById('no-selection').style.display = 'block';
        document.getElementById('airplane-info').style.display = 'none';

        // Disable buttons
        document.getElementById('btn-altitude-up').disabled = true;
        document.getElementById('btn-altitude-down').disabled = true;
        document.getElementById('btn-hold').disabled = true;
        document.getElementById('btn-clear-path').disabled = true;
        document.getElementById('btn-emergency-land').disabled = true;

        gameState.selectedAirplane = null;
    }
}

function addRadioMessage(message, isEmergency = false) {
    const messagesContainer = document.getElementById('radio-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'radio-message' + (isEmergency ? ' emergency' : '');
    messageDiv.textContent = message;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Keep only last 10 messages
    while (messagesContainer.children.length > 10) {
        messagesContainer.removeChild(messagesContainer.firstChild);
    }
}

// ========================================
// GAME OVER
// ========================================
function gameOver(message) {
    gameState.running = false;

    playSound('collision');

    // Check for new high score
    const isNewHighScore = saveHighScore();

    document.getElementById('final-score').textContent = `Score Final: ${gameState.score}`;
    document.getElementById('game-over-message').textContent = message;

    // Show high score message if new record
    if (isNewHighScore) {
        const highScoreMsg = document.createElement('p');
        highScoreMsg.style.color = '#00ff88';
        highScoreMsg.style.fontWeight = 'bold';
        highScoreMsg.textContent = '🏆 NOUVEAU RECORD!';
        document.querySelector('#game-over-modal .modal-content').insertBefore(
            highScoreMsg,
            document.getElementById('btn-restart')
        );
    }

    document.getElementById('game-over-modal').classList.add('active');
}

// ========================================
// EVENT HANDLERS
// ========================================
// Mouse and keyboard controls
canvas.addEventListener('mousedown', (e) => {
    if (!gameState.running) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);

    // Check if clicked on airplane
    let clickedAirplane = null;
    for (const airplane of gameState.airplanes) {
        const dx = airplane.x - world.x;
        const dy = airplane.y - world.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < AIRPLANE_RADIUS + 10) {
            clickedAirplane = airplane;
            break;
        }
    }

    if (clickedAirplane) {
        // Select airplane
        gameState.selectedAirplane = clickedAirplane;
        playSound('select');
        updateUI();
    } else if (gameState.selectedAirplane) {
        // Add waypoint
        gameState.selectedAirplane.addWaypoint(world.x, world.y);
        playSound('waypoint');
    } else {
        // Start camera drag
        camera.isDragging = true;
        camera.dragStartX = e.clientX;
        camera.dragStartY = e.clientY;
        camera.dragStartCamX = camera.x;
        camera.dragStartCamY = camera.y;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (camera.isDragging) {
        const dx = e.clientX - camera.dragStartX;
        const dy = e.clientY - camera.dragStartY;

        camera.x = camera.dragStartCamX - dx / camera.zoom;
        camera.y = camera.dragStartCamY - dy / camera.zoom;

        // Constrain to bounds
        const maxX = MAP_SIZE - canvas.width / camera.zoom;
        const maxY = MAP_SIZE - canvas.height / camera.zoom;
        camera.x = Math.max(0, Math.min(camera.x, maxX));
        camera.y = Math.max(0, Math.min(camera.y, maxY));
    }
});

canvas.addEventListener('mouseup', () => {
    camera.isDragging = false;
    canvas.style.cursor = 'crosshair';
});

canvas.addEventListener('mouseleave', () => {
    camera.isDragging = false;
    canvas.style.cursor = 'crosshair';
});

// Zoom with mouse wheel
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomSpeed = 0.1;
    const oldZoom = camera.zoom;

    if (e.deltaY < 0) {
        camera.zoom = Math.min(camera.maxZoom, camera.zoom + zoomSpeed);
    } else {
        camera.zoom = Math.max(camera.minZoom, camera.zoom - zoomSpeed);
    }

    // Adjust camera position to zoom towards mouse
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = mouseX / oldZoom + camera.x;
    const worldY = mouseY / oldZoom + camera.y;

    camera.x = worldX - mouseX / camera.zoom;
    camera.y = worldY - mouseY / camera.zoom;

    updateUI();
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // Pause toggle
    if (key === ' ' || key === 'escape') {
        e.preventDefault();
        if (gameState.running) {
            gameState.paused = !gameState.paused;
            if (gameState.paused) {
                addRadioMessage('⏸️ Jeu en pause');
            } else {
                addRadioMessage('▶️ Jeu repris');
            }
        }
        return;
    }

    // Camera controls
    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;
});

document.getElementById('btn-altitude-up').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.changeAltitude(1);
        updateUI();
    }
});

document.getElementById('btn-altitude-down').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.changeAltitude(-1);
        updateUI();
    }
});

document.getElementById('btn-hold').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.toggleHold();
    }
});

document.getElementById('btn-clear-path').addEventListener('click', () => {
    if (gameState.selectedAirplane) {
        gameState.selectedAirplane.clearWaypoints();
        addRadioMessage(`Vol ${gameState.selectedAirplane.id}, route effacée`);
    }
});

document.getElementById('btn-emergency-land').addEventListener('click', () => {
    if (gameState.selectedAirplane && gameState.selectedAirplane.emergency) {
        gameState.selectedAirplane.emergencyLanding();
        updateUI();
    }
});

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('welcome-modal').classList.remove('active');
    initGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.remove('active');
    initGame();
    gameState.running = true;
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

// ========================================
// TUTORIAL SYSTEM
// ========================================
const tutorialSteps = [
    {
        text: "Bienvenue dans SkyLine Control! Vous êtes le contrôleur aérien. Votre mission: guider les avions en toute sécurité.",
        highlight: null
    },
    {
        text: "Cliquez sur un avion pour le sélectionner. Vous verrez ses informations dans le panneau de contrôle en bas à gauche.",
        highlight: "control-panel"
    },
    {
        text: "Une fois un avion sélectionné, cliquez sur la carte pour ajouter des waypoints (points de passage). L'avion suivra ce chemin.",
        highlight: "gameCanvas"
    },
    {
        text: "Utilisez les boutons pour changer l'altitude. Les avions à la même altitude peuvent entrer en collision!",
        highlight: "controls"
    },
    {
        text: "Utilisez la minimap pour voir toute la carte, et WASD ou clic-glisser pour déplacer la caméra. Bon vol!",
        highlight: "minimap-container"
    }
];

let currentTutorialStep = 0;

function showTutorial() {
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    tutorialOverlay.classList.add('active');
    currentTutorialStep = 0;
    updateTutorialStep();
}

function updateTutorialStep() {
    const step = tutorialSteps[currentTutorialStep];
    document.getElementById('tutorial-text').textContent = step.text;
    document.getElementById('step-current').textContent = currentTutorialStep + 1;
    document.getElementById('step-total').textContent = tutorialSteps.length;

    const nextBtn = document.getElementById('btn-next-tutorial');
    if (currentTutorialStep === tutorialSteps.length - 1) {
        nextBtn.textContent = 'Commencer!';
    } else {
        nextBtn.textContent = 'Suivant';
    }
}

function nextTutorialStep() {
    currentTutorialStep++;
    if (currentTutorialStep >= tutorialSteps.length) {
        closeTutorial();
    } else {
        updateTutorialStep();
    }
}

function closeTutorial() {
    document.getElementById('tutorial-overlay').classList.remove('active');
    // Mark tutorial as completed
    try {
        localStorage.setItem('skylineControlTutorialCompleted', 'true');
    } catch (e) {
        console.log('LocalStorage not available');
    }
}

function checkFirstLaunch() {
    try {
        const tutorialCompleted = localStorage.getItem('skylineControlTutorialCompleted');
        if (!tutorialCompleted) {
            // Show tutorial after welcome screen is closed
            setTimeout(() => {
                if (!document.getElementById('welcome-modal').classList.contains('active')) {
                    showTutorial();
                }
            }, 500);
        }
    } catch (e) {
        console.log('LocalStorage not available');
    }
}

// Tutorial event listeners
document.getElementById('btn-next-tutorial').addEventListener('click', nextTutorialStep);
document.getElementById('btn-skip-tutorial').addEventListener('click', closeTutorial);

// ========================================
// SOUND TOGGLE
// ========================================
function loadSoundPreference() {
    try {
        const soundPref = localStorage.getItem('skylineControlSoundEnabled');
        if (soundPref !== null) {
            gameState.soundEnabled = soundPref === 'true';
            updateSoundButton();
        }
    } catch (e) {
        console.log('LocalStorage not available');
    }
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    updateSoundButton();

    // Save preference
    try {
        localStorage.setItem('skylineControlSoundEnabled', gameState.soundEnabled.toString());
    } catch (e) {
        console.log('LocalStorage not available');
    }

    // Play feedback sound if enabling
    if (gameState.soundEnabled) {
        playSound('select');
    }
}

function updateSoundButton() {
    const btn = document.getElementById('btn-toggle-sound');
    if (gameState.soundEnabled) {
        btn.textContent = '🔊';
        btn.classList.remove('muted');
        btn.title = 'Désactiver le son';
    } else {
        btn.textContent = '🔇';
        btn.classList.add('muted');
        btn.title = 'Activer le son';
    }
}

document.getElementById('btn-toggle-sound').addEventListener('click', toggleSound);

// ========================================
// INITIALIZE
// ========================================
loadSoundPreference();
initGame();
checkFirstLaunch();
