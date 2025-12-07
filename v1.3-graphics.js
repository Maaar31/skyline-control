// ========================================
// V1.3 - ENHANCED MAP GRAPHICS
// ========================================

class MapGraphics {
    constructor(ctx, mapSize) {
        this.ctx = ctx;
        this.mapSize = mapSize;
        this.terrain = {
            rivers: [],
            mountains: [],
            forests: [],
            cities: [],
            clouds: []
        };
        this.generated = false;
    }

    // Generate all terrain features
    generate() {
        if (this.generated) return;

        this.generateRivers();
        this.generateMountains();
        this.generateForests();
        this.generateCities();
        this.generateClouds();

        this.generated = true;
    }

    // Generate rivers
    generateRivers() {
        const numRivers = 3;

        for (let i = 0; i < numRivers; i++) {
            const river = {
                points: [],
                width: 30 + Math.random() * 20
            };

            // Start from random edge
            const startSide = Math.floor(Math.random() * 4);
            let x, y;

            switch (startSide) {
                case 0: // Top
                    x = Math.random() * this.mapSize;
                    y = 0;
                    break;
                case 1: // Right
                    x = this.mapSize;
                    y = Math.random() * this.mapSize;
                    break;
                case 2: // Bottom
                    x = Math.random() * this.mapSize;
                    y = this.mapSize;
                    break;
                case 3: // Left
                    x = 0;
                    y = Math.random() * this.mapSize;
                    break;
            }

            river.points.push({ x, y });

            // Generate meandering path
            const segments = 15 + Math.floor(Math.random() * 10);
            for (let j = 0; j < segments; j++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 150 + Math.random() * 200;

                x += Math.cos(angle) * distance;
                y += Math.sin(angle) * distance;

                // Keep within bounds
                x = Math.max(0, Math.min(this.mapSize, x));
                y = Math.max(0, Math.min(this.mapSize, y));

                river.points.push({ x, y });
            }

            this.terrain.rivers.push(river);
        }
    }

    // Generate mountains
    generateMountains() {
        const numMountains = 8 + Math.floor(Math.random() * 7);

        for (let i = 0; i < numMountains; i++) {
            const mountain = {
                x: Math.random() * this.mapSize,
                y: Math.random() * this.mapSize,
                size: 40 + Math.random() * 60,
                peaks: 3 + Math.floor(Math.random() * 3)
            };

            this.terrain.mountains.push(mountain);
        }
    }

    // Generate forests
    generateForests() {
        const numForests = 12 + Math.floor(Math.random() * 8);

        for (let i = 0; i < numForests; i++) {
            const forest = {
                x: Math.random() * this.mapSize,
                y: Math.random() * this.mapSize,
                trees: 5 + Math.floor(Math.random() * 10),
                spread: 50 + Math.random() * 50
            };

            this.terrain.forests.push(forest);
        }
    }

    // Generate cities
    generateCities() {
        const numCities = 5 + Math.floor(Math.random() * 5);

        for (let i = 0; i < numCities; i++) {
            const city = {
                x: Math.random() * this.mapSize,
                y: Math.random() * this.mapSize,
                size: 30 + Math.random() * 40,
                buildings: 4 + Math.floor(Math.random() * 6)
            };

            this.terrain.cities.push(city);
        }
    }

    // Generate decorative clouds
    generateClouds() {
        const numClouds = 15 + Math.floor(Math.random() * 10);

        for (let i = 0; i < numClouds; i++) {
            const cloud = {
                x: Math.random() * this.mapSize,
                y: Math.random() * this.mapSize,
                size: 60 + Math.random() * 80,
                opacity: 0.1 + Math.random() * 0.15,
                speed: 0.1 + Math.random() * 0.3
            };

            this.terrain.clouds.push(cloud);
        }
    }

