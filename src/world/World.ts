import * as THREE from 'three';
import { Sky }         from './Sky';
import { Steppe }      from './Steppe';
import { Yurt }        from './Yurt';
// import { Shyrdak }     from './items/Shyrdak';
// import { Furniture }   from './items/Furniture';
import { Weapons }     from './items/Weapons';
import { Instruments } from './items/Instruments';
import { Kitchen }     from './items/Kitchen';

export class World {
  private steppe: Steppe;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, onCollidables: (meshes: THREE.Mesh[]) => void) {
    new Sky(scene, renderer);
    this.steppe = new Steppe(scene);
    new Yurt(scene, onCollidables);
    // new Shyrdak(scene);
    // new Furniture(scene);
    // new Weapons(scene);
    // new Instruments(scene);
    // new Kitchen(scene);
  }

  update(t: number, playerPos: THREE.Vector3) {
    this.steppe.update(t, playerPos);
  }
}
