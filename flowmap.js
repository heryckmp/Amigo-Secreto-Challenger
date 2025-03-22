/**
 * Flowmap Effect - Mouse Interactive Background Effect
 * Based on https://github.com/robin-dela/flowmap-effect
 */

class FlowmapEffect {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        
        // Default options
        this.options = Object.assign({
            imageUrl: 'assets/background.jpg', // Default background image
            imageSize: [1250, 833],            // Default image size
            autoResize: true,
            intensity: 0.15                    // Effect intensity
        }, options);

        // Initialize
        this.initialize();
        this.addEventListeners();
    }

    initialize() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'flowmap-canvas';
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        
        // Set up WebGL renderer
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL is not supported by your browser');
            return;
        }

        // Set up renderer properties
        this.aspect = 1;
        this.mouse = new THREE.Vector2(-1);
        this.velocity = new THREE.Vector2();
        this.dpr = window.devicePixelRatio || 1;
        
        // Load image
        this.setupImage();
        
        // Set up size and start animation
        this.resize();
        if (this.options.autoResize) {
            window.addEventListener('resize', this.resize.bind(this));
        }
        
        // Start animation
        this.animate();
    }

    setupImage() {
        // Define shaders
        this.vertex = `
            attribute vec2 uv;
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;
        
        this.fragment = `
            precision highp float;
            precision highp int;
            uniform sampler2D tWater;
            uniform sampler2D tFlow;
            uniform float uTime;
            varying vec2 vUv;
            uniform vec4 res;

            void main() {
                // R and G values are velocity in the x and y direction
                // B value is the velocity length
                vec3 flow = texture2D(tFlow, vUv).rgb;

                vec2 uv = .5 * gl_FragCoord.xy / res.xy;
                vec2 myUv = (uv - vec2(0.5)) * res.zw + vec2(0.5);
                myUv -= flow.xy * (${this.options.intensity} * 0.7);

                vec3 tex = texture2D(tWater, myUv).rgb;

                gl_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
            }
        `;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(this.dpr);
        
        // Create scene and geometry
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Create flowmap
        this.flowmap = new THREE.WebGLRenderTarget(
            512, 512, {
                type: this.gl.HALF_FLOAT_OES ? this.gl.HALF_FLOAT_OES : this.gl.UNSIGNED_BYTE,
                format: THREE.RGBAFormat,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter
            }
        );
        
        // Load texture
        const textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load(this.options.imageUrl, () => {
            this.setupMaterial();
        });
        this.texture.wrapS = this.texture.wrapT = THREE.ClampToEdgeWrapping;
    }

    setupMaterial() {
        // Create geometry
        this.geometry = new THREE.PlaneGeometry(2, 2);
        
        // Set up variables for image aspect
        const imageAspect = this.options.imageSize[1] / this.options.imageSize[0];
        let a1, a2;
        if (this.height / this.width < imageAspect) {
            a1 = 1;
            a2 = (this.height / this.width) / imageAspect;
        } else {
            a1 = (this.width / this.height) * imageAspect;
            a2 = 1;
        }
        
        // Create shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                tWater: { value: this.texture },
                res: { value: new THREE.Vector4(this.width, this.height, a1, a2) },
                tFlow: { value: this.flowmap.texture }
            },
            vertexShader: this.vertex,
            fragmentShader: this.fragment
        });
        
        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        
        // Create flowmap material
        this.flowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: this.mouse },
                uVelocity: { value: this.velocity },
                uAspect: { value: this.aspect },
                tMap: { value: this.flowmap.texture },
                uFalloff: { value: 0.5 },
                uAlpha: { value: 1.0 },
                uDissipation: { value: 0.96 }
            },
            vertexShader: `
                attribute vec2 uv;
                attribute vec2 position;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 0, 1);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D tMap;
                uniform float uFalloff;
                uniform float uAlpha;
                uniform float uDissipation;
                uniform float uAspect;
                uniform vec2 uMouse;
                uniform vec2 uVelocity;
                varying vec2 vUv;
                
                void main() {
                    vec2 cursor = vUv - uMouse;
                    vec4 color = texture2D(tMap, vUv) * uDissipation;
                    cursor.x *= uAspect;
                    vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
                    float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;
                    color.rgb = mix(color.rgb, stamp, vec3(falloff));
                    gl_FragColor = color;
                }
            `,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        
        // Create flowmap mesh
        this.flowMesh = new THREE.Mesh(this.geometry, this.flowMaterial);
    }

    resize() {
        // Get size from container
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.aspect = this.width / this.height;
        
        // Resize renderer
        this.renderer.setSize(this.width, this.height);
        
        // Update uniform if material exists
        if (this.material) {
            // Set up variables for image aspect
            const imageAspect = this.options.imageSize[1] / this.options.imageSize[0];
            let a1, a2;
            if (this.height / this.width < imageAspect) {
                a1 = 1;
                a2 = (this.height / this.width) / imageAspect;
            } else {
                a1 = (this.width / this.height) * imageAspect;
                a2 = 1;
            }
            
            // Update resolution uniform
            this.material.uniforms.res.value = new THREE.Vector4(
                this.width, 
                this.height, 
                a1, 
                a2
            );
        }
        
        if (this.flowMaterial) {
            this.flowMaterial.uniforms.uAspect.value = this.aspect;
        }
    }

    addEventListeners() {
        // Create handlers to get mouse position and velocity
        const isTouchCapable = 'ontouchstart' in window;
        
        if (isTouchCapable) {
            this.container.addEventListener('touchstart', this.updateMouse.bind(this));
            this.container.addEventListener('touchmove', this.updateMouse.bind(this), { passive: false });
        } else {
            this.container.addEventListener('mousemove', this.updateMouse.bind(this));
        }
    }

    updateMouse(e) {
        e.preventDefault();
        
        if (e.changedTouches && e.changedTouches.length) {
            e.x = e.changedTouches[0].pageX;
            e.y = e.changedTouches[0].pageY;
        }
        
        if (e.x === undefined) {
            e.x = e.pageX;
            e.y = e.pageY;
        }
        
        // Get mouse position relative to canvas
        const bounds = this.canvas.getBoundingClientRect();
        const mouseX = e.x - bounds.left;
        const mouseY = e.y - bounds.top;
        
        // Get mouse value in 0 to 1 range, with y flipped
        this.mouse.set(
            mouseX / this.width, 
            1.0 - mouseY / this.height
        );
        
        // Calculate velocity
        if (!this.lastTime) {
            // First frame
            this.lastTime = performance.now();
            this.lastMouse = new THREE.Vector2(e.x, e.y);
        }

        const deltaX = e.x - this.lastMouse.x;
        const deltaY = e.y - this.lastMouse.y;

        this.lastMouse.set(e.x, e.y);

        let time = performance.now();

        // Avoid dividing by 0
        let delta = Math.max(10.4, time - this.lastTime);
        this.lastTime = time;
        
        this.velocity.x = deltaX / delta;
        this.velocity.y = deltaY / delta;
        
        // Flag update to prevent hanging velocity values when not moving
        this.velocity.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Reset velocity when mouse not moving
        if (!this.velocity.needsUpdate) {
            this.mouse.set(-1);
            this.velocity.set(0, 0);
        }
        this.velocity.needsUpdate = false;
        
        // Update flowmap
        if (this.flowMaterial) {
            this.flowMaterial.uniforms.uMouse.value = this.mouse;
            
            // Ease velocity input, slower when fading out
            if (!this.velocity.lerp) {
                // Simple lerp implementation if not available
                this.velocity.multiplyScalar(0.9);
            } else {
                const lerpFactor = this.velocity.length() ? 0.15 : 0.1;
                this.velocity.lerp(new THREE.Vector2(0, 0), 1 - lerpFactor);
            }
            
            this.flowMaterial.uniforms.uVelocity.value = this.velocity;
            
            // Render to flowmap
            this.renderer.setRenderTarget(this.flowmap);
            this.renderer.render(this.flowMesh, this.camera);
            this.renderer.setRenderTarget(null);
        }
        
        // Update main material and render scene
        if (this.material) {
            this.material.uniforms.uTime.value = performance.now() * 0.01;
            this.renderer.render(this.scene, this.camera);
        }
    }
} 