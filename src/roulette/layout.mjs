// Tamaño elegido para conservar los detalles del diseño durante el reparto.
import { CARD_HEIGHT_RATIO } from '../cards/card.mjs';

export const CARD_WIDTH = 150;

export function createDealPositions(total, tableWidth = 1672, tableHeight = 941) {
  if (!Number.isInteger(total) || total < 1) {
    throw new RangeError('El reparto necesita al menos una carta.');
  }

  if (!Number.isFinite(tableWidth) || tableWidth <= 0 ||
      !Number.isFinite(tableHeight) || tableHeight <= 0) {
    throw new RangeError('La mesa necesita un ancho y alto positivos.');
  }

  const positions = [];

  // Estas proporciones corresponden al anillo que contiene los signos en el fondo.
  // En ventanas pequeñas se reduce únicamente lo necesario para no cortar cartas.
  const cardHalfDiagonal = Math.hypot(
    CARD_WIDTH,
    CARD_WIDTH * CARD_HEIGHT_RATIO,
  ) / 2;
  const safeRadiusX = tableWidth / 2 - cardHalfDiagonal - 8;
  const safeRadiusY = tableHeight / 2 - cardHalfDiagonal - 8;
  const zodiacRingRadiusX = Math.min(tableWidth * 0.191, safeRadiusX);
  const zodiacRingRadiusY = Math.min(tableHeight * 0.34, safeRadiusY);

  for (let index = 0; index < total; index += 1) {
    // Hasta 12 cartas por anillo; los siguientes anillos se desplazan hacia dentro.
    const ring = Math.floor(index / 12);
    const ringStart = ring * 12;
    const cardsInRing = Math.min(12, total - ringStart);
    const angle = (index - ringStart) * Math.PI * 2 / cardsInRing - Math.PI / 2;
    const insetX = Math.min(ring * tableWidth * 0.027, zodiacRingRadiusX * 0.55);
    const insetY = Math.min(ring * tableHeight * 0.048, zodiacRingRadiusY * 0.55);

    positions.push({
      x: Math.cos(angle) * (zodiacRingRadiusX - insetX),
      y: Math.sin(angle) * (zodiacRingRadiusY - insetY),
      rotation: (index % 3 - 1) * 6,
    });
  }

  return positions;
}

export function cardTransform(x, y, rotation = 0) {
  return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
}

export function deckThickness(remaining, total) {
  return 24 * remaining / total;
}
