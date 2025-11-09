import axios from 'axios';
import { throttledGetDataFromApi } from './index';

jest.mock('axios');

describe('throttledGetDataFromApi', () => {
  let mockGet: jest.Mock;
  let mockAxiosInstance: { get: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockGet = jest.fn().mockResolvedValue({ data: { id: 1, name: 'Test' } });
    mockAxiosInstance = { get: mockGet };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should create instance with provided base url', async () => {
    const promise = throttledGetDataFromApi('/posts/1');
    jest.runAllTimers();
    await promise;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });
  });

  test('should perform request to correct provided url', async () => {
    const promise = throttledGetDataFromApi('/posts/1');
    jest.runAllTimers();
    await promise;

    expect(mockGet).toHaveBeenCalledWith('/posts/1');
  });

  test('should return response data', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockGet.mockResolvedValue({ data: mockData });

    const promise = throttledGetDataFromApi('/posts/1');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual(mockData);
  });
});
