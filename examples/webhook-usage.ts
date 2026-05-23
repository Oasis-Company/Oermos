/**
 * Oermos Webhook Usage Example
 *
 * This example shows how to set up and use Oermos webhook support.
 */

import {
  IdentityService,
  WebhookHandler,
  WebhookEventType,
  createWebhookEndpoint,
} from '../src';

// 1. Initialize your IdentityService
const identityService = new IdentityService({
  cacheTTL: 5 * 60 * 1000, // 5 minutes
});

// 2. Initialize WebhookHandler
const webhookHandler = new WebhookHandler({
  identityService,
});

// 3. Register custom event handlers
webhookHandler.on(WebhookEventType.ProfileUpdated, (payload) => {
  console.log('Profile updated!', {
    userId: payload.data.userId,
    profile: payload.data.profile,
  });
});

webhookHandler.on(WebhookEventType.UserCreated, (payload) => {
  console.log('New user created!', {
    userId: payload.data.user.id,
    user: payload.data.user,
  });
});

webhookHandler.on(WebhookEventType.UserDeleted, (payload) => {
  console.log('User deleted!', {
    userId: payload.data.userId,
  });
});

// 4. Create webhook endpoint (Express example)
// Note: You need to install express to run this part
// npm install express
/*
import express from 'express';

const app = express();
app.use(express.json({ verify: (req, res, buf) => { (req as any).rawBody = buf.toString(); } }));

const webhookEndpoint = createWebhookEndpoint({
  secret: process.env.OASISBIO_WEBHOOK_SECRET || 'your-webhook-secret-here',
  handler: webhookHandler,
});

app.post('/webhook/oasisbio', webhookEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
*/

console.log('Oermos webhook handler initialized!');
console.log('Failed events:', webhookHandler.getFailedEvents());
