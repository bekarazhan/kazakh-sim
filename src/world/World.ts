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
  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    new Sky(scene, renderer);
    new Steppe(scene);
    new Yurt(scene);
    // new Shyrdak(scene);
    // new Furniture(scene);
    // new Weapons(scene);
    // new Instruments(scene);
    // new Kitchen(scene);
  }
}
