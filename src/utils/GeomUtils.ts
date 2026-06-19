import * as THREE from 'three';

export function addTo(
  scene: THREE.Scene,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0, y = 0, z = 0,
  options: { castShadow?: boolean; receiveShadow?: boolean } = {}
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (options.castShadow    !== false) mesh.castShadow = true;
  if (options.receiveShadow !== false) mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

/** PBR standard material — looks much better than Lambert */
export function pmat(
  color: number,
  opts: Partial<THREE.MeshStandardMaterialParameters> = {}
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.0,
    ...opts,
  });
}

/** Keep lmat as alias to pmat for backwards compat */
export function lmat(
  color: number,
  opts: Partial<THREE.MeshStandardMaterialParameters & { side?: THREE.Side }> = {}
): THREE.MeshStandardMaterial {
  return pmat(color, opts);
}

export function box(
  scene: THREE.Scene,
  w: number, h: number, d: number,
  color: number,
  x: number, y: number, z: number,
  opts: Partial<THREE.MeshStandardMaterialParameters> = {}
): THREE.Mesh {
  return addTo(scene, new THREE.BoxGeometry(w, h, d), pmat(color, opts), x, y, z);
}
