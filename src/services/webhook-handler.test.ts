import { WebhookHandler } from './webhook-handler';
import { IdentityService } from './identity';
import { WebhookEventType } from '../types';

jest.mock('./identity');

const MockIdentityService = IdentityService as jest.MockedClass<typeof IdentityService>;

describe('WebhookHandler', () => {
  let handler: WebhookHandler;
  let mockIdentityService: jest.Mocked<IdentityService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIdentityService = new IdentityService() as jest.Mocked<IdentityService>;
    MockIdentityService.mockImplementation(() => mockIdentityService);
    handler = new WebhookHandler({ identityService: mockIdentityService });
  });

  describe('handleEvent', () => {
    it('应该接收并处理 ProfileUpdated 事件', () => {
      const payload = {
        eventType: WebhookEventType.ProfileUpdated,
        timestamp: Date.now(),
        id: 'event-1',
        data: {
          userId: 'user-1',
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
        }
      };

      handler.handleEvent(payload);
      expect(mockIdentityService.clearAllCache).toHaveBeenCalledTimes(1);
    });

    it('应该接收并处理 UserCreated 事件', () => {
      const payload = {
        eventType: WebhookEventType.UserCreated,
        timestamp: Date.now(),
        id: 'event-2',
        data: {
          user: {
            id: 'user-2',
            name: 'New User',
            email: 'new@example.com'
          }
        }
      };

      handler.handleEvent(payload);
      expect(mockIdentityService.clearAllCache).toHaveBeenCalledTimes(1);
    });

    it('应该接收并处理 UserDeleted 事件', () => {
      const payload = {
        eventType: WebhookEventType.UserDeleted,
        timestamp: Date.now(),
        id: 'event-3',
        data: {
          userId: 'user-3'
        }
      };

      handler.handleEvent(payload);
      expect(mockIdentityService.clearAllCache).toHaveBeenCalledTimes(1);
    });

    it('应该拒绝无效的空 payload', () => {
      expect(() => handler.handleEvent(null as any)).toThrow('Invalid webhook payload');
    });

    it('应该拒绝没有 eventType 的 payload', () => {
      const invalidPayload = {
        timestamp: Date.now(),
        id: 'event-4'
      };
      expect(() => handler.handleEvent(invalidPayload as any)).toThrow('Invalid webhook payload');
    });

    it('应该拒绝不支持的事件类型', () => {
      const invalidEventPayload = {
        eventType: 'invalid.event',
        timestamp: Date.now(),
        id: 'event-5'
      };
      expect(() => handler.handleEvent(invalidEventPayload as any)).toThrow('Unsupported event type: invalid.event');
    });
  });
});
