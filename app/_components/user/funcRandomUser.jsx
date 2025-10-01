import { arrBunker } from '@/app/_data/data';

function FuncRandomUser() {
  function randFunc(arr) {
    const randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
  }

  function ageFunc() {
    return Math.floor(Math.random() * 100);
  }

  return (
    <div>
      <h2>Возраст: {ageFunc()}</h2>
      <p>Profession: {randFunc(arrBunker.profession)}</p>
      <p>Здоровья: {randFunc(arrBunker.health)}</p>
    </div>
  );
}

export default FuncRandomUser;
