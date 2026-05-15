/**
 * Oermos 基础使用示例
 * 演示如何使用 OasisBioClient 直接与 API 交互
 */

import dotenv from 'dotenv';
import { OasisBioClient, OasisBioApiError, OasisBioNetworkError } from '../src';

// 加载环境变量
dotenv.config();

async function basicUsageExample(): Promise<void> {
  console.log('=== Oermos 基础使用示例 ===\n');

  const client = new OasisBioClient();
  const authToken = process.env.OASISBIO_AUTH_TOKEN;

  try {
    console.log('1. 获取用户资料...');
    const profileResponse = await client.getProfile({ 
      authToken,
      retries: 3 
    });

    console.log('✓ 获取成功:');
    console.log('  - 用户:', profileResponse.user.name);
    console.log('  - 邮箱:', profileResponse.user.email);
    console.log('  - 显示名:', profileResponse.profile.displayName);
    console.log();

    console.log('2. 更新用户资料...');
    const updateResponse = await client.updateProfile(
      {
        displayName: '新的显示名',
        bio: '这是我的个人简介'
      },
      { authToken }
    );

    console.log('✓ 更新成功:', updateResponse.message);
    console.log('  - 新的显示名:', updateResponse.profile.displayName);
    console.log();

  } catch (error) {
    console.error('✗ 操作失败:');

    if (error instanceof OasisBioApiError) {
      console.error(`  - API 错误 (${error.status}):`, error.message);
      if (error.response) {
        console.error('  - 响应详情:', JSON.stringify(error.response, null, 2));
      }
    } else if (error instanceof OasisBioNetworkError) {
      console.error('  - 网络错误:', error.message);
      if (error.cause) {
        console.error('  - 原因:', error.cause);
      }
    } else {
      console.error('  - 未知错误:', error);
    }
  }
}

// 运行示例
basicUsageExample().catch(console.error);
