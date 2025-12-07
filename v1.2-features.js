// ========================================
// V1.2 - SETTINGS, LEADERBOARD & ENHANCEMENTS
// ========================================

// Default Settings
const defaultSettings = {
    hud: {
        showScore: true,
        showHighScore: true,
        showDifficulty: true,
        showZoom: true,
        showMinimap: true,
        showRadio: true,
        showLegend: true,
        panelOpacity: 90
    },
    audio: {
        masterVolume: 100,
        effectsVolume: 100,
        ambianceVolume: 50
    },
    gameplay: {
        startDifficulty: 1,
        gameSpeed: 1.0,
        maxPlanes: 15,
        emergencyRate: 15
    },
    camera: {
        moveSpeed: 5,
        zoomSensitivity: 0.1,
        invertZoom: false
    }
};

// Current settings (will be loaded from localStorage)
let currentSettings = JSON.parse(JSON.stringify(defaultSettings));

// Session statistics
const sessionStats = {
    planesManaged: 0,
    emergenciesResolved: 0,
    startTime: Date.now(),
    playtime: 0
};

// ========================================
// SETTINGS SYSTEM
// ========================================

function loadSettings() {
    try {
        const saved = localStorage.getItem('skylineControlSettings');
        if (saved) {
            currentSettings = JSON.parse(saved);
            applySettings();
        }
    } catch (e) {
        console.log('Could not load settings');
    }
}

function saveSettings() {
    try {
        localStorage.setItem('skylineControlSettings', JSON.stringify(currentSettings));
    } catch (e) {
        console.log('Could not save settings');
    }
}

function applySettings() {
    // Apply HUD settings
    document.getElementById('score-container').style.display =
        currentSettings.hud.showScore ? 'block' : 'none';
    document.getElementById('high-score-container').style.display =
        currentSettings.hud.showHighScore ? 'block' : 'none';
    document.getElementById('difficulty-container').style.display =
        currentSettings.hud.showDifficulty ? 'block' : 'none';
    document.getElementById('zoom-container').style.display =
        currentSettings.hud.showZoom ? 'block' : 'none';
    document.getElementById('minimap-container').style.display =
        currentSettings.hud.showMinimap ? 'block' : 'none';
    document.getElementById('radio-container').style.display =
        currentSettings.hud.showRadio ? 'block' : 'none';
    document.getElementById('legend').style.display =
        currentSettings.hud.showLegend ? 'block' : 'none';

    // Apply opacity
    const opacity = currentSettings.hud.panelOpacity / 100;
    document.querySelectorAll('#radio-container, #control-panel, #camera-help, #legend').forEach(el => {
        el.style.opacity = opacity;
    });

    // Apply audio settings (will be used by sound system)
    if (window.audioMixer) {
        audioMixer.setMasterVolume(currentSettings.audio.masterVolume / 100);
        audioMixer.setEffectsVolume(currentSettings.audio.effectsVolume / 100);
        audioMixer.setAmbianceVolume(currentSettings.audio.ambianceVolume / 100);
    }

    // Apply camera settings
    if (window.camera) {
        camera.moveSpeed = currentSettings.camera.moveSpeed;
        camera.zoomSensitivity = currentSettings.camera.zoomSensitivity;
        camera.invertZoom = currentSettings.camera.invertZoom;
    }
}

