import { describe, expect, it } from 'vitest';
import { prioritizeFavorites } from './prioritizeFavorites';

const people = [{ id: 'new-1' }, { id: 'favorite-1' }, { id: 'new-2' }, { id: 'favorite-2' }];

describe('prioritizeFavorites', () => {
  it('shows all eligible people, favorites first, with stable order', () => {
    expect(prioritizeFavorites(people, ['favorite-1', 'favorite-2']).map(p => p.id))
      .toEqual(['favorite-1', 'favorite-2', 'new-1', 'new-2']);
  });
  it('keeps new people when favorites are offline', () => {
    expect(prioritizeFavorites(people.filter(p => p.id.startsWith('new')), ['favorite-1']).map(p => p.id))
      .toEqual(['new-1', 'new-2']);
  });
  it('does not mutate the original result set', () => {
    const original = [...people];
    prioritizeFavorites(people, ['favorite-2']);
    expect(people).toEqual(original);
  });
});
