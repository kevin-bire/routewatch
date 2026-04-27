import {
  setMock,
  getMock,
  removeMock,
  getAllMocks,
  hasMock,
  clearMocks,
  MockConfig,
} from './routeMocking';

const sampleConfig: MockConfig = {
  statusCode: 200,
  body: { message: 'ok' },
  headers: { 'x-mock': 'true' },
  delay: 100,
};

beforeEach(() => clearMocks());

describe('setMock / getMock', () => {
  it('stores and retrieves a mock', () => {
    setMock('GET', '/users', sampleConfig);
    expect(getMock('GET', '/users')).toEqual(sampleConfig);
  });

  it('is case-insensitive for method', () => {
    setMock('get', '/items', sampleConfig);
    expect(getMock('GET', '/items')).toEqual(sampleConfig);
  });

  it('returns undefined for unknown route', () => {
    expect(getMock('POST', '/unknown')).toBeUndefined();
  });
});

describe('hasMock', () => {
  it('returns true when mock exists', () => {
    setMock('DELETE', '/resource', sampleConfig);
    expect(hasMock('DELETE', '/resource')).toBe(true);
  });

  it('returns false when mock does not exist', () => {
    expect(hasMock('PATCH', '/nope')).toBe(false);
  });
});

describe('removeMock', () => {
  it('removes an existing mock and returns true', () => {
    setMock('PUT', '/data', sampleConfig);
    expect(removeMock('PUT', '/data')).toBe(true);
    expect(getMock('PUT', '/data')).toBeUndefined();
  });

  it('returns false when mock does not exist', () => {
    expect(removeMock('GET', '/ghost')).toBe(false);
  });
});

describe('getAllMocks', () => {
  it('returns all stored mocks', () => {
    setMock('GET', '/a', { statusCode: 200, body: 'a' });
    setMock('POST', '/b', { statusCode: 201, body: 'b' });
    const all = getAllMocks();
    expect(all).toHaveLength(2);
    expect(all.map((m) => m.method)).toContain('GET');
    expect(all.map((m) => m.path)).toContain('/b');
  });

  it('returns empty array when no mocks', () => {
    expect(getAllMocks()).toEqual([]);
  });
});
