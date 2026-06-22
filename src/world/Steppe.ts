import * as THREE from 'three';
import { steppeGroundTexture, grassTuftTexture } from '../utils/TextureFactory';

export class Steppe {
  private timeUniform = { value: 0 };

  constructor(scene: THREE.Scene) {
    this.addGround(scene);
    this.addGrass(scene);
  }

  update(t: number) {
    this.timeUniform.value = t;
  }

  private addGround(scene: THREE.Scene) {
    // Large flat steppe ground — completely flat to prevent grass levitation
    const geo = new THREE.PlaneGeometry(900, 900, 4, 4);
    geo.computeVertexNormals();

    const groundTex = steppeGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.95,
      metalness: 0.02
    });

    const ground = new THREE.Mesh(geo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  private addGrass(scene: THREE.Scene) {
    const numTufts = 8000;
    const grassTex = grassTuftTexture();

    // Simplex 2D noise implementation in GLSL to drive organic wind waves and color variations
    const simplexNoiseGLSL = `
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
      + i.x + vec3(0.0, i1.x, 1.0) );
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0 * vec3(x0.x, x12.xz) + h * vec3(x0.y, x12.yw);
      vec3 Recip = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      m *= Recip;
      return 130.0 * dot(m, g);
    }
    `;

    // ── Wind & Color Shader Modifier ─────────────────────────────────────
    // Injects uTime uniform, sways vertices based on height and noise, and applies base-to-tip PBR color wave gradient
    const setupShader = (shader: any) => {
      shader.uniforms.uTime = this.timeUniform;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform float uTime;
        varying float vGrassHeightFactor;
        varying vec3 vWorldPosition;
        ${simplexNoiseGLSL}
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        
        // Calculate grass height factor (0.0 at base to 1.0 at tip)
        vGrassHeightFactor = position.y / 0.70;
        
        // Calculate world position of the instance (pivot point is at local origin)
        vec3 instanceWorldPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vWorldPosition = instanceWorldPos;
        
        // Constant wind direction vector (from North-West to South-East)
        vec2 windDir = normalize(vec2(1.0, 0.6));
        
        // Wind speed and dual-layered Simplex Noise Wind
        float windSpeed = 1.3;
        // Scroll noise coordinate along the wind direction to make the wind waves travel in the wind direction
        vec2 scroll = windDir * uTime * windSpeed;
        vec2 windCoords1 = instanceWorldPos.xz * 0.02 - scroll;
        vec2 windCoords2 = instanceWorldPos.xz * 0.08 - scroll * 1.5;
        
        // Combine low-frequency gusts and high-frequency turbulence
        float noise1 = snoise(windCoords1);
        float noise2 = snoise(windCoords2);
        float windNoise = noise1 * 0.72 + noise2 * 0.28;
        
        // Map noise to a positive wind force [0.18, 0.48] to keep the grass bent under wind
        float windForce = 0.18 + (windNoise * 0.5 + 0.5) * 0.30;
        
        // Height factor: base stays anchored (0.0), tip sways most (1.0)
        float bend = vGrassHeightFactor * vGrassHeightFactor;
        
        // Displace vertex in the wind direction
        transformed.x += windDir.x * windForce * bend;
        transformed.z += windDir.y * windForce * bend;
        
        // Add lateral turbulence (perpendicular to wind) for organic variety
        vec2 windRight = vec2(-windDir.y, windDir.x);
        float lateralSway = noise2 * 0.07 * bend;
        transformed.x += windRight.x * lateralSway;
        transformed.z += windRight.y * lateralSway;
        
        // Bend downwards slightly to preserve blade length under strong wind
        transformed.y -= (windForce * windForce + lateralSway * lateralSway) * 0.22 * bend;
        `
      );

      if (shader.fragmentShader.indexOf('#include <map_fragment>') !== -1) {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          varying float vGrassHeightFactor;
          varying vec3 vWorldPosition;
          ${simplexNoiseGLSL}
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          #include <map_fragment>
          
          // Color variation across the steppe using low-frequency simplex noise
          float colorNoise = snoise(vWorldPosition.xz * 0.015);
          
          // Warm/cool color shifting for grass tips (waves of light yellow-green and deep forest green)
          vec3 shiftedTip = mix(diffuseColor.rgb * 0.82, diffuseColor.rgb * 1.14 + vec3(0.08, 0.06, 0.0), colorNoise * 0.5 + 0.5);
          
          // Deep root color for fake ambient occlusion (AO)
          vec3 rootColor = shiftedTip * 0.12;
          
          // Blend root to tip color based on height
          vec3 grassBaseColor = mix(rootColor, shiftedTip, vGrassHeightFactor);
          
          // Apply color gradient to diffuseColor (preserves texture details/shadow lines)
          diffuseColor.rgb = grassBaseColor;
          `
        );
      }
    };

    // 1. Rich meadow-green (standard steppe color)
    const grassMat1 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x6aaa38,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });
    grassMat1.onBeforeCompile = setupShader;
    grassMat1.customProgramCacheKey = () => 'wind-grass-std';

    // 2. Lighter yellow-green (sunlit steppe grass)
    const grassMat2 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x8dc44a,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });
    grassMat2.onBeforeCompile = setupShader;
    grassMat2.customProgramCacheKey = () => 'wind-grass-std';

    // 3. Deep forest green (dense/sheltered grass)
    const grassMat3 = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x4d7a26,
      alphaTest: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 1.0,
      metalness: 0.0
    });
    grassMat3.onBeforeCompile = setupShader;
    grassMat3.customProgramCacheKey = () => 'wind-grass-std';

    // Custom depth material to make shadows sway in sync with the grass mesh
    const depthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 0.5,
      map: grassTex
    });
    depthMat.onBeforeCompile = setupShader;
    depthMat.customProgramCacheKey = () => 'wind-grass-depth';

    // Geometry segmented 1x4 vertically so it bends smoothly in a curve
    const grassGeo = new THREE.PlaneGeometry(0.5, 0.7, 1, 4);
    grassGeo.translate(0, 0.35, 0); // Pivot at bottom

    // Calculate dynamic capacity to handle random distribution of instances per material with a safety buffer
    const capacity = Math.ceil(numTufts / 3) + 300;

    // Create 3 separate instanced meshes to render three different color variations
    const instMeshes1 = [
      new THREE.InstancedMesh(grassGeo, grassMat1, capacity),
      new THREE.InstancedMesh(grassGeo, grassMat2, capacity),
      new THREE.InstancedMesh(grassGeo, grassMat3, capacity)
    ];
    const instMeshes2 = [
      new THREE.InstancedMesh(grassGeo, grassMat1, capacity),
      new THREE.InstancedMesh(grassGeo, grassMat2, capacity),
      new THREE.InstancedMesh(grassGeo, grassMat3, capacity)
    ];
    
    instMeshes1.forEach(m => {
      m.castShadow = true;
      m.receiveShadow = true;
      m.customDepthMaterial = depthMat;
    });
    instMeshes2.forEach(m => {
      m.castShadow = true;
      m.receiveShadow = true;
      m.customDepthMaterial = depthMat;
    });

    const dummy = new THREE.Object3D();
    const counts = [0, 0, 0];

    for (let i = 0; i < numTufts; i++) {
      const matIdx = Math.floor(Math.random() * 3);
      const instIdx = counts[matIdx];
      counts[matIdx]++;

      const ang = Math.random() * Math.PI * 2;
      const d   = 9.0 + Math.random() * 92; // keep well clear of yurt wall (YURT_R=5.2m + margin)
      const x = Math.cos(ang) * d;
      const z = Math.sin(ang) * d;
      const y = 0.01; // tiny offset above ground to prevent z-fighting

      const rot = Math.random() * Math.PI;
      const scale = 0.65 + Math.random() * 0.6; // organic sizing variation

      // Plane 1
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rot, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instMeshes1[matIdx].setMatrixAt(instIdx, dummy.matrix);

      // Plane 2 (rotated by 90 degrees)
      dummy.rotation.set(0, rot + Math.PI / 2, 0);
      dummy.updateMatrix();
      instMeshes2[matIdx].setMatrixAt(instIdx, dummy.matrix);
    }

    // Set actual active count to avoid rendering uninitialized instances at origin
    instMeshes1.forEach((m, i) => { m.count = counts[i]; m.instanceMatrix.needsUpdate = true; });
    instMeshes2.forEach((m, i) => { m.count = counts[i]; m.instanceMatrix.needsUpdate = true; });

    instMeshes1.forEach(m => scene.add(m));
    instMeshes2.forEach(m => scene.add(m));
  }
}
