import { BASE_ITEM_WEIGHTS, SIZE_MULTIPLIERS } from './constants';

export function extractBaseKeyword(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  
  // Find the longest matching base weight keyword
  let bestMatch = '';
  for (const keyword of Object.keys(BASE_ITEM_WEIGHTS)) {
    if (lowerName.includes(keyword) && keyword.length > bestMatch.length) {
      bestMatch = keyword;
    }
  }
  
  return bestMatch;
}

export function estimateWeight(itemName: string, size?: string): number {
  const baseKeyword = extractBaseKeyword(itemName);
  const baseWeight = baseKeyword ? BASE_ITEM_WEIGHTS[baseKeyword] : 100; // Default 100g if no match
  
  if (!size) {
    return baseWeight;
  }
  
  const sizeKey = size.toLowerCase();
  const multiplier = SIZE_MULTIPLIERS[sizeKey] || 1.0;
  
  return Math.round(baseWeight * multiplier);
}
