/**
 * Sistema de Neve 3D Interativa
 * Implementado com Three.js usando shaders para melhor performance
 * Serve como background principal da aplicação
 */

class SnowSystem {
    constructor(scene, amount = 10000) {
        this.scene = scene;
        this.amount = amount;
        this.particleSystem = null;
        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Textura da neve
        this.snowflakeTexture = null;
        
        // Variáveis de configuração da neve
        this.width = 250;  // Aumentado para cobrir mais da tela
        this.height = 250;
        this.depth = 250;
        
        // Inicializar o sistema
        this.init();
        
        // Adicionar listener para movimento do mouse
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
    
    /**
     * Inicializa o sistema de neve
     */
    init() {
        // Carregar textura
        const textureLoader = new THREE.TextureLoader();
        this.snowflakeTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/snowflake2.png');
        
        // Criar buffer geometry para melhor performance
        const geometry = new THREE.BufferGeometry();
        
        // Arrays para armazenar posições, velocidades e tamanhos
        const positions = new Float32Array(this.amount * 3);
        const velocities = new Float32Array(this.amount * 3);
        const sizes = new Float32Array(this.amount);
        const opacities = new Float32Array(this.amount);
        
        // Inicializar valores aleatórios para cada partícula
        for (let i = 0; i < this.amount; i++) {
            // Índice do array para os valores x, y, z
            const i3 = i * 3;
            
            // Posição aleatória em um volume maior para cobrir toda a tela
            positions[i3] = (Math.random() * 2 - 1) * this.width;  // x
            positions[i3 + 1] = (Math.random() * 2 - 1) * this.height; // y
            positions[i3 + 2] = (Math.random() * 2 - 1) * this.depth; // z
            
            // Velocidade aleatória (principalmente para baixo)
            velocities[i3] = (Math.random() * 2 - 1) * 0.08;   // x (leve drift)
            velocities[i3 + 1] = -(Math.random() * 0.4 + 0.2); // y (queda)
            velocities[i3 + 2] = (Math.random() * 2 - 1) * 0.08; // z (leve drift)
            
            // Tamanho aleatório - aumentado para melhor visibilidade
            sizes[i] = Math.random() * 6 + 2;
            
            // Opacidade variável para criar profundidade
            opacities[i] = Math.random() * 0.7 + 0.3;
        }
        
        // Adicionar atributos à geometria
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        
        // Criar shader material para melhor controle e performance
        const material = new THREE.ShaderMaterial({
            uniforms: {
                texture: { value: this.snowflakeTexture },
                time: { value: 0 },
                mouseX: { value: 0 },
                mouseY: { value: 0 },
                mouseStrength: { value: 1.5 } // Aumentado para interação mais visível
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 velocity;
                uniform float time;
                uniform float mouseX;
                uniform float mouseY;
                uniform float mouseStrength;
                
                varying float vOpacity;
                
                void main() {
                    // Passar opacidade para o fragment shader
                    vOpacity = opacity;
                    
                    // Posição original
                    vec3 pos = position;
                    
                    // Aplicar velocidade com base no tempo
                    pos.y = mod(pos.y - velocity.y * time * 15.0, 250.0) - 125.0;
                    pos.x = mod(pos.x + velocity.x * time * 8.0, 250.0) - 125.0;
                    pos.z = mod(pos.z + velocity.z * time * 8.0, 250.0) - 125.0;
                    
                    // Fazer as partículas caírem em movimento de onda
                    float waveX = sin(time * 0.4 + pos.x * 0.03) * 2.5;
                    float waveZ = cos(time * 0.4 + pos.z * 0.03) * 2.5;
                    pos.x += waveX;
                    pos.z += waveZ;
                    
                    // Efeito de vento
                    pos.x += sin(time * 0.2) * 4.0;
                    
                    // Interação com o mouse - cria um campo de força mais forte
                    float dist = length(vec2(pos.x - mouseX, pos.z - mouseY));
                    float mouseEffect = 10.0 / (1.0 + dist * 0.04); // Aumentado para mais interatividade
                    vec2 mouseDir = normalize(vec2(pos.x - mouseX, pos.z - mouseY));
                    
                    // Aplicar efeito do mouse apenas se estiver próximo o suficiente
                    if (dist < 80.0) { // Aumentado o alcance
                        pos.x += mouseDir.x * mouseEffect * mouseStrength * 0.3;
                        pos.z += mouseDir.y * mouseEffect * mouseStrength * 0.3;
                    }
                    
                    // Definir tamanho da partícula com base na profundidade
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    float depth = 1.0 + (mvPosition.z / 100.0);
                    gl_PointSize = size * (350.0 / -mvPosition.z) * depth; // Aumentado para melhor visibilidade
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D texture;
                varying float vOpacity;
                
                void main() {
                    vec4 texColor = texture2D(texture, gl_PointCoord);
                    
                    // Aplicar opacidade variável
                    texColor.a *= vOpacity;
                    
                    // Adicionar brilho (branco no centro)
                    texColor.rgb += pow(1.0 - length(gl_PointCoord - vec2(0.5)), 5.0) * 0.4;
                    
                    if (texColor.a < 0.1) discard;
                    
                    gl_FragColor = texColor;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        
        // Criar sistema de partículas
        this.particles = new THREE.Points(geometry, material);
        this.particles.position.z = -150; // Posicionar mais ao fundo
        this.scene.add(this.particles);
    }
    
    /**
     * Atualiza o sistema de neve a cada frame
     */
    update(time) {
        if (!this.particles) return;
        
        // Atualizar uniforms para os shaders
        this.particles.material.uniforms.time.value = time;
        this.particles.material.uniforms.mouseX.value = this.mouseX;
        this.particles.material.uniforms.mouseY.value = this.mouseY;
        
        // Animar força da interação do mouse
        const pulseStrength = 1.2 + Math.sin(time * 2) * 0.3; // Aumentado para interação mais visível
        this.particles.material.uniforms.mouseStrength.value = pulseStrength;
    }
    
    /**
     * Manipula eventos de movimento do mouse
     */
    onMouseMove(event) {
        // Converter posição do mouse para coordenadas do espaço 3D (-1 a 1)
        this.mouseX = (event.clientX / window.innerWidth * 2 - 1) * 125; // Aumentado o alcance
        this.mouseY = -(event.clientY / window.innerHeight * 2 - 1) * 60; // Aumentado o alcance
    }
    
    /**
     * Redimensiona o sistema para o novo tamanho da tela
     */
    resize(width, height) {
        if (this.particles && this.particles.material.uniforms) {
            // Ajustar dimensões se necessário
            this.width = width || 250;
            this.height = height || 250;
        }
    }
    
    /**
     * Remove o sistema de neve da cena
     */
    remove() {
        if (this.particles && this.scene) {
            this.scene.remove(this.particles);
            
            // Limpar geometrias e materiais
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            
            if (this.snowflakeTexture) {
                this.snowflakeTexture.dispose();
            }
        }
    }
}