import { OasisBioClient, OasisBioApiError, OasisBioNetworkError } from './oasisbio';
import { oasisBioConfig } from '../config';

// Mock config
jest.mock('../config', () => ({
  oasisBioConfig: {
    apiUrl: 'https://test-api.example.com'
  }
}));

describe('OasisBioClient', () => {
  let client: OasisBioClient;
  let mockFetch: jest.Mock;

  const mockGetProfileResponse = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com'
    },
    profile: {
      id: 'profile-1',
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: null,
      bio: null,
      website: null,
      locale: 'en',
      defaultLanguage: 'en'
    }
  };

  const mockUpdateProfileResponse = {
    message: 'Profile updated successfully',
    profile: {
      id: 'profile-1',
      username: 'testuser',
      displayName: 'Updated Name',
      avatarUrl: null,
      bio: 'New bio',
      website: null,
      locale: 'en',
      defaultLanguage: 'en'
    }
  };

  beforeEach(() => {
    client = new OasisBioClient();
    mockFetch = jest.fn();
    (global as any).fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('应该成功获取用户资料', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockGetProfileResponse)
      });

      const result = await client.getProfile();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/profile',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockGetProfileResponse);
    });

    it('应该支持认证令牌', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockGetProfileResponse)
      });

      await client.getProfile({ authToken: 'test-token' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/profile',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        }
      );
    });

    it('应该处理 API 错误响应', async () => {
      const errorResponse = { error: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      });

      await expect(client.getProfile()).rejects.toThrow(OasisBioApiError);
      await expect(client.getProfile()).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
        response: errorResponse
      });
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getProfile()).rejects.toThrow(OasisBioNetworkError);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      displayName: 'Updated Name',
      bio: 'New bio'
    };

    it('应该成功更新用户资料', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUpdateProfileResponse)
      });

      const result = await client.updateProfile(updateData);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );
      expect(result).toEqual(mockUpdateProfileResponse);
    });

    it('应该支持认证令牌', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUpdateProfileResponse)
      });

      await client.updateProfile(updateData, { authToken: 'test-token' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify(updateData)
        }
      );
    });

    it('应该处理更新失败', async () => {
      const errorResponse = { error: 'Validation failed' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      });

      await expect(client.updateProfile(updateData)).rejects.toThrow(OasisBioApiError);
    });
  });

  describe('重试逻辑', () => {
    it('应该对 5xx 错误进行重试', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValueOnce({ error: 'Server error' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValueOnce({ error: 'Server error' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockGetProfileResponse)
        });

      const result = await client.getProfile({ retries: 3 });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockGetProfileResponse);
    });

    it('不应该对 4xx 错误进行重试', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce({ error: 'Bad request' })
      });

      await expect(client.getProfile({ retries: 3 })).rejects.toThrow(OasisBioApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('应该在超过重试次数后抛出错误', async () => {
      mockFetch
        .mockResolvedValue({
          ok: false,
          status: 500,
          json: jest.fn().mockResolvedValue({ error: 'Server error' })
        });

      await expect(client.getProfile({ retries: 2 })).rejects.toThrow(OasisBioApiError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('错误类', () => {
    describe('OasisBioApiError', () => {
      it('应该正确设置错误属性', () => {
        const error = new OasisBioApiError('Test error', 400, { detail: 'test' });
        expect(error.message).toBe('Test error');
        expect(error.status).toBe(400);
        expect(error.response).toEqual({ detail: 'test' });
        expect(error.name).toBe('OasisBioApiError');
      });
    });

    describe('OasisBioNetworkError', () => {
      it('应该正确设置错误属性', () => {
        const cause = new Error('Original error');
        const error = new OasisBioNetworkError('Network failed', cause);
        expect(error.message).toBe('Network failed');
        expect(error.cause).toBe(cause);
        expect(error.name).toBe('OasisBioNetworkError');
      });

      it('应该处理无 cause 的情况', () => {
        const error = new OasisBioNetworkError('Network failed');
        expect(error.cause).toBeUndefined();
      });
    });
  });
});
