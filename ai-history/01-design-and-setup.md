# AI History - 01 Design and Setup

In this session, I designed the core architecture of Wellspring.

## Prompts & Decisions
- **Prompt**: "Design a multi-tenant schema for wellness creators where creators own programs and programs own sessions. Include audit logs and idempotency for imports."
- **AI Suggestion**: Use a simple `creator_id` for isolation.
- **My Pushback**: "I need to ensure it's enforced at the data layer, not just the controller. I will add creator_id to all tables and verify with tests."
- **Decomposition**: I split the task into:
  1. Database Schema with Drizzle.
  2. Express backend with JWT and Custom Middlewares.
  3. Next.js frontend with Tailwind and dnd-kit.

## Handling Mistakes
- Encountered ESM/TS issues with `ts-node`. Switched to `tsx` for better ESM support in Node.js.
- Fixed Drizzle config syntax for latest `drizzle-kit` versions.
- Resolved type resolution issues in Jest by using `@jest/globals` and `@ts-ignore` for problematic external ESM modules.