function openSettings() {
    // Pause game if running
    if (gameState.running && !gameState.paused) {
        gameState.paused = true;
    }

    // Update UI with current settings
    document.getElementById('set-show-score').checked = currentSettings.hud.showScore;
    document.getElementById('set-show-highscore').checked = currentSettings.hud.showHighScore;
    document.getElementById('set-show-difficulty').checked = currentSettings.hud.showDifficulty;
    document.getElementById('set-show-zoom').checked = currentSettings.hud.showZoom;
    document.getElementById('set-show-minimap').checked = currentSettings.hud.showMinimap;
    document.getElementById('set-show-radio').checked = currentSettings.hud.showRadio;
    document.getElementById('set-show-legend').checked = currentSettings.hud.showLegend;
    document.getElementById('set-panel-opacity').value = currentSettings.hud.panelOpacity;
    document.getElementById('opacity-value').textContent = currentSettings.hud.panelOpacity;

    document.getElementById('set-master-volume').value = currentSettings.audio.masterVolume;
    document.getElementById('master-volume-value').textContent = currentSettings.audio.masterVolume;
    document.getElementById('set-effects-volume').value = currentSettings.audio.effectsVolume;
    document.getElementById('effects-volume-value').textContent = currentSettings.audio.effectsVolume;
    document.getElementById('set-ambiance-volume').value = currentSettings.audio.ambianceVolume;
    document.getElementById('ambiance-volume-value').textContent = currentSettings.audio.ambianceVolume;

    document.getElementById('set-start-difficulty').value = currentSettings.gameplay.startDifficulty;
    document.getElementById('start-diff-value').textContent = currentSettings.gameplay.startDifficulty;
    document.getElementById('set-game-speed').value = currentSettings.gameplay.gameSpeed * 100;
    document.getElementById('game-speed-value').textContent = currentSettings.gameplay.gameSpeed.toFixed(1);
    document.getElementById('set-max-planes').value = currentSettings.gameplay.maxPlanes;
    document.getElementById('max-planes-value').textContent = currentSettings.gameplay.maxPlanes;
    document.getElementById('set-emergency-rate').value = currentSettings.gameplay.emergencyRate;
    document.getElementById('emergency-rate-value').textContent = currentSettings.gameplay.emergencyRate;

    document.getElementById('set-move-speed').value = currentSettings.camera.moveSpeed;
    document.getElementById('move-speed-value').textContent = currentSettings.camera.moveSpeed;
    document.getElementById('set-zoom-sensitivity').value = currentSettings.camera.zoomSensitivity * 100;
    document.getElementById('zoom-sens-value').textContent = currentSettings.camera.zoomSensitivity.toFixed(1);
    document.getElementById('set-invert-zoom').checked = currentSettings.camera.invertZoom;

    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
    saveSettings();
    applySettings();

    // Unpause if was paused by settings
    if (gameState.running && gameState.paused) {
        gameState.paused = false;
    }
}

function resetSettings() {
    if (confirm('Réinitialiser tous les paramètres par défaut?')) {
        currentSettings = JSON.parse(JSON.stringify(defaultSettings));
        openSettings(); // Refresh UI
    }
}

// ========================================
// LEADERBOARD SYSTEM
// ========================================

