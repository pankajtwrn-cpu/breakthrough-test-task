Breakthrough - Full-Stack Engineer Take-Home Assessment
Welcome
Thanks for your interest in joining Breakthrough. This take-home is the first stage of our process. It should take around 48 hours to complete. We encourage candidates to scope thoughtfully and ship a polished version of what they can within that window. We value clarity, execution, and decision-making over completeness.
We've designed this around how engineering actually works in 2026 — with AI as a core part of your toolkit. The goal isn't to test whether you can type code; it's to test how you think, direct AI, and ship production-grade software.


AI-Driven Development is Mandatory
You must use AI tools (Cursor, Claude Code, GitHub Copilot, Claude.ai, ChatGPT, Windsurf — your choice) throughout this assessment. Submissions without AI usage evidence will not be reviewed.

Here is what we are actually evaluating:

How well you direct AI — your prompts, your context-setting, your decomposition of problems and the systems you use in shipping production code.
How critically you review AI output — what you accepted, what you rejected, what you fixed. 
How coherent your architecture is across many AI-generated pieces
How honest your self-review is about what you don't fully understand or aren't proud of

The senior skill we're hiring for is judgment over an AI-augmented codebase, not raw coding speed. A candidate who can ship 70% of the scope with deep understanding will beat one who ships 100% of generated slop.

We will read your chat logs. We will spot copy-paste code that doesn't fit. We will ask about it in the next round. Be intentional.


What You'll Build — Wellspring
A multi-tenant content management platform for wellness creators. This mirrors what we actually run at Breakthrough.
Domain
Creators are tenants. Each creator runs their own branded space with their own admin login.
Programs belong to creators (e.g., "30-Day Sleep Reset", "Beginner Yoga Foundations") — a structured course of sessions.
Sessions belong to programs. Audio or video. Have title, duration, ordered position, instructor name, tags, and a media file URL.
Audit Log — every admin write action by a creator is logged with actor, action, target entity, and timestamp.
Backend (Node.js + Express + TypeScript + PostgreSQL)
Admin-facing API (auth via JWT — creators logging into the Admin Panel):

Auth: signup, login, password reset
CRUD for programs and sessions
Drag-reorder sessions within a program
Bulk CSV import of sessions with row-level validation feedback
Idempotent bulk import (a retried import with the same client-provided ID must not duplicate rows)
Request a pre-signed S3 upload URL for session media (audio/video)
View audit log with filters by date range and action type
Admin Panel (Next.js)
Functional UI. We are not grading pixel-perfect design. Tailwind is fine. Plain HTML is fine.

Required screens:

Creator signup and login
Program list, create, edit
Session list with drag-reorder
Session create/edit, including media upload via the S3 pre-signed URL flow
Bulk CSV upload with validation feedback (which rows failed and why)
Audit log viewer with filters by date and action type
Non-Negotiable Quality Bars
Tenant isolation enforced at the data layer, not just at controllers. We will manually try to forge a tenant_id to read another creator's data.
Idempotent bulk imports — duplicate requests with the same client-side ID must not double-write.
Tests that explicitly prove tenant isolation — at least three tests with names like 'rejects cross-tenant program access'. We grep for these.
Structured JSON logs with tenant_id and request_id on every line.
Migration files — schema changes go through migrations, not ad-hoc SQL.
Secure S3 upload flow — pre-signed URLs scoped, time-limited, and tied to the requesting tenant.


Required Deliverables
You must submit all five of the following. Missing items disqualify the submission.
1. Code (Public GitHub Repo)
Create a public GitHub repo and send the link to rutul@breakthroughapps.io. Include:

README.md with setup, run, test, and seed instructions
.env.example
npm scripts: dev, test, db:migrate, db:seed
A seed script that creates 2 creators with 3 programs each and ~10 sessions per program. Just enough to demonstrate functionality.
2. AI Fluency (/ai-history folder in the repo)
Export your complete AI sessions from whatever tools you used. Do not curate or clean.

Cursor / Windsurf: export chat threads as markdown
Claude.ai / ChatGPT: use share links or export to PDF/MD
Claude Code / agentic tools: include the session transcripts

If you used multiple tools, include them all. Organize them chronologically with brief filenames like 01-initial-schema-design.md, 02-tenant-isolation-debugging.md.

We're looking for:

Quality of your prompts and context-setting
Where you pushed back on AI suggestions
How you decomposed complex tasks
How you handled AI mistakes
Where you accepted from AI as-is, and why you trust it
What AI suggested that you rejected or rewrote, and why

Do not edit your chats to make them look better. We'd rather see real, messy iteration than a sanitized highlight reel. A submission that looks too polished will trigger deeper scrutiny in the next round.
3. docs/CODE_SUMMARY.md
A module-by-module summary of your codebase. For each major module (e.g., auth/, tenants/, programs/, sessions/, uploads/, audit/), write 3–6 sentences explaining:

What it does
The key design choice you made
Anything non-obvious about how to use or extend it

This is what a new hire would read on day 1. Write it for that person.
4. docs/ARCHITECTURE_REVIEW.md
This is the highest-signal artifact. ~1000 words. Be honest. We respect honest self-review enormously and we will spot performative confidence.

Structure:

What I built and what I skipped — and why
Tenant isolation strategy — your choice (row-level filter, schema-per-tenant, etc.) and why. What changes at 100 creators? At 10,000?
Bulk import design — how you modeled idempotency, what failure modes you handle
S3 upload flow — security considerations, tenant scoping, how you'd evolve it for very large files
Parts of my code I'm not fully confident in 
What I would change with two more days
5. Loom Walkthrough (5–7 minutes)
Recorded video. Cover:

Quick demo of the running app (1 min)
Schema walk-through and your tenant isolation enforcement, shown in code (2 min)
Explain how you used AI to build this (1–2 min)
One thing you'd do differently (1 min)

Submissions without a Loom will not be reviewed. It is the single highest-signal item we receive.

Put the Loom URL at the top of your README.


Submission
Email the public GitHub repo link to rutul@breakthroughapps.io with the subject Take-home submission — [Your Name].

If anything is unclear, email rutul@breakthroughapps.io before you start. Clarifying questions are welcomed and don't count against you.

Looking forward to seeing what you build.

— The Breakthrough Engineering Team

