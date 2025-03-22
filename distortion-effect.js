// Distortion Effect - Inspirado no efeito hover do site Lusion.co
class DistortionEffect {
    constructor(container) {
        this.container = container;
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.captureInterval = 2000; // Intervalo para capturar a página em ms
        this.lastCaptureTime = 0;
        
        this.initThree();
        this.setupEventListeners();
        this.capturePageContent();
        this.animate();
    }

    initThree() {
        // Configuração do Three.js
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Cria a cena
        this.scene = new THREE.Scene();
        
        // Configuração da câmera ortográfica (bom para efeitos 2D de tela cheia)
        this.camera = new THREE.OrthographicCamera(
            -this.width / 2, 
            this.width / 2, 
            this.height / 2, 
            -this.height / 2, 
            1, 
            1000
        );
        this.camera.position.z = 1;
        
        // Cria o renderizador WebGL com transparência alpha
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Estilo para o canvas do efeito
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1'; // Acima do background
        this.renderer.domElement.style.pointerEvents = 'none'; // Permite cliques nos elementos abaixo
        
        // Adiciona o canvas do renderizador ao container
        this.container.appendChild(this.renderer.domElement);
        
        // Cria uma textura temporária até que a página seja capturada
        this.createTemporaryTexture();
        
        // Cria o material de distorção com shader customizado
        this.createDistortionMaterial();
        
        // Cria o mesh com geometria planificada
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.width, this.height),
            this.material
        );
        this.scene.add(this.mesh);
    }

    createTemporaryTexture() {
        // Cria uma textura temporária simples
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        
        // Desenha um fundo gradiente (temporário)
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0B1026');
        gradient.addColorStop(0.5, '#2A2356');
        gradient.addColorStop(1, '#0B1026');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Cria a textura com este canvas
        this.pageTexture = new THREE.CanvasTexture(canvas);
    }

    capturePageContent() {
        // Captura o conteúdo da página usando html2canvas
        if (typeof html2canvas === 'undefined') {
            console.warn('html2canvas não está disponível. Usando textura simples.');
            return;
        }

        // Referência à div que contém o conteúdo principal (excluindo o próprio efeito)
        const contentElement = document.querySelector('.main-content');
        if (!contentElement) return;

        // Opções para html2canvas
        const options = {
            ignoreElements: (element) => {
                // Ignora o próprio container de distorção para evitar recursão
                return element === this.container || 
                       element.classList.contains('distortion-container') ||
                       element.parentElement === this.container;
            },
            scale: 1,
            useCORS: true,
            allowTaint: true
        };

        // Captura o conteúdo
        html2canvas(document.body, options).then(canvas => {
            // Cria uma nova textura com o canvas capturado
            if (this.pageTexture) {
                this.pageTexture.dispose(); // Libera a textura antiga
            }
            
            this.pageTexture = new THREE.CanvasTexture(canvas);
            this.material.uniforms.uTexture.value = this.pageTexture;
            this.material.needsUpdate = true;
            
            // Agenda a próxima captura (para manter a textura atualizada)
            setTimeout(() => this.capturePageContent(), this.captureInterval);
        }).catch(error => {
            console.error('Erro ao capturar a página:', error);
            setTimeout(() => this.capturePageContent(), this.captureInterval * 2); // Tenta novamente em caso de erro
        });
    }

    createDistortionMaterial() {
        // Define os shaders GLSL para criar o efeito de distorção
        const vertexShader = `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        const fragmentShader = `
            uniform sampler2D uTexture;
            uniform vec2 uMouse;
            uniform vec2 uVelocity;
            uniform vec2 uResolution;
            varying vec2 vUv;
            
            float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
                uv -= disc_center;
                float dist = sqrt(dot(uv, uv));
                return smoothstep(disc_radius + border_size, disc_radius - border_size, dist);
            }
            
            void main() {
                // Converte as coordenadas UV para o espaço da cena
                vec2 uv = vUv;
                
                // Calcula a distância do pixel atual ao mouse
                vec2 mousePos = uMouse / uResolution;
                float dist = distance(uv, mousePos);
                
                // Efeito de destaque ao redor do cursor
                float hoverRadius = 0.15; // Raio do efeito
                float hoverIntensity = smoothstep(hoverRadius, 0.0, dist) * 0.35;
                
                // Calcula a força da distorção baseada na distância
                float strength = 0.20 / (dist + 0.05);
                strength = clamp(strength, 0.0, 0.8);
                
                // Aplica a distorção com base na velocidade do mouse
                vec2 distortion = uVelocity * strength * 0.008;
                
                // Limita a distorção a uma área ao redor do cursor
                distortion *= smoothstep(0.4, 0.0, dist);
                
                // Aplica a distorção à coordenada uv
                vec2 distortedUV = uv - distortion;
                
                // Amostra a textura com as coordenadas distorcidas
                vec4 color = texture2D(uTexture, distortedUV);
                
                // Adiciona um efeito de brilho sutil ao redor do cursor
                color.rgb += vec3(0.15, 0.15, 0.5) * hoverIntensity;
                
                gl_FragColor = color;
            }
        `;
        
        // Cria o material com shaders personalizados
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: this.pageTexture },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uVelocity: { value: new THREE.Vector2(0, 0) },
                uResolution: { value: new THREE.Vector2(this.width, this.height) }
            },
            vertexShader,
            fragmentShader,
            transparent: true
        });
    }

    setupEventListeners() {
        // Monitora a posição do mouse
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Ajusta ao redimensionar a janela
        window.addEventListener('resize', this.onResize.bind(this));
    }

    onMouseMove(event) {
        // Atualiza a posição do mouse e calcula velocidade
        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        // Calcula a velocidade do movimento do mouse
        this.velocity.x = this.mouse.x - this.lastMouse.x;
        this.velocity.y = this.mouse.y - this.lastMouse.y;
    }

    onResize() {
        // Ajusta o tamanho do efeito quando a janela é redimensionada
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Atualiza a câmera
        this.camera.left = -this.width / 2;
        this.camera.right = this.width / 2;
        this.camera.top = this.height / 2;
        this.camera.bottom = -this.height / 2;
        this.camera.updateProjectionMatrix();
        
        // Atualiza o renderizador
        this.renderer.setSize(this.width, this.height);
        
        // Atualiza o tamanho do mesh
        this.mesh.geometry = new THREE.PlaneGeometry(this.width, this.height);
        
        // Atualiza a resolução no material
        this.material.uniforms.uResolution.value.set(this.width, this.height);
        
        // Força uma nova captura da página depois de redimensionar
        this.capturePageContent();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Amortece a velocidade para um efeito suave
        this.velocity.x *= 0.92;
        this.velocity.y *= 0.92;
        
        // Atualiza uniforms do shader
        this.material.uniforms.uMouse.value.set(this.mouse.x, this.height - this.mouse.y);
        this.material.uniforms.uVelocity.value.set(this.velocity.x, -this.velocity.y);
        
        // Renderiza a cena
        this.renderer.render(this.scene, this.camera);
    }
} 