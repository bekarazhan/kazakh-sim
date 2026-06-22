import * as THREE from 'three';
import { steppeGroundTexture, grassTuftTexture } from '../utils/TextureFactory';

export class Steppe {
  private timeUniform = { value: 0 };
  private playerPosUniform = { value: new THREE.Vector3() };

  constructor(scene: THREE.Scene) {
    this.addGround(scene);
    this.addGrass(scene);
  }

  update(t: number, playerPos?: THREE.Vector3) {
    this.timeUniform.value = t;
    if (playerPos) {
      this.playerPosUniform.value.copy(playerPos);
    }
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
    const numTufts = 12000;
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

    // ── Wind, Color & Scrolling Shader Modifier ────────────────────────────
    const setupShader = (shader: any) => {
      shader.uniforms.uTime = this.timeUniform;
      shader.uniforms.uPlayerPos = this.playerPosUniform;
      
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform float uTime;
        uniform vec3 uPlayerPos;
        varying float vGrassHeightFactor;
        varying vec3 vWorldPosition;
        ${simplexNoiseGLSL}
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        
        // Calculate world position of the instance (pivot point is at local origin)
        vec3 instanceWorldPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        
        // Wrap instance coordinates around player position in a 100x100m grid footprint
        vec3 wrappedInstancePos = instanceWorldPos;
        wrappedInstancePos.x = mod(instanceWorldPos.x - uPlayerPos.x + 50.0, 100.0) + uPlayerPos.x - 50.0;
        wrappedInstancePos.z = mod(instanceWorldPos.z - uPlayerPos.z + 50.0, 100.0) + uPlayerPos.z - 50.0;
        
        // Calculate distance from wrapped instance to player
        float distToPlayer = distance(wrappedInstancePos.xz, uPlayerPos.xz);
        
        // Fade out grass scale near the grid boundary (from 1.0 at <=40m to 0.0 at >=48m)
        float fade = smoothstep(48.0, 40.0, distToPlayer);
        
        // Calculate grass height factor (0.0 at base to 1.0 at tip)
        vGrassHeightFactor = position.y / 0.42;
        
        // Constant wind direction vector (from North-West to South-East)
        vec2 windDir = normalize(vec2(1.0, 0.6));
        
        // Wind speed and dual-layered Simplex Noise Wind
        float windSpeed = 1.3;
        vec2 scroll = windDir * uTime * windSpeed;
        vec2 windCoords1 = wrappedInstancePos.xz * 0.02 - scroll;
        vec2 windCoords2 = wrappedInstancePos.xz * 0.08 - scroll * 1.5;
        
        // Combine low-frequency gusts and high-frequency turbulence
        float noise1 = snoise(windCoords1);
        float noise2 = snoise(windCoords2);
        float windNoise = noise1 * 0.72 + noise2 * 0.28;
        
        // Map noise to a positive wind force [0.18, 0.48] to keep the grass bent under wind
        float windForce = 0.18 + (windNoise * 0.5 + 0.5) * 0.30;
        
        // Height factor: base stays anchored (0.0), tip sways most (1.0)
        float bend = vGrassHeightFactor * vGrassHeightFactor;
        
        // Displace vertex in the wind direction (scaled down to 0.40 for shorter lawn geometry)
        transformed.x += windDir.x * windForce * 0.40 * bend;
        transformed.z += windDir.y * windForce * 0.40 * bend;
        
        // Add lateral turbulence (perpendicular to wind) for organic variety (scaled down to 0.04)
        vec2 windRight = vec2(-windDir.y, windDir.x);
        float lateralSway = noise2 * 0.04 * bend;
        transformed.x += windRight.x * lateralSway;
        transformed.z += windRight.y * lateralSway;
        
        // Bend downwards slightly to preserve blade length under strong wind
        transformed.y -= (windForce * windForce + lateralSway * lateralSway) * 0.15 * bend;
        
        // Scale grass geometry to 0 near the edges to prevent popping
        transformed.xyz *= fade;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #if defined( USE_INSTANCING ) && ! defined( FORCE_SINGLE_INSTANCE )
          vec4 worldPosition = instanceMatrix * vec4( transformed, 1.0 );
        #else
          vec4 worldPosition = vec4( transformed, 1.0 );
        #endif
        worldPosition = modelMatrix * worldPosition;
        
        // Wrap worldPosition around the player position
        vec3 instanceWorldPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 wrappedInstancePos = instanceWorldPos;
        wrappedInstancePos.x = mod(instanceWorldPos.x - uPlayerPos.x + 50.0, 100.0) + uPlayerPos.x - 50.0;
        wrappedInstancePos.z = mod(instanceWorldPos.z - uPlayerPos.z + 50.0, 100.0) + uPlayerPos.z - 50.0;
        
        vec3 wrapOffset = wrappedInstancePos - instanceWorldPos;
        worldPosition.xyz += wrapOffset;
        
        vWorldPosition = worldPosition.xyz;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        vec4 mvPosition = viewMatrix * worldPosition;
        gl_Position = projectionMatrix * mvPosition;
        `
      );

      // Replace #include <common> in fragment shader to declare vWorldPosition
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vWorldPosition;
        `
      );

      // If map_fragment is present, also declare other varyings and simplex noise
      if (shader.fragmentShader.indexOf('#include <map_fragment>') !== -1) {
        shader.fragmentShader = shader.fragmentShader.replace(
          'varying vec3 vWorldPosition;',
          `
          varying vec3 vWorldPosition;
          varying float vGrassHeightFactor;
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

      // Discard fragments inside the yurt walls and door path for both color and shadow maps
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        void main() {
          // Yurt interior and door path GPU discard
          float ang = atan(vWorldPosition.z, vWorldPosition.x);
          float wallBoundary = 5.40 + sin(ang * 7.0) * 0.35 + cos(ang * 12.0) * 0.15;
          bool pathExclusion = (vWorldPosition.x > -1.2 && vWorldPosition.x < 1.2 && vWorldPosition.z > 4.8 && vWorldPosition.z < 9.5);
          if (length(vWorldPosition.xz) < wallBoundary || pathExclusion) {
            discard;
          }
        `
      );
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
    grassMat1.customProgramCacheKey = () => 'wind-grass-std-v2';

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
    grassMat2.customProgramCacheKey = () => 'wind-grass-std-v2';

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
    grassMat3.customProgramCacheKey = () => 'wind-grass-std-v2';

    // Custom depth material to make shadows sway in sync with the grass mesh
    const depthMat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 0.5,
      map: grassTex
    });
    depthMat.onBeforeCompile = setupShader;
    depthMat.customProgramCacheKey = () => 'wind-grass-depth-v2';

    // Geometry segmented 1x4 vertically so it bends smoothly - shortened to 0.4x0.42 for lawn carpet look
    const grassGeo = new THREE.PlaneGeometry(0.4, 0.42, 1, 4);
    grassGeo.translate(0, 0.21, 0); // Pivot at bottom

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

      // Distribute instances uniformly in a 100x100m grid footprint [-50, 50]
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      const y = 0.01; // tiny offset above ground to prevent z-fighting
      const rot = Math.random() * Math.PI;
      
      // Non-linear scale distribution: wide range from 0.35 to 1.55.
      // Skewed using power of 1.8 so there are many small/medium sprouts and a few tall prominent clusters.
      const scale = 0.35 + Math.pow(Math.random(), 1.8) * 1.2;

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
