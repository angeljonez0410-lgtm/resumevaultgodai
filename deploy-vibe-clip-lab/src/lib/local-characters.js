const LOCAL_CHARACTERS_KEY = 'resumevault_local_characters_v1';

export function getLocalCharacters() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_CHARACTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCharacters(characters) {
  if (typeof window === 'undefined') return characters;
  window.localStorage.setItem(LOCAL_CHARACTERS_KEY, JSON.stringify(characters));
  return characters;
}

export function upsertLocalCharacter(character) {
  const characters = getLocalCharacters();
  const now = new Date().toISOString();
  const nextCharacter = {
    ...character,
    id: character.id || `local-${Date.now()}`,
    created_date: character.created_date || now,
    updated_date: now,
    status: character.status || 'ready',
  };
  const existingIndex = characters.findIndex(item => item.id === nextCharacter.id);
  const nextCharacters = existingIndex >= 0
    ? characters.map(item => item.id === nextCharacter.id ? nextCharacter : item)
    : [nextCharacter, ...characters];

  saveLocalCharacters(nextCharacters);
  return nextCharacter;
}

export function deleteLocalCharacter(characterId) {
  const nextCharacters = getLocalCharacters().filter(character => character.id !== characterId);
  saveLocalCharacters(nextCharacters);
  return nextCharacters;
}
