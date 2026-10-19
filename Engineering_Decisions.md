# 1. Overview
This document outlines the core engineering decisions made during the architecture, design, and implementation of OpsDesk, an internal operations platform built to manage and resolve work items under high concurrency and team constraints.

# 2. Decision 1: Relational Database with Prisma ORM & PostgreSQL
Context: The platform requires strong transactional guarantees, complex filtering, foreign key constraints for team memberships, and structured relational history tracking.

Options Considered:

NoSQL document store (e.g., MongoDB) for flexible schema storage.

Relational database (PostgreSQL) managed via raw SQL or an ORM like Prisma.

Choice: PostgreSQL managed via Prisma ORM.

Trade-offs:

Pros: Guarantees ACID compliance, allows robust relational queries and indexing, and simplifies migrations across team memberships, work items, and activity logs.

Cons: Requires rigid schema migrations up front, though Prisma migrations handle schema evolution smoothly.

# 3. Decision 2: Optimistic Concurrency Control (OCC) for Work Item Updates
Context: Multiple users might view or attempt to edit the same operational work item simultaneously, risking data overwrites and stale updates.

Options Considered:

Pessimistic locking (holding database locks during edits), which harms scalability.

Last-write-wins strategy, leading to silent data loss.

Optimistic Concurrency Control using a version number column.

Choice: Optimistic Concurrency Control (OCC). Every work item includes a version field. Updates check WHERE id = ? AND version = current_version and increment the version on success, throwing a 409 Conflict if a mismatch is detected.

Trade-offs:

Pros: High concurrency throughput without locking active rows in the database.

Cons: Requires the client to handle conflict errors gracefully and reload the latest state when a stale edit is rejected.

# 4. Decision 3: Atomic Resource-Level Authorization & Team Role Scoping
Context: Employees belong to various teams with distinct responsibilities (Viewer, Member, Lead, Admin). Authorization must be enforced securely on the server rather than hiding UI elements.

Options Considered:

Frontend-only route guards and button toggling.

Global role checks inside middleware without resource context.

Server-side middleware and service-level permission functions scoped per team and resource.

Choice: Server-side role validation mapped against the item's team context inside dedicated service layers, returning strict 403 Forbidden or 404 Not Found responses for unauthorized access.

Trade-offs:

Pros: Bulletproof security; unauthorized API requests are blocked regardless of client-side state.

Cons: Adds computational overhead to verify team memberships on every protected endpoint.

# 5. Decision 4: Append-Only Activity Log via Transactional Outbox Pattern
Context: Every state change, priority adjustment, or assignee re-allocation must leave a permanent, verifiable audit trail without falling out of sync with the core work item data.

Options Considered:

Asynchronous fire-and-event logging that can fail independently.

Synchronous append-only event creation inside the same database transaction as the work item mutation.

Choice: Transactional execution combining the work item modification and the activity event log insertion within a single Prisma transaction, supplemented by an outbox table for asynchronous worker notifications.

Trade-offs:

Pros: Guarantees historical consistency; history can never disagree with the current state of an item.

Cons: Slightly longer transaction hold times during heavy write bursts.

# 6. Decision 5: Cursor-Based Pagination and Server-Side Filtering
Context: The platform is engineered to handle tens of thousands of active work items and growing history logs without performance degradation.

Options Considered:

Loading all items into memory or client-side filtering.

Offset-based pagination (LIMIT/OFFSET).

Cursor-based pagination coupled with indexed database queries.

Choice: Cursor-based pagination combined with server-side filters for status, priority, and text search.

Trade-offs:

Pros: Predictable query performance even as the dataset scales to hundreds of thousands of rows.

Cons*: Less intuitive for jumping to arbitrary page numbers compared to traditional offset pagination.

Known Limitations
Real-time Synchronization: Lacks WebSocket support; clients rely on polling or manual refetching to catch updates made by other users.

File Attachments & Rich Media: Rich media or file attachments on work items are currently out of scope; comments accept plain text only.

Notification Delivery: Async jobs write to an outbox table, but downstream external email or chat notifications are stubbed out rather than integrated with third-party providers.