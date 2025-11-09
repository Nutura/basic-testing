// Set up console spy before any mocks
const originalConsoleLog = console.log;
console.log = jest.fn((...args: unknown[]) => {
  originalConsoleLog.apply(console, args);
}) as typeof console.log;

jest.mock('./index', () => {
  const originalModule =
    jest.requireActual<typeof import('./index')>('./index');
  return {
    ...originalModule,
    mockOne: jest.fn(),
    mockTwo: jest.fn(),
    mockThree: jest.fn(),
  };
});

import { mockOne, mockTwo, mockThree, unmockedFunction } from './index';

describe('partial mocking', () => {
  afterAll(() => {
    jest.unmock('./index');
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    (console.log as jest.Mock).mockClear();
  });

  test('mockOne, mockTwo, mockThree should not log into console', () => {
    mockOne();
    mockTwo();
    mockThree();

    expect(console.log).not.toHaveBeenCalled();
  });

  test('unmockedFunction should log into console', () => {
    unmockedFunction();

    expect(console.log).toHaveBeenCalledWith('I am not mocked');
  });
});
