import {
  setOwnership,
  getOwnership,
  removeOwnership,
  getAllOwnerships,
  getRoutesByTeam,
  clearOwnerships,
  makeKey,
} from './routeOwnership';

beforeEach(() => {
  clearOwnerships();
});

describe('makeKey', () => {
  it('should normalise method to uppercase', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setOwnership / getOwnership', () => {
  it('should store and retrieve an owner', () => {
    setOwnership('GET', '/users', { team: 'platform', contact: 'alice@example.com' });
    const owner = getOwnership('GET', '/users');
    expect(owner).toEqual({ team: 'platform', contact: 'alice@example.com' });
  });

  it('should return undefined for unknown route', () => {
    expect(getOwnership('POST', '/unknown')).toBeUndefined();
  });

  it('should overwrite existing ownership', () => {
    setOwnership('GET', '/users', { team: 'old-team' });
    setOwnership('GET', '/users', { team: 'new-team', slack: '#new-team' });
    expect(getOwnership('GET', '/users')).toEqual({ team: 'new-team', slack: '#new-team' });
  });
});

describe('removeOwnership', () => {
  it('should remove an existing ownership and return true', () => {
    setOwnership('DELETE', '/items/:id', { team: 'catalog' });
    expect(removeOwnership('DELETE', '/items/:id')).toBe(true);
    expect(getOwnership('DELETE', '/items/:id')).toBeUndefined();
  });

  it('should return false when route does not exist', () => {
    expect(removeOwnership('PATCH', '/nope')).toBe(false);
  });
});

describe('getAllOwnerships', () => {
  it('should return all stored ownerships', () => {
    setOwnership('GET', '/a', { team: 'alpha' });
    setOwnership('POST', '/b', { team: 'beta' });
    const all = getAllOwnerships();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toEqual({ team: 'alpha' });
    expect(all['POST:/b']).toEqual({ team: 'beta' });
  });
});

describe('getRoutesByTeam', () => {
  it('should return routes belonging to a specific team', () => {
    setOwnership('GET', '/orders', { team: 'commerce' });
    setOwnership('POST', '/orders', { team: 'commerce' });
    setOwnership('GET', '/users', { team: 'identity' });
    const routes = getRoutesByTeam('commerce');
    expect(routes).toHaveLength(2);
    expect(routes).toContain('GET:/orders');
    expect(routes).toContain('POST:/orders');
  });

  it('should return empty array when team has no routes', () => {
    expect(getRoutesByTeam('ghost-team')).toEqual([]);
  });
});

describe('clearOwnerships', () => {
  it('should remove all stored ownerships', () => {
    setOwnership('GET', '/x', { team: 'x-team' });
    clearOwnerships();
    expect(getAllOwnerships()).toEqual({});
  });
});
