import { arrBunker } from '@/app/_data/data';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randAge = () => Math.floor(Math.random() * 83) + 18; // 18–100

export function generateUser(name = 'Игрок') {
  return {
    name,
    age: randAge(),
    gender: pick(arrBunker.gender),
    race: pick(arrBunker.race),
    profession: pick(arrBunker.profession),
    health: pick(arrBunker.health),
    psychology: pick(arrBunker.psychology),
    item: pick(arrBunker.item),
    hobby: pick(arrBunker.hobby),
    fear: pick(arrBunker.fear),
    secret: pick(arrBunker.secret),
    relationship: pick(arrBunker.relationship),
    trait: pick(arrBunker.trait),
    ability: pick(arrBunker.ability)
  };
}
