/**
 * Sistema de Neve 3D Interativa
 * Implementado com Three.js usando shaders para melhor performance
 */

class SnowSystem {
    constructor(scene, amount = 5000) {
        this.scene = scene;
        this.amount = amount;
        this.particleSystem = null;
        this.particles = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Textura da neve
        this.snowflakeTexture = null;
        
        // Variáveis de configuração da neve
        this.width = 100;
        this.height = 100;
        this.depth = 100;
        
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
        
        // Inicializar valores aleatórios para cada partícula
        for (let i = 0; i < this.amount; i++) {
            // Índice do array para os valores x, y, z
            const i3 = i * 3;
            
            // Posição aleatória
            positions[i3] = (Math.random() * 2 - 1) * this.width;  // x
            positions[i3 + 1] = (Math.random() * 2) * this.height; // y (começando de cima)
            positions[i3 + 2] = (Math.random() * 2 - 1) * this.depth; // z
            
            // Velocidade aleatória (principalmente para baixo)
            velocities[i3] = (Math.random() * 2 - 1) * 0.05;   // x (leve drift)
            velocities[i3 + 1] = -(Math.random() * 0.3 + 0.1); // y (queda)
            velocities[i3 + 2] = (Math.random() * 2 - 1) * 0.05; // z (leve drift)
            
            // Tamanho aleatório
            sizes[i] = Math.random() * 4 + 1;
        }
        
        // Adicionar atributos à geometria
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Criar shader material para melhor controle e performance
        const material = new THREE.ShaderMaterial({
            uniforms: {
                texture: { value: this.snowflakeTexture },
                time: { value: 0 },
                mouseX: { value: 0 },
                mouseY: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                uniform float time;
                uniform float mouseX;
                uniform float mouseY;
                
                void main() {
                    // Posição original
                    vec3 pos = position;
                    
                    // Aplicar velocidade e gravidade
                    pos.y += velocity.y * time;
                    
                    // Fazer as partículas caírem em movimento de onda
                    float wave = sin(time * 0.3 + pos.x * 0.02) * 0.5;
                    pos.x += wave + velocity.x * time;
                    pos.z += velocity.z * time;
                    
                    // Interação com o mouse - cria um campo de força sutil
                    float mouseEffect = 1.0 - min(1.0, length(vec2(pos.x - mouseX, pos.z - mouseY)) / 30.0);
                    pos.y += mouseEffect * 0.2 * sin(time);
                    
                    // Reiniciar partículas quando chegam ao fundo
                    if (pos.y < -50.0) {
                        pos.y = 50.0;
                        pos.x = (random(vec2(pos.x, time)) * 2.0 - 1.0) * 50.0;
                        pos.z = (random(vec2(pos.z, time)) * 2.0 - 1.0) * 50.0;
                    }
                    
                    // Definir tamanho da partícula
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
                
                // Função auxiliar para gerar números pseudoaleatórios no shader
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }
            `,
            fragmentShader: `
                uniform sampler2D texture;
                
                void main() {
                    vec4 texColor = texture2D(texture, gl_PointCoord);
                    
                    // Adicionar brilho (branco no centro)
                    texColor.rgb += pow(1.0 - length(gl_PointCoord - vec2(0.5)), 3.0) * 0.2;
                    
                    gl_FragColor = texColor;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        
        // Criar sistema de partículas
        this.particles = new THREE.Points(geometry, material);
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
    }
    
    /**
     * Manipula eventos de movimento do mouse
     */
    onMouseMove(event) {
        // Converter posição do mouse para coordenadas do espaço 3D (-1 a 1)
        this.mouseX = (event.clientX / window.innerWidth) * 100 - 50;
        this.mouseY = -(event.clientY / window.innerHeight) * 100 + 50;
    }
    
    /**
     * Redimensiona o sistema para o novo tamanho da tela
     */
    resize() {
        // Ajustar dimensões se necessário
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