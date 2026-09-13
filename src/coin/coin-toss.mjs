// El bit menos significativo de un entero aleatorio decide entre dos caras iguales.
export function pickCoinSide(randomValue = crypto.getRandomValues(new Uint32Array(1))[0]) {
  return randomValue % 2 === 0 ? 'cara' : 'cruz';
}
