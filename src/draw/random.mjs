const UINT32_RANGE = 2 ** 32;

function readCryptoUint32() {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0];
}

// La fuente reemplazable permite probar los límites sin depender del azar.
export function createRandomInteger(readUint32 = readCryptoUint32) {
  return function randomInteger(exclusiveMaximum) {
    if (!Number.isInteger(exclusiveMaximum) ||
        exclusiveMaximum < 1 || exclusiveMaximum > UINT32_RANGE) {
      throw new RangeError('El máximo debe ser un entero entre 1 y 2^32.');
    }

    // Descartar el sobrante evita favorecer índices al aplicar el módulo.
    const acceptedLimit = UINT32_RANGE - (UINT32_RANGE % exclusiveMaximum);

    while (true) {
      const value = readUint32();

      if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
        throw new RangeError('La fuente aleatoria debe devolver un uint32.');
      }

      if (value < acceptedLimit) {
        return value % exclusiveMaximum;
      }
    }
  };
}