    // Draw background gradient
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.mapSize / 2, this.mapSize / 2, 0,
            this.mapSize / 2, this.mapSize / 2, this.mapSize * 0.7
        );

        gradient.addColorStop(0, '#1e2a3a');
        gradient.addColorStop(0.5, '#1a2332');
        gradient.addColorStop(1, '#0d1117');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.mapSize, this.mapSize);

        // Add subtle noise texture
        this.ctx.globalAlpha = 0.03;
        for (let i = 0; i < 1000; i++) {
            this.ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            this.ctx.fillRect(
                Math.random() * this.mapSize,
                Math.random() * this.mapSize,
                2, 2
            );
        }
        this.ctx.globalAlpha = 1.0;
    }

    // Draw rivers
    drawRivers() {
        this.terrain.rivers.forEach(river => {
            this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
            this.ctx.lineWidth = river.width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            river.points.forEach((point, i) => {
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();

            // Add lighter center
            this.ctx.strokeStyle = 'rgba(120, 170, 220, 0.2)';
            this.ctx.lineWidth = river.width * 0.5;
            this.ctx.stroke();
        });
    }

    // Draw mountains
    drawMountains() {
        this.terrain.mountains.forEach(mountain => {
            this.ctx.save();
            this.ctx.translate(mountain.x, mountain.y);

            for (let i = 0; i < mountain.peaks; i++) {
                const offsetX = (i - mountain.peaks / 2) * mountain.size * 0.6;
                const peakSize = mountain.size * (0.7 + Math.random() * 0.3);

                // Shadow
                this.ctx.fillStyle = 'rgba(80, 90, 110, 0.4)';
                this.ctx.beginPath();
                this.ctx.moveTo(offsetX, 0);
                this.ctx.lineTo(offsetX - peakSize / 2, peakSize);
                this.ctx.lineTo(offsetX + peakSize / 2, peakSize);
                this.ctx.closePath();
                this.ctx.fill();

                // Highlight
                this.ctx.fillStyle = 'rgba(120, 130, 150, 0.3)';
                this.ctx.beginPath();
                this.ctx.moveTo(offsetX, 0);
                this.ctx.lineTo(offsetX - peakSize / 3, peakSize * 0.6);
                this.ctx.lineTo(offsetX, peakSize);
                this.ctx.closePath();
                this.ctx.fill();
            }

            this.ctx.restore();
        });
    }

    // Draw forests
    drawForests() {
        this.terrain.forests.forEach(forest => {
            for (let i = 0; i < forest.trees; i++) {
                const angle = (i / forest.trees) * Math.PI * 2;
                const distance = Math.random() * forest.spread;
                const x = forest.x + Math.cos(angle) * distance;
                const y = forest.y + Math.sin(angle) * distance;
                const size = 8 + Math.random() * 12;

                this.ctx.fillStyle = 'rgba(80, 150, 100, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    // Draw cities
    drawCities() {
        this.terrain.cities.forEach(city => {
            for (let i = 0; i < city.buildings; i++) {
                const angle = (i / city.buildings) * Math.PI * 2;
                const distance = Math.random() * city.size * 0.5;
                const x = city.x + Math.cos(angle) * distance;
                const y = city.y + Math.sin(angle) * distance;
                const width = 8 + Math.random() * 12;
                const height = 8 + Math.random() * 12;

                // Building
                this.ctx.fillStyle = 'rgba(150, 150, 180, 0.4)';
                this.ctx.fillRect(x - width / 2, y - height / 2, width, height);

                // Window lights
                this.ctx.fillStyle = 'rgba(255, 220, 150, 0.6)';
                for (let w = 0; w < 2; w++) {
                    for (let h = 0; h < 2; h++) {
                        this.ctx.fillRect(
                            x - width / 2 + w * width / 2 + 2,
                            y - height / 2 + h * height / 2 + 2,
                            2, 2
                        );
                    }
                }
            }
        });
    }

    // Draw and animate clouds
    drawClouds(time) {
        this.terrain.clouds.forEach(cloud => {
            // Animate position
            cloud.x += cloud.speed;
            if (cloud.x > this.mapSize + cloud.size) {
                cloud.x = -cloud.size;
            }

            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.fillStyle = '#ffffff';

            // Draw cloud as multiple circles
            for (let i = 0; i < 5; i++) {
                const offsetX = (i - 2) * cloud.size * 0.2;
                const offsetY = Math.sin(i) * cloud.size * 0.1;
                const radius = cloud.size * (0.3 + Math.random() * 0.2);

                this.ctx.beginPath();
                this.ctx.arc(cloud.x + offsetX, cloud.y + offsetY, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.globalAlpha = 1.0;
        });
    }

    // Draw all terrain
    drawAll(time = 0) {
        if (!this.generated) {
            this.generate();
        }

        this.drawBackground();
        this.drawRivers();
        this.drawMountains();
        this.drawForests();
        this.drawCities();
        this.drawClouds(time);
    }
}

// Export for use in main.js
window.MapGraphics = MapGraphics;
