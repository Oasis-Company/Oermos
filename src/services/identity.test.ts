import { IdentityService } from './identity';
import { OasisBioClient } from '../client';
import { GetProfileResponse, UpdateProfileResponse } from '../types';

// Mock OasisBioClient
jest.mock('../client');

const MockOasisBioClient = OasisBioClient as jest.MockedClass<typeof OasisBioClient>;

describe('IdentityService', () => {
  let service: IdentityService;
  let mockClient: jest.Mocked<OasisBioClient>;

  const mockProfileResponse: GetProfileResponse = {
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

  const mockUpdateResponse: UpdateProfileResponse = {
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
    jest.clearAllMocks();
    mockClient = new OasisBioClient() as jest.Mocked<OasisBioClient>;
    MockOasisBioClient.mockImplementation(() => mockClient);
    service = new IdentityService({ cacheTTL: 60000 });
  });

  describe('resolveIdentity', () => {
    it('应该首次调用 API 获取资料', async () => {
      mockClient.getProfile.mockResolvedValueOnce(mockProfileResponse);

      const result = await service.resolveIdentity('test-token');

      expect(mockClient.getProfile).toHaveBeenCalledTimes(1);
      expect(mockClient.getProfile).toHaveBeenCalledWith({ authToken: 'test-token' });
      expect(result).toEqual(mockProfileResponse);
    });

    it('应该在缓存命中时使用缓存，不调用 API', async () => {
      mockClient.getProfile.mockResolvedValueOnce(mockProfileResponse);

      // 第一次调用
      await service.resolveIdentity('test-token');
      // 第二次调用
      const result = await service.resolveIdentity('test-token');

      expect(mockClient.getProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProfileResponse);
    });

    it('应该在 skipCache=true 时强制刷新', async () => {
      mockClient.getProfile
        .mockResolvedValueOnce(mockProfileResponse)
        .mockResolvedValueOnce({
          ...mockProfileResponse,
          user: { ...mockProfileResponse.user, name: 'Updated' }
        });

      // 第一次调用
      await service.resolveIdentity('test-token');
      // 第二次调用，跳过缓存
      const result = await service.resolveIdentity('test-token', true);

      expect(mockClient.getProfile).toHaveBeenCalledTimes(2);
      expect(result.user.name).toBe('Updated');
    });

    it('应该在 API 失败时使用缓存作为降级', async () => {
      mockClient.getProfile
        .mockResolvedValueOnce(mockProfileResponse)
        .mockRejectedValueOnce(new Error('API failed'));

      // 第一次调用 - 成功
      await service.resolveIdentity('test-token');
      // 第二次调用 - API 失败，应该返回缓存
      const result = await service.resolveIdentity('test-token');

      expect(mockClient.getProfile).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProfileResponse);
    });

    it('没有缓存时应该抛出错误', async () => {
      mockClient.getProfile.mockRejectedValueOnce(new Error('API failed'));

      await expect(service.resolveIdentity('test-token')).rejects.toThrow('API failed');
    });

    it('应该正确处理匿名用户', async () => {
      mockClient.getProfile.mockResolvedValueOnce(mockProfileResponse);

      const result = await service.resolveIdentity();

      expect(mockClient.getProfile).toHaveBeenCalledWith({ authToken: undefined });
      expect(result).toEqual(mockProfileResponse);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      displayName: 'Updated Name',
      bio: 'New bio'
    };

    it('应该更新资料并清除缓存', async () => {
      mockClient.updateProfile.mockResolvedValueOnce(mockUpdateResponse);

      // 先缓存一些数据
      mockClient.getProfile.mockResolvedValueOnce(mockProfileResponse);
      await service.resolveIdentity('test-token');

      // 更新资料
      const result = await service.updateProfile(updateData, 'test-token');

      expect(mockClient.updateProfile).toHaveBeenCalledWith(updateData, { authToken: 'test-token' });
      expect(result).toEqual(mockUpdateResponse);

      // 验证缓存已清除，下次调用会再次请求 API
      mockClient.getProfile.mockResolvedValueOnce({
        ...mockProfileResponse,
        user: { ...mockProfileResponse.user, name: 'Updated' }
      });
      await service.resolveIdentity('test-token');
      expect(mockClient.getProfile).toHaveBeenCalledTimes(2);
    });

    it('更新失败时不应该清除缓存', async () => {
      mockClient.getProfile.mockResolvedValueOnce(mockProfileResponse);
      mockClient.updateProfile.mockRejectedValueOnce(new Error('Update failed'));

      // 先缓存数据
      await service.resolveIdentity('test-token');

      // 尝试更新，应该失败
      await expect(service.updateProfile(updateData, 'test-token')).rejects.toThrow('Update failed');

      // 验证缓存仍然有效
      mockClient.getProfile.mockClear();
      const result = await service.resolveIdentity('test-token');
      expect(mockClient.getProfile).not.toHaveBeenCalled();
      expect(result).toEqual(mockProfileResponse);
    });
  });

  describe('缓存管理', () => {
    it('invalidateCache 应该清除特定用户的缓存', async () => {
      mockClient.getProfile.mockResolvedValue(mockProfileResponse);

      await service.resolveIdentity('token-1');
      await service.resolveIdentity('token-2');

      service.invalidateCache('token-1');

      // token-1 应该重新请求
      mockClient.getProfile.mockClear();
      await service.resolveIdentity('token-1');
      await service.resolveIdentity('token-2');

      expect(mockClient.getProfile).toHaveBeenCalledTimes(1);
    });

    it('clearAllCache 应该清除所有缓存', async () => {
      mockClient.getProfile.mockResolvedValue(mockProfileResponse);

      await service.resolveIdentity('token-1');
      await service.resolveIdentity('token-2');

      service.clearAllCache();

      mockClient.getProfile.mockClear();
      await service.resolveIdentity('token-1');
      await service.resolveIdentity('token-2');

      expect(mockClient.getProfile).toHaveBeenCalledTimes(2);
    });

    it('getCacheSize 应该返回当前缓存大小', async () => {
      mockClient.getProfile.mockResolvedValue(mockProfileResponse);

      expect(service.getCacheSize()).toBe(0);

      await service.resolveIdentity('token-1');
      expect(service.getCacheSize()).toBe(1);

      await service.resolveIdentity('token-2');
      expect(service.getCacheSize()).toBe(2);
    });
  });

  describe('配置', () => {
    it('应该使用默认 TTL', () => {
      const serviceWithDefaultTTL = new IdentityService();
      expect(serviceWithDefaultTTL).toBeDefined();
    });

    it('应该接受自定义 TTL 配置', () => {
      const customTTL = 30000;
      const serviceWithCustomTTL = new IdentityService({ cacheTTL: customTTL });
      expect(serviceWithCustomTTL).toBeDefined();
    });
  });
});
