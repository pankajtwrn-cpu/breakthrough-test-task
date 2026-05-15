import { pgTable, serial, text, timestamp, integer, uuid, varchar, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const actionEnum = pgEnum('action', ['CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'REORDER']);
export const entityEnum = pgEnum('entity', ['PROGRAM', 'SESSION']);

export const creators = pgTable('creators', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').references(() => programs.id, { onDelete: 'cascade' }).notNull(),
  creatorId: uuid('creator_id').references(() => creators.id).notNull(), // Redundant but good for isolation enforcement
  title: varchar('title', { length: 255 }).notNull(),
  duration: integer('duration').notNull(), // in seconds
  position: integer('position').notNull(),
  instructorName: varchar('instructor_name', { length: 255 }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  mediaUrl: text('media_url'),
  clientImportId: varchar('client_import_id', { length: 255 }), // For idempotency
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id).notNull(),
  action: actionEnum('action').notNull(),
  entityType: entityEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  actorId: uuid('actor_id').references(() => creators.id).notNull(),
  details: jsonb('details'),
  requestId: uuid('request_id'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const importJobs = pgTable('import_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => creators.id).notNull(),
  clientBatchId: varchar('client_batch_id', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull(), // COMPLETED, FAILED
  result: jsonb('result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const creatorsRelations = relations(creators, ({ many }) => ({
  programs: many(programs),
  sessions: many(sessions),
  auditLogs: many(auditLogs),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  creator: one(creators, { fields: [programs.creatorId], references: [creators.id] }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  program: one(programs, { fields: [sessions.programId], references: [programs.id] }),
  creator: one(creators, { fields: [sessions.creatorId], references: [creators.id] }),
}));
