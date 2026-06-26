class BearGoesPubGame {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.buildEnvironment();
        this.createNPCs();
        this.setupControlsAndInput();
        this.setupQuestSystem();
        this.setupInteractionSystem();
        this.animate();
        
        if (this.isMobile) {
            this.setupMobileControls();
        } else {
            document.getElementById('controlsDisplay').style.display = 'block';
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 200);
    }

    setupCamera() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 1, 0);
    }

    setupRenderer() {
        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Warm ambient light for cosy pub feeling
        const ambientLight = new THREE.AmbientLight(0xFFE4B5, 0.5);
        this.scene.add(ambientLight);

        // Main directional light (warm sun through windows)
        const dirLight = new THREE.DirectionalLight(0xFFF8DC, 0.8);
        dirLight.position.set(50, 40, 50);
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Warm point light inside pub
        const pubLight = new THREE.PointLight(0xFFB347, 1.5, 50);
        pubLight.position.set(0, 3, 0);
        pubLight.castShadow = true;
        this.scene.add(pubLight);
    }

    buildEnvironment() {
        // Ground
        const groundGeo = new THREE.PlaneGeometry(200, 200);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = 'ground';
        this.scene.add(ground);

        // Pub building
        this.createPubBuilding();

        // Village area
        this.createVillageArea();

        // Sky dome
        this.createSkyDome();
    }

    createPubBuilding() {
        // Main pub structure
        const pubGeo = new THREE.BoxGeometry(15, 8, 12);
        const brickMat = new THREE.MeshStandardMaterial({
            color: 0xA0522D,
            roughness: 0.7,
            metalness: 0.1
        });
        const pub = new THREE.Mesh(pubGeo, brickMat);
        pub.position.set(0, 4, 0);
        pub.castShadow = true;
        pub.receiveShadow = true;
        this.scene.add(pub);

        // Pub roof (pitched)
        const roofGeo = new THREE.ConeGeometry(12, 4, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, 9, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // Pub door
        const doorGeo = new THREE.BoxGeometry(2, 3.5, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 2, 6);
        door.castShadow = true;
        this.scene.add(door);
        this.interactibles.push({
            mesh: door,
            name: 'Pub Door',
            action: () => this.showDialogue('Pub Door', "It's locked. Bear can't reach the handle.")
        });

        // Door handle
        const handleGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(1, 2, 6.15);
        this.scene.add(handle);

        // Pub sign
        const signGeo = new THREE.BoxGeometry(4, 2, 0.2);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(-6, 7, 6.5);
        sign.castShadow = true;
        this.scene.add(sign);

        // Sign post
        const postGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(-6, 3, 6.5);
        post.castShadow = true;
        this.scene.add(post);

        // Windows
        for (let i = -2; i <= 2; i++) {
            const windowGeo = new THREE.BoxGeometry(1.5, 1.5, 0.1);
            const windowMat = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                metalness: 0.9,
                roughness: 0.1
            });
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(i * 2, 4.5, 6);
            this.scene.add(window);
        }

        // Beer garden fence
        this.createBeerGardenFence();

        // Interior setup
        this.setupPubInterior();
    }

    createBeerGardenFence() {
        const fenceColor = 0x654321;
        const fenceMat = new THREE.MeshStandardMaterial({ color: fenceColor });
        
        for (let i = 0; i < 12; i++) {
            const x = Math.cos((i / 12) * Math.PI * 2) * 12;
            const z = Math.sin((i / 12) * Math.PI * 2) * 12 - 10;
            
            const postGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 6);
            const post = new THREE.Mesh(postGeo, fenceMat);
            post.position.set(x, 1.5, z);
            post.castShadow = true;
            this.scene.add(post);
        }
    }

    setupPubInterior() {
        // This will be simplified - full interior details in createInteractables
        // Floor with pub carpet pattern
        const carpetGeo = new THREE.PlaneGeometry(12, 10);
        const carpetMat = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.9
        });
        const carpet = new THREE.Mesh(carpetGeo, carpetMat);
        carpet.position.set(0, 0.01, 0);
        carpet.rotation.x = -Math.PI / 2;
        carpet.receiveShadow = true;
        this.scene.add(carpet);
    }

    createVillageArea() {
        // Bus stop
        this.createBusStop();
        
        // Phone box
        this.createPhoneBox();
        
        // Shop
        this.createCornerShop();
        
        // Terraced houses
        this.createHouses();
        
        // Random pigeons
        this.createPigeons();
    }

    createBusStop() {
        const roofGeo = new THREE.BoxGeometry(3, 2.5, 2);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(30, 2.5, 0);
        roof.castShadow = true;
        this.scene.add(roof);

        // Poles
        for (let i = -1; i <= 1; i += 2) {
            const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x606060 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(30 + i, 1.5, 0);
            pole.castShadow = true;
            this.scene.add(pole);
        }

        // Bench
        const benchGeo = new THREE.BoxGeometry(2, 0.4, 0.6);
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(30, 0.8, 1);
        bench.castShadow = true;
        this.scene.add(bench);
        this.interactibles.push({
            mesh: bench,
            name: 'Bus Stop Bench',
            action: () => this.showDialogue('Bus Stop', 'You sit on the bench. A pigeon nearby seems unimpressed.')
        });
    }

    createPhoneBox() {
        const boxGeo = new THREE.BoxGeometry(1.2, 2.2, 0.8);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(-30, 1.1, 0);
        box.castShadow = true;
        this.scene.add(box);
        this.interactibles.push({
            mesh: box,
            name: 'Phone Box',
            action: () => this.showDialogue('Phone Box', 'The phone doesn\'t work. There\'s a strange smell inside.')
        });

        // Glass panes
        const glassGeo = new THREE.PlaneGeometry(0.9, 1.8);
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.3
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(-30, 1.1, 0.41);
        this.scene.add(glass);
    }

    createCornerShop() {
        const shopGeo = new THREE.BoxGeometry(6, 5, 4);
        const shopMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const shop = new THREE.Mesh(shopGeo, shopMat);
        shop.position.set(0, 2.5, 30);
        shop.castShadow = true;
        this.scene.add(shop);

        // Shop sign
        const signGeo = new THREE.BoxGeometry(5, 1.5, 0.2);
        const signMat = new THREE.MeshStandardMaterial({ color: 0x00AA00 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 5, 2.1);
        this.scene.add(sign);
        this.interactibles.push({
            mesh: shop,
            name: 'Corner Shop',
            action: () => this.showDialogue('Shopkeeper', 'We\'ve got Meal Deals and Greggs pastries. Bear tries to eat everything on the shelves.')
        });
    }

    createHouses() {
        for (let i = 0; i < 4; i++) {
            const houseGeo = new THREE.BoxGeometry(5, 6, 5);
            const houseMat = new THREE.MeshStandardMaterial({
                color: 0xCD853F + (i * 0x111111),
                roughness: 0.7
            });
            const house = new THREE.Mesh(houseGeo, houseMat);
            house.position.set(-40 + i * 12, 3, -20);
            house.castShadow = true;
            this.scene.add(house);
        }
    }

    createPigeons() {
        this.pigeons = [];
        for (let i = 0; i < 5; i++) {
            const pigeonGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const pigeonMat = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.6
            });
            const pigeon = new THREE.Mesh(pigeonGeo, pigeonMat);
            pigeon.position.set(
                (Math.random() - 0.5) * 40,
                0.3,
                (Math.random() - 0.5) * 40
            );
            pigeon.castShadow = true;
            this.scene.add(pigeon);
            
            this.pigeons.push({
                mesh: pigeon,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    0,
                    (Math.random() - 0.5) * 0.05
                ),
                wanderTime: 0
            });

            this.interactibles.push({
                mesh: pigeon,
                name: 'Pigeon',
                action: () => this.chasePigeon(pigeon)
            });
        }
    }

    createSkyDome() {
        const skyGeo = new THREE.SphereGeometry(150, 32, 32);
        const skyMat = new THREE.MeshStandardMaterial({
            color: 0xC0D0E0,
            side: THREE.BackSide,
            emissive: 0x666666
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
    }

    createNPCs() {
        this.npcs = [
            {
                name: 'Reg the Landlord',
                position: new THREE.Vector3(2, 0, -2),
                color: 0xFF6347,
                dialogues: [
                    'Bear, if you knock over one more thing, we\'re having words.',
                    'The usual? Just the food, nothing else gets damaged.',
                    'This pub has been here since 1987. No cats allowed, technically.',
                ],
                type: 'landlord'
            },
            {
                name: 'Old Jim',
                position: new THREE.Vector3(-4, 0, 0),
                color: 0x696969,
                dialogues: [
                    'I\'ve been sitting in that chair for 20 years. Nearly.',
                    'The place ain\'t what it was.',
                    'That\'ll be the rain then.',
                ],
                type: 'regular'
            },
            {
                name: 'Weather Wendy',
                position: new THREE.Vector3(4, 0, 2),
                color: 0x4169E1,
                dialogues: [
                    'Lovely weather for June. Must be 18 degrees.',
                    'They said rain at 4, but it\'ll come at 3.',
                    'Pressure\'s dropping. You can feel it.',
                ],
                type: 'weather'
            },
            {
                name: 'Footy Frank',
                position: new THREE.Vector3(-2, 0, 3),
                color: 0xFF1493,
                dialogues: [
                    'Did you see the match? Absolute shambles.',
                    'If they\'d just passed it properly...',
                    'We should\'ve won 4-0. FOUR-NIL.',
                ],
                type: 'football'
            },
            {
                name: 'Queue Steve',
                position: new THREE.Vector3(3, 0, -4),
                color: 0x228B22,
                dialogues: [
                    'Just nipping in the queue for a second.',
                    'Where\'s the end of the queue?',
                    'Ah, perfect spot. Fifth in line.',
                ],
                type: 'queue'
            },
            {
                name: 'Doris',
                position: new THREE.Vector3(-5, 0, -3),
                color: 0xFF69B4,
                dialogues: [
                    'Back in MY day, pubs had character.',
                    'They\'ve ruined it all with the newfangled nonsense.',
                    'A pint cost 15p then.',
                ],
                type: 'nostalgia'
            },
            {
                name: 'Pigeon Pete',
                position: new THREE.Vector3(5, 0, 5),
                color: 0xDAAA8B,
                dialogues: [
                    'There\'s a pigeon here! Look at him!',
                    'Come to me, Gary. Don\'t mind the cat.',
                    'I named them all. This one\'s Gerald.',
                ],
                type: 'pigeon_feeder'
            },
            {
                name: 'Vera the Barmaid',
                position: new THREE.Vector3(1, 0, -5),
                color: 0xFF8C00,
                dialogues: [
                    'Pint of bitter? Coming right up.',
                    'Bear? Keep away from the crisps.',
                    'You\'re not bothering Toby, are you?',
                ],
                type: 'barmaid'
            },
            {
                name: 'Tea Tanya',
                position: new THREE.Vector3(-3, 0, 2),
                color: 0xB8860B,
                dialogues: [
                    'Have you had your tea? You look parched.',
                    'A nice cuppa solves everything.',
                    'Earl Grey for me, always.',
                ],
                type: 'tea_lover'
            }
        ];

        this.npcs.forEach(npc => {
            const npcMesh = this.createNPCMesh(npc.color);
            npcMesh.position.copy(npc.position);
            npcMesh.name = npc.name;
            this.scene.add(npcMesh);
            npc.mesh = npcMesh;
            this.interactibles.push({
                mesh: npcMesh,
                name: npc.name,
                action: () => this.interactWithNPC(npc)
            });
        });
    }

    createNPCMesh(color) {
        const group = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 0.7;
        head.castShadow = true;
        group.add(head);
        
        return group;
    }

    createBear() {
        const bearGroup = new THREE.Group();
        
        // Body (brown)
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.1;
        body.castShadow = true;
        bearGroup.add(body);
        
        // Head
        const headGeo = new THREE.SphereGeometry(0.45, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 1.0;
        head.castShadow = true;
        bearGroup.add(head);
        
        // Ears
        const earGeo = new THREE.SphereGeometry(0.15, 8, 8);
        for (let x of [-0.25, 0.25]) {
            const ear = new THREE.Mesh(earGeo, bodyMat);
            ear.position.set(x, 1.35, 0);
            ear.castShadow = true;
            bearGroup.add(ear);
        }
        
        // Eyes (small spheres)
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        for (let x of [-0.12, 0.12]) {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(x, 1.05, 0.35);
            bearGroup.add(eye);
        }
        
        // Nose
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const noseGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 0.85, 0.4);
        bearGroup.add(nose);
        
        bearGroup.castShadow = true;
        bearGroup.receiveShadow = true;
        this.bear = bearGroup;
        return bearGroup;
    }

    setupControlsAndInput() {
        this.keys = {};
        this.interactibles = [];
        this.nearbyInteractibles = [];
        this.bear = null;
        
        // Create and add bear to scene
        const bearMesh = this.createBear();
        bearMesh.position.set(0, 0, 10);
        this.scene.add(bearMesh);
        this.bearPosition = new THREE.Vector3(0, 0, 10);
        this.bearVelocity = new THREE.Vector3(0, 0, 0);
        this.bearSpeed = 0.3;
        this.bearRotation = 0;
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'e' || e.key === 'E') this.tryInteract();
            if (e.key === 'p' || e.key === 'P') this.togglePause();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    setupQuestSystem() {
        this.quests = [
            {
                id: 'find_toby',
                title: 'Find Toby',
                description: 'Toby has hidden because of pigeons. Search the pub.',
                completed: false,
                reward: 'Toby appears!'
            },
            {
                id: 'crisp_delivery',
                title: 'Crisp Delivery',
                description: 'Deliver crisps to the regulars.',
                completed: false,
                reward: 'Everyone happy!',
                requires: 'find_toby'
            },
            {
                id: 'pub_cleanup',
                title: 'Pub Cleanup',
                description: 'Collect dropped items: keys, wallet, glasses.',
                completed: false,
                reward: 'Pub looks tidier!',
                requires: 'crisp_delivery'
            },
            {
                id: 'tea_crisis',
                title: 'Tea Crisis',
                description: 'Help Tea Tanya find her emergency tea stash.',
                completed: false,
                reward: 'Crisis averted!',
                requires: 'pub_cleanup'
            },
            {
                id: 'mysterious_queue',
                title: 'The Queue',
                description: 'Find out why everyone is queuing.',
                completed: false,
                reward: 'Mystery solved!',
                requires: 'tea_crisis'
            },
            {
                id: 'pub_legend',
                title: 'Pub Legend Status',
                description: 'Complete all quests to become an Official Pub Cat!',
                completed: false,
                reward: 'YOU WIN!',
                requires: 'mysterious_queue'
            }
        ];

        this.currentQuest = this.quests[0];
        this.updateQuestDisplay();
    }

    setupInteractionSystem() {
        this.interactionDistance = 3;
        this.lastInteractionTime = 0;
        this.interactionCooldown = 500;
    }

    updateQuestDisplay() {
        const listHtml = this.quests.map(q => `
            <div class="quest-item ${q.completed ? 'quest-completed' : (q.id === this.currentQuest.id ? 'quest-active' : '')}">
                ${q.completed ? '✓' : '○'} ${q.title}
            </div>
        `).join('');
        document.getElementById('questList').innerHTML = listHtml;
        
        const objText = `${this.currentQuest.title}\n${this.currentQuest.description}`;
        document.getElementById('objectiveText').textContent = objText;
    }

    tryInteract() {
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionCooldown) return;
        this.lastInteractionTime = now;

        // Find nearby interactibles
        let closest = null;
        let minDist = this.interactionDistance;
        
        this.interactibles.forEach(item => {
            const dist = this.bearPosition.distanceTo(item.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        });

        if (closest) {
            closest.action();
        }
    }

    interactWithNPC(npc) {
        const dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
        this.showDialogue(npc.name, dialogue);
    }

    showDialogue(character, text) {
        const charDiv = document.getElementById('dialogueCharacter');
        const textDiv = document.getElementById('dialogueText');
        const dialogueBox = document.getElementById('dialogueBox');
        
        charDiv.textContent = character;
        textDiv.textContent = text;
        dialogueBox.classList.add('active');
        
        setTimeout(() => {
            dialogueBox.classList.remove('active');
        }, 4000);
    }

    chasePigeon(pigeon) {
        this.showDialogue('Bear', 'SQUAWK! Bear chases the pigeon!');
        // Pigeon flies away
        pigeon.position.y += 2;
        pigeon.velocity.x += (Math.random() - 0.5) * 0.2;
        pigeon.velocity.z += (Math.random() - 0.5) * 0.2;
    }

    togglePause() {
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.toggle('active');
        this.isPaused = !this.isPaused;
    }

    resumeGame() {
        document.getElementById('pauseMenu').classList.remove('active');
        this.isPaused = false;
    }

    resetGame() {
        location.reload();
    }

    setupMobileControls() {
        document.getElementById('joystick').classList.add('active');
        document.getElementById('actionButtons').classList.add('active');
        
        const joystick = document.getElementById('joystick');
        const thumb = document.getElementById('joystickThumb');
        
        let isDragging = false;
        const radius = 50;
        
        joystick.addEventListener('touchstart', (e) => {
            isDragging = true;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > radius) {
                dx = (dx / dist) * radius;
                dy = (dy / dist) * radius;
            }
            
            thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            this.mobileJoystickX = dx / radius;
            this.mobileJoystickY = dy / radius;
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
            thumb.style.transform = 'translate(-50%, -50%)';
            this.mobileJoystickX = 0;
            this.mobileJoystickY = 0;
        });
    }

    updateBearMovement() {
        if (this.isPaused) return;

        // Desktop controls
        let moveX = 0;
        let moveZ = 0;
        
        if (this.keys['w']) moveZ -= 1;
        if (this.keys['s']) moveZ += 1;
        if (this.keys['a']) moveX -= 1;
        if (this.keys['d']) moveX += 1;
        
        // Mobile joystick
        if (this.mobileJoystickX !== undefined) {
            moveX += this.mobileJoystickX;
            moveZ -= this.mobileJoystickY;
        }
        
        if (moveX !== 0 || moveZ !== 0) {
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            moveX /= length;
            moveZ /= length;
            
            this.bearRotation = Math.atan2(moveX, -moveZ);
            this.bear.rotation.y = this.bearRotation;
        }
        
        this.bearVelocity.x = moveX * this.bearSpeed;
        this.bearVelocity.z = moveZ * this.bearSpeed;
        
        this.bearPosition.add(this.bearVelocity);
        
        // Clamp to world bounds
        this.bearPosition.x = Math.max(-95, Math.min(95, this.bearPosition.x));
        this.bearPosition.z = Math.max(-95, Math.min(95, this.bearPosition.z));
        
        this.bear.position.copy(this.bearPosition);
        
        // Update camera to follow bear
        const camDistance = 8;
        const camHeight = 3;
        this.camera.position.x = this.bearPosition.x + Math.sin(this.bearRotation) * camDistance;
        this.camera.position.y = this.bearPosition.y + camHeight;
        this.camera.position.z = this.bearPosition.z - Math.cos(this.bearRotation) * camDistance;
        this.camera.lookAt(this.bearPosition.x, this.bearPosition.y + 1, this.bearPosition.z);
    }

    updatePigeons() {
        this.pigeons.forEach(p => {
            p.wanderTime++;
            if (p.wanderTime > 100) {
                p.velocity.x = (Math.random() - 0.5) * 0.05;
                p.velocity.z = (Math.random() - 0.5) * 0.05;
                p.wanderTime = 0;
            }
            
            p.mesh.position.add(p.velocity);
            
            if (p.mesh.position.distanceTo(this.bearPosition) < 2) {
                p.mesh.position.y = Math.min(p.mesh.position.y + 0.1, 5);
                p.velocity.x += (Math.random() - 0.5) * 0.1;
                p.velocity.z += (Math.random() - 0.5) * 0.1;
            }
        });
    }

    updateInteractionPrompt() {
        let closest = null;
        let minDist = this.interactionDistance;
        
        this.interactibles.forEach(item => {
            const dist = this.bearPosition.distanceTo(item.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        });
        
        const prompt = document.getElementById('interactionPrompt');
        if (closest) {
            prompt.textContent = `Press E to interact with ${closest.name}`;
            prompt.style.display = 'block';
        } else {
            prompt.style.display = 'none';
        }
    }

    onWindowResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateBearMovement();
        this.updatePigeons();
        this.updateInteractionPrompt();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new BearGoesPubGame();
    game.mobileJoystickX = 0;
    game.mobileJoystickY = 0;
    game.isPaused = false;
});