/**
 * Modelo 3D de Presente para Amigo Secreto
 * Este arquivo cria e anima um modelo 3D de presente usando Three.js
 */

class PresentModel {
    constructor(scene, position = { x: 0, y: 0, z: 0 }, size = 1) {
        this.scene = scene;
        this.position = position;
        this.size = size;
        this.present = null;
        this.ribbonColor = 0xBA55D3; // Lilás
        this.boxColor = 0x9370DB;    // Roxo
        
        this.init();
    }
    
    /**
     * Inicializa e cria o modelo 3D do presente
     */
    init() {
        // Grupo para conter todas as partes do presente
        this.present = new THREE.Group();
        
        // Cria a caixa base do presente
        this.createBox();
        
        // Cria a fita/laço do presente
        this.createRibbon();
        
        // Posiciona o presente
        this.present.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        // Adiciona o presente à cena
        this.scene.add(this.present);
    }
    
    /**
     * Cria a caixa base do presente
     */
    createBox() {
        // Geometria da caixa
        const boxGeometry = new THREE.BoxGeometry(
            this.size,
            this.size,
            this.size
        );
        
        // Material com brilho e reflexo
        const boxMaterial = new THREE.MeshPhongMaterial({
            color: this.boxColor,
            shininess: 50,
            specular: 0xffffff,
            flatShading: false
        });
        
        // Cria a malha da caixa
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        
        // Adiciona sombras
        box.castShadow = true;
        box.receiveShadow = true;
        
        // Adiciona a caixa ao grupo do presente
        this.present.add(box);
    }
    
    /**
     * Cria o laço e as fitas do presente
     */
    createRibbon() {
        // Material da fita
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: this.ribbonColor,
            shininess: 80,
            specular: 0xffffff
        });
        
        // Cria as fitas horizontais
        const horizontalSize = this.size * 1.02;
        const ribbonThickness = this.size * 0.1;
        
        // Fita horizontal X
        const ribbonXGeometry = new THREE.BoxGeometry(
            horizontalSize,
            ribbonThickness,
            horizontalSize
        );
        const ribbonX = new THREE.Mesh(ribbonXGeometry, ribbonMaterial);
        ribbonX.position.y = 0;
        this.present.add(ribbonX);
        
        // Fita vertical Y
        const ribbonYGeometry = new THREE.BoxGeometry(
            ribbonThickness,
            horizontalSize,
            horizontalSize
        );
        const ribbonY = new THREE.Mesh(ribbonYGeometry, ribbonMaterial);
        ribbonY.position.x = 0;
        this.present.add(ribbonY);
        
        // Fita vertical Z
        const ribbonZGeometry = new THREE.BoxGeometry(
            horizontalSize,
            horizontalSize,
            ribbonThickness
        );
        const ribbonZ = new THREE.Mesh(ribbonZGeometry, ribbonMaterial);
        ribbonZ.position.z = 0;
        this.present.add(ribbonZ);
        
        // Criar o laço no topo
        this.createBow();
    }
    
    /**
     * Cria o laço no topo do presente
     */
    createBow() {
        const bowSize = this.size * 0.4;
        const bowThickness = this.size * 0.1;
        
        // Material do laço com mais brilho
        const bowMaterial = new THREE.MeshPhongMaterial({
            color: this.ribbonColor,
            shininess: 100,
            specular: 0xffffff
        });
        
        // Criar os loops do laço
        // Loop 1
        const loop1Geometry = new THREE.TorusGeometry(
            bowSize * 0.5,
            bowThickness * 0.5,
            16,
            32,
            Math.PI * 1.5
        );
        const loop1 = new THREE.Mesh(loop1Geometry, bowMaterial);
        loop1.position.set(bowSize * 0.3, this.size * 0.5, 0);
        loop1.rotation.z = Math.PI * 0.5;
        loop1.rotation.y = Math.PI * 0.5;
        this.present.add(loop1);
        
        // Loop 2
        const loop2Geometry = new THREE.TorusGeometry(
            bowSize * 0.5,
            bowThickness * 0.5,
            16,
            32,
            Math.PI * 1.5
        );
        const loop2 = new THREE.Mesh(loop2Geometry, bowMaterial);
        loop2.position.set(-bowSize * 0.3, this.size * 0.5, 0);
        loop2.rotation.z = Math.PI * 0.5;
        loop2.rotation.y = -Math.PI * 0.5;
        this.present.add(loop2);
        
        // Centro do laço
        const centerGeometry = new THREE.SphereGeometry(bowThickness * 0.7, 16, 16);
        const center = new THREE.Mesh(centerGeometry, bowMaterial);
        center.position.set(0, this.size * 0.5, 0);
        this.present.add(center);
        
        // Pontas do laço
        // Ponta 1
        const end1Geometry = new THREE.ConeGeometry(
            bowThickness * 0.6,
            bowSize * 0.8,
            16
        );
        const end1 = new THREE.Mesh(end1Geometry, bowMaterial);
        end1.position.set(bowSize * 0.4, this.size * 0.3, bowSize * 0.2);
        end1.rotation.z = Math.PI * 0.15;
        end1.rotation.x = Math.PI * 0.2;
        this.present.add(end1);
        
        // Ponta 2
        const end2Geometry = new THREE.ConeGeometry(
            bowThickness * 0.6,
            bowSize * 0.8,
            16
        );
        const end2 = new THREE.Mesh(end2Geometry, bowMaterial);
        end2.position.set(-bowSize * 0.4, this.size * 0.3, -bowSize * 0.2);
        end2.rotation.z = -Math.PI * 0.15;
        end2.rotation.x = -Math.PI * 0.2;
        this.present.add(end2);
    }
    
    /**
     * Anima o presente com rotação e flutuação
     */
    animate(timeElapsed) {
        if (!this.present) return;
        
        // Rotação suave
        this.present.rotation.y += 0.01;
        
        // Efeito de flutuação
        const floatOffset = Math.sin(timeElapsed * 2) * 0.05;
        this.present.position.y = this.position.y + floatOffset;
        
        // Pequeno efeito de balanço
        this.present.rotation.z = Math.sin(timeElapsed * 1.5) * 0.05;
    }
    
    /**
     * Atualiza a escala do presente
     */
    updateScale(scale) {
        if (this.present) {
            this.present.scale.set(scale, scale, scale);
        }
    }
    
    /**
     * Remove o presente da cena
     */
    remove() {
        if (this.present && this.scene) {
            this.scene.remove(this.present);
            
            // Limpar geometrias e materiais
            this.present.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    object.material.dispose();
                }
            });
        }
    }
}