function loadLeaderboard() {
    try {
        const saved = localStorage.getItem('skylineControlLeaderboard');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveLeaderboard(leaderboard) {
    try {
        localStorage.setItem('skylineControlLeaderboard', JSON.stringify(leaderboard));
    } catch (e) {
        console.log('Could not save leaderboard');
    }
}

function addScore(name, score) {
    const leaderboard = loadLeaderboard();

    const entry = {
        id: Date.now(),
        name: name || 'Anonyme',
        score: score,
        date: Date.now(),
        difficulty: gameState.difficulty,
        playtime: Math.floor((Date.now() - sessionStats.startTime) / 1000),
        planesManaged: sessionStats.planesManaged,
        emergenciesResolved: sessionStats.emergenciesResolved
    };

    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep only top 10

    saveLeaderboard(leaderboard);
    return leaderboard.findIndex(e => e.id === entry.id);
}

function showLeaderboard() {
    const leaderboard = loadLeaderboard();
    const tbody = document.getElementById('leaderboard-body');

    if (leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun score enregistré</td></tr>';
    } else {
        tbody.innerHTML = leaderboard.map((entry, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${entry.difficulty}</td>
                <td>${entry.planesManaged}</td>
            </tr>
        `).join('');
    }

    // Calculate global stats
    const totalPlanes = leaderboard.reduce((sum, e) => sum + e.planesManaged, 0);
    const totalEmergencies = leaderboard.reduce((sum, e) => sum + e.emergenciesResolved, 0);
    const totalPlaytime = leaderboard.reduce((sum, e) => sum + e.playtime, 0);

    document.getElementById('total-planes').textContent = totalPlanes;
    document.getElementById('total-emergencies').textContent = totalEmergencies;
    const hours = Math.floor(totalPlaytime / 3600);
    const minutes = Math.floor((totalPlaytime % 3600) / 60);
    document.getElementById('total-playtime').textContent = `${hours}h ${minutes}m`;

    document.getElementById('leaderboard-modal').classList.add('active');
}

function clearLeaderboard() {
    if (confirm('Effacer tout le classement?')) {
        localStorage.removeItem('skylineControlLeaderboard');
        showLeaderboard();
    }
}

// ========================================
// NAME INPUT SYSTEM
// ========================================

function showNameInput(score) {
    document.getElementById('final-score-display').textContent = score;
    document.getElementById('player-name-input').value = '';
    document.getElementById('name-input-modal').classList.add('active');
}

function submitScore() {
    const name = document.getElementById('player-name-input').value.trim() || 'Anonyme';
    const score = gameState.score;

    const rank = addScore(name, score);
    document.getElementById('name-input-modal').classList.remove('active');

    // Show leaderboard with highlight
    setTimeout(() => {
        showLeaderboard();
        if (rank >= 0) {
            const rows = document.querySelectorAll('#leaderboard-body tr');
            if (rows[rank]) {
                rows[rank].classList.add('highlight');
            }
        }
    }, 300);
}

function skipNameInput() {
    document.getElementById('name-input-modal').classList.remove('active');
}

// ========================================
// EVENT LISTENERS
// ========================================

// Settings
document.getElementById('btn-settings').addEventListener('click', openSettings);
document.getElementById('btn-close-settings').addEventListener('click', closeSettings);
document.getElementById('btn-reset-settings').addEventListener('click', resetSettings);

// Settings tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
    });
});

// HUD settings
document.getElementById('set-show-score').addEventListener('change', e => {
    currentSettings.hud.showScore = e.target.checked;
});
document.getElementById('set-show-highscore').addEventListener('change', e => {
    currentSettings.hud.showHighScore = e.target.checked;
});
document.getElementById('set-show-difficulty').addEventListener('change', e => {
    currentSettings.hud.showDifficulty = e.target.checked;
});
document.getElementById('set-show-zoom').addEventListener('change', e => {
    currentSettings.hud.showZoom = e.target.checked;
});
document.getElementById('set-show-minimap').addEventListener('change', e => {
    currentSettings.hud.showMinimap = e.target.checked;
});
document.getElementById('set-show-radio').addEventListener('change', e => {
    currentSettings.hud.showRadio = e.target.checked;
});
document.getElementById('set-show-legend').addEventListener('change', e => {
    currentSettings.hud.showLegend = e.target.checked;
});
document.getElementById('set-panel-opacity').addEventListener('input', e => {
    currentSettings.hud.panelOpacity = parseInt(e.target.value);
    document.getElementById('opacity-value').textContent = e.target.value;
});

// Audio settings
document.getElementById('set-master-volume').addEventListener('input', e => {
    currentSettings.audio.masterVolume = parseInt(e.target.value);
    document.getElementById('master-volume-value').textContent = e.target.value;
});
document.getElementById('set-effects-volume').addEventListener('input', e => {
    currentSettings.audio.effectsVolume = parseInt(e.target.value);
    document.getElementById('effects-volume-value').textContent = e.target.value;
});
document.getElementById('set-ambiance-volume').addEventListener('input', e => {
    currentSettings.audio.ambianceVolume = parseInt(e.target.value);
    document.getElementById('ambiance-volume-value').textContent = e.target.value;
});

// Gameplay settings
document.getElementById('set-start-difficulty').addEventListener('input', e => {
    currentSettings.gameplay.startDifficulty = parseInt(e.target.value);
    document.getElementById('start-diff-value').textContent = e.target.value;
});
document.getElementById('set-game-speed').addEventListener('input', e => {
    currentSettings.gameplay.gameSpeed = parseInt(e.target.value) / 100;
    document.getElementById('game-speed-value').textContent = (parseInt(e.target.value) / 100).toFixed(1);
});
document.getElementById('set-max-planes').addEventListener('input', e => {
    currentSettings.gameplay.maxPlanes = parseInt(e.target.value);
    document.getElementById('max-planes-value').textContent = e.target.value;
});
document.getElementById('set-emergency-rate').addEventListener('input', e => {
    currentSettings.gameplay.emergencyRate = parseInt(e.target.value);
    document.getElementById('emergency-rate-value').textContent = e.target.value;
});

// Camera settings
document.getElementById('set-move-speed').addEventListener('input', e => {
    currentSettings.camera.moveSpeed = parseInt(e.target.value);
    document.getElementById('move-speed-value').textContent = e.target.value;
});
document.getElementById('set-zoom-sensitivity').addEventListener('input', e => {
    currentSettings.camera.zoomSensitivity = parseInt(e.target.value) / 100;
    document.getElementById('zoom-sens-value').textContent = (parseInt(e.target.value) / 100).toFixed(1);
});
document.getElementById('set-invert-zoom').addEventListener('change', e => {
    currentSettings.camera.invertZoom = e.target.checked;
});

// Leaderboard
document.getElementById('btn-leaderboard').addEventListener('click', showLeaderboard);
document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').classList.remove('active');
});
document.getElementById('btn-clear-leaderboard').addEventListener('click', clearLeaderboard);

// Name input
document.getElementById('btn-submit-score').addEventListener('click', submitScore);
document.getElementById('btn-skip-name').addEventListener('click', skipNameInput);
document.getElementById('player-name-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') submitScore();
});

// ========================================
// INITIALIZATION
// ========================================
loadSettings();
applySettings();

// Export for use in main.js
window.v12 = {
    settings: currentSettings,
    sessionStats,
    showNameInput,
    loadSettings,
    applySettings
};
