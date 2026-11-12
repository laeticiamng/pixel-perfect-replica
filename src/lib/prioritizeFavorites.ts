/** Stable ordering: known people first, but never exclude anyone eligible. */
export function prioritizeFavorites<T extends { id: string }>(
  people: readonly T[],
  favoriteIds: readonly string[],
): T[] {
  const favorites = new Set(favoriteIds);
  return people.map((person, index) => ({ person, index }))
    .sort((a, b) =>
      Number(favorites.has(b.person.id)) - Number(favorites.has(a.person.id))
      || a.index - b.index
    )
    .map(({ person }) => person);
}
