/**
 * IdentityService 使用示例
 * 演示如何使用带有缓存的身份解析服务
 */

import dotenv from 'dotenv';
import { IdentityService } from '../src';

// 加载环境变量
dotenv.config();

async function identityServiceDemo(): Promise<void> {
  console.log('=== IdentityService 缓存示例 ===\n');

  // 创建服务，设置 10 分钟缓存
  const identityService = new IdentityService({
    cacheTTL: 10 * 60 * 1000
  });

  const authToken = process.env.OASISBIO_AUTH_TOKEN;

  try {
    console.log('1. 第一次获取用户资料（应该调用 API）...');
    const profile1 = await identityService.resolveIdentity(authToken);
    console.log('✓ 获取成功:', profile1.profile.displayName);
    console.log('  - 当前缓存大小:', identityService.getCacheSize());
    console.log();

    console.log('2. 第二次获取（应该使用缓存）...');
    const profile2 = await identityService.resolveIdentity(authToken);
    console.log('✓ 从缓存获取:', profile2.profile.displayName);
    console.log();

    console.log('3. 强制刷新（忽略缓存）...');
    const profile3 = await identityService.resolveIdentity(authToken, true);
    console.log('✓ 强制刷新成功:', profile3.profile.displayName);
    console.log();

    console.log('4. 更新资料（自动清除缓存）...');
    const updateResult = await identityService.updateProfile(
      { displayName: '更新后的名字' },
      authToken
    );
    console.log('✓ 更新成功:', updateResult.message);
    console.log('  - 更新后的显示名:', updateResult.profile.displayName);
    console.log();

    console.log('5. 清除特定用户的缓存...');
    identityService.invalidateCache(authToken);
    console.log('✓ 已清除特定用户缓存');
    console.log('  - 当前缓存大小:', identityService.getCacheSize());
    console.log();

    console.log('6. 清除所有缓存...');
    identityService.clearAllCache();
    console.log('✓ 已清除所有缓存');
    console.log('  - 当前缓存大小:', identityService.getCacheSize());
    console.log();

    console.log('示例运行完成！');

  } catch (error) {
    console.error('✗ 示例运行失败:', error);
  }
}

// 运行示例
identityServiceDemo().catch(console.error);
