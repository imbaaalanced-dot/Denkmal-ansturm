import * as THREE from 'three';

// Vier Start-Turm-Typen: vor Welle 1 auf die 4 Plaetze N/O/S/W gesetzt, danach fest
// (Ausbau/Verkauf mitten im Run siehe TOWER_UPGRADES + Game.openTower).
// Kosten sind bewusst gestaffelt: Die Aufbau-Phase ist eine echte Wirtschafts-Entscheidung.
// (Balancing dokumentiert in docs/TOWERS.md + docs/ARCHITECTURE.md)

export const TOWER_TYPES = {
  bolzen: {
    icon: '🏹', name: 'Bolzenturm',
    desc: 'Einzelschuss, schnell, grosse Reichweite',
    cost: 10, dmg: 5, rate: 0.6, range: 8.5, splash: 0, splashRadius: 0, slow: 0, slowDur: 0, chain: 0, chainRadius: 0,
  },
  splitter: {
    icon: '💥', name: 'Splitterturm',
    desc: 'Flaechenschaden um den Trefferpunkt',
    cost: 14, dmg: 6, rate: 1.2, range: 7, splash: 0.7, splashRadius: 1.8, slow: 0, slowDur: 0, chain: 0, chainRadius: 0,
  },
  frost: {
    icon: '❄️', name: 'Frostturm',
    desc: 'verlangsamt Gegner kurzzeitig (Flug/Elites nur halb so stark)',
    cost: 12, dmg: 2, rate: 0.9, range: 6.5, splash: 0, splashRadius: 0, slow: 0.3, slowDur: 1.5, chain: 0, chainRadius: 0,
  },
  blitz: {
    icon: '⚡', name: 'Kettenblitz',
    desc: 'schlaegt auf bis zu 3 Ziele ueber (je Sprung 70 % Schaden)',
    cost: 16, dmg: 4, rate: 1.4, range: 7.5, splash: 0, splashRadius: 0, slow: 0, slowDur: 0, chain: 2, chainRadius: 3.2,
  },
};

// Turm-Upgrades mitten im Run (ueber das Turm-Panel): 3 Werte, je max. 3 Stufen.
// Kosten steigen pro Stufe um den Faktor 1.8 auf die Turm-Basis-Kosten.
export const TOWER_UPGRADES = [
  { key: 'dmg', icon: '🔥', name: 'Geschaerft', max: 3,
    cost: (t) => Math.round(t.baseCost * Math.pow(1.8, t.lv.dmg)),
    desc: (t) => 'Schaden ' + Math.round(t.dmg * (1 + 0.35 * t.lv.dmg)) + ' -> ' + Math.round(t.dmg * (1 + 0.35 * (t.lv.dmg + 1))) },
  { key: 'rate', icon: '⚡', name: 'Schnellfeuer', max: 3,
    cost: (t) => Math.round(t.baseCost * Math.pow(1.8, t.lv.rate)),
    desc: (t) => 'Schuesse/s ' + (1 / (t.rate * Math.pow(0.85, t.lv.rate))).toFixed(1) + ' -> ' + (1 / (t.rate * Math.pow(0.85, t.lv.rate + 1))).toFixed(1) },
  { key: 'range', icon: '🎯', name: 'Weitsicht', max: 3,
    cost: (t) => Math.round(t.baseCost * Math.pow(1.8, t.lv.range)),
    desc: (t) => 'Reichweite ' + (t.range + 0.8 * t.lv.range).toFixed(1) + ' -> ' + (t.range + 0.8 * (t.lv.range + 1)).toFixed(1) },
];

// Verkauf mitten im Run erstattet einen Anteil der investierten Energie (Kosten + Upgrades).
export const SELL_REFUND = 0.7;

const towerBodyMat = new THREE.MeshStandardMaterial({ color: 0x584a3e, roughness: 0.6 });
const boltHeadMat = new THREE.MeshStandardMaterial({ color: 0xffd76a, emissive: 0xb8862a, emissiveIntensity: 0.9 });
const emberHeadMat = new THREE.MeshStandardMaterial({ color: 0xff9a5a, emissive: 0xd7601d, emissiveIntensity: 0.7 });
const iceHeadMat = new THREE.MeshStandardMaterial({ color: 0xbfeaff, emissive: 0x2a7bd7, emissiveIntensity: 0.6 });
const boltChainMat = new THREE.MeshStandardMaterial({ color: 0xcfd8ff, emissive: 0x5a5ae0, emissiveIntensity: 1.1 });

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
  } else if (typeKey === 'blitz') {
    head = new THREE.Mesh(new THREE.TetrahedronGeometry(0.55), boltChainMat);
  } else {
    head = new THREE.Mesh(new THREE.OctahedronGeometry(0.45), boltHeadMat);
  }
  head.position.y = 2.05;
  group.add(body, head);
  group.userData.head = head;
  return group;
}
