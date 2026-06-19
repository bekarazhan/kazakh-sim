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

export function lmat(color: number, opts: THREE.MeshLambertMaterialParameters = {}) {
  return new THREE.MeshLambertMaterial({ color, ...opts });
}

export function box(
  scene: THREE.Scene,
  w: number, h: number, d: number,
  color: number,
  x: number, y: number, z: number
): THREE.Mesh {
  return addTo(scene, new THREE.BoxGeometry(w, h, d), lmat(color), x, y, z);
}
