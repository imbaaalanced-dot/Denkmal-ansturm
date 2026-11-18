import * as THREE from 'three';

// Drei Start-Turm-Typen: vor Welle 1 auf die 4 Plaetze N/O/S/W gesetzt, danach fest.
// (Platzhalter-Balancing, dokumentiert in docs/PERKS.md + docs/ARCHITECTURE.md)

export const TOWER_TYPES = {
  bolzen: {
    icon: '🏹', name: 'Bolzenturm',
    desc: 'Einzelschuss, schnell, große Reichweite',
    cost: 10, dmg: 5, rate: 0.6, range: 8.5, splash: 0, splashRadius: 0, slow: 0, slowDur: 0,
  },
  splitter: {
    icon: '💥', name: 'Splitterturm',
    desc: 'Flächenschaden um den Trefferpunkt',
    cost: 10, dmg: 6, rate: 1.2, range: 7, splash: 0.7, splashRadius: 1.8, slow: 0, slowDur: 0,
  },
  frost: {
    icon: '❄️', name: 'Frostturm',
    desc: 'verlangsamt Gegner kurzzeitig',
    cost: 10, dmg: 2, rate: 0.9, range: 6.5, splash: 0, splashRadius: 0, slow: 0.3, slowDur: 1.5,
  },
};

const towerBodyMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.6 });
const boltHeadMat = new THREE.MeshStandardMaterial({ color: 0x7fb2ff, emissive: 0x2a5bd7, emissiveIntensity: 0.8 });
const emberHeadMat = new THREE.MeshStandardMaterial({ color: 0xff9a5a, emissive: 0xd7601d, emissiveIntensity: 0.7 });
const iceHeadMat = new THREE.MeshStandardMaterial({ color: 0xbfeaff, emissive: 0x2a7bd7, emissiveIntensity: 0.6 });

export function buildTowerMesh(typeKey) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.68, 1.7, 8), towerBodyMat);
  body.position.y = 0.85;
  let head;
  if (typeKey === 'splitter') {
    head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.52), emberHeadMat);
  } else if (typeKey === 'frost') {
    head = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), iceHeadMat);
    head.scale.y = 1.5;
  } else {
    head = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), boltHeadMat);
  }
  head.position.y = 2.05;
  group.add(body, head);
  group.userData.head = head;
  return group;
}
