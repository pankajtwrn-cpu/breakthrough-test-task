# Video Walkthrough Script: Wellspring CMS

**Total Duration**: ~5-7 Minutes
**Tone**: Professional but casual / "Pair Programmer" style.

---

## Segment 1: Running App Demo (1 Minute)

**[Screen: Show the Admin Dashboard]**
"Hey everyone, this is Wellspring—the multi-tenant CMS I've built for wellness creators. As you can see, we've gone for a premium glassmorphic UI. It’s not just for looks; it’s fully responsive and interactive."

**[Action: Create a new Program]**
"I’ll quickly create a 'Morning Yoga' program here. Transitions are smooth, and everything is reflected instantly. If I jump into the program..."

**[Action: Drag a session to reorder it]**
"I can add sessions, and we have this nice drag-and-drop reordering. This is all synced to the database in a single transaction to keep the order consistent."

---

## Segment 2: Schema & Tenant Isolation (2 Minutes)

**[Screen: Open `backend/src/db/schema.ts`]**
"Let’s look at the data layer. Everything revolves around the `creators` table, which acts as our tenant. Every single piece of data—programs, sessions, audit logs—is tied back to a `creator_id`."

**[Screen: Open `backend/drizzle/0001_enable_rls.sql`]**
"Now, the isolation isn't just in the code. I’ve implemented **PostgreSQL Row Level Security (RLS)**. You can see the policies here. Even if a bad actor manages to forge a tenant ID in the API, the database itself will block access unless the session variable matches the data."

**[Screen: Open `backend/src/middleware/auth.ts`]**
"Here is how we glue it together. In the auth middleware, we don't just verify the JWT; we get a dedicated client from the pool and run a `SET app.current_tenant` command. This scopes the database connection for the lifetime of that request. It’s hard isolation at the data layer."

---

## Segment 3: AI Usage & Fluency (1.5 Minutes)

**[Screen: Open `/ai-history` folder]**
"To build this efficiently, I used AI as a high-speed pair programmer. You can see the full logs in the `ai-history` folder. I used a decomposition strategy: I’d define the schema and logic first, then have the AI help with the boilerplate and the CSS."

"A key moment was the security implementation. The AI initially suggested basic filters in the Express routes. I pushed back and directed it to implement the RLS structure instead. This 'push-and-pull' is what I consider AI fluency—knowing when to let the tool fly and when to rein it in for security and quality."

---

## Segment 4: What I'd Do Differently (1 Minute)

**[Screen: Show the Session Modal / Media Upload part]**
"If I had more time or was moving this to production, I’d transition from this mocked S3 flow to a real AWS integration. Currently, we simulate the signed-url flow for security practice, but a real-world implementation with Cloudflare R2 or S3 would be the next step."

"I'd also look into adding more granular Audit Log visualizations—maybe some charts to show tenant activity over time, which would add even more value for the platform admins."

---

## Closing

"That’s Wellspring. A secure, multi-tenant platform built with modern agentic workflows. Thanks for watching!"
