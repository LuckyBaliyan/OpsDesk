/* Dummy data (replace with API calls later) */

export const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const USERS = {
      u1: { id: 'u1', name: 'Lucky Baliyan', email: 'lucky@opsdesk.dev' },
      u2: { id: 'u2', name: 'Adarsh Namdev', email: 'adarsh@opsdesk.dev' },
      u3: { id: 'u3', name: 'Mudit Dixit', email: 'mudit@opsdesk.dev' },
      u4: { id: 'u4', name: 'Priya Sharma', email: 'priya@opsdesk.dev' },
      u5: { id: 'u5', name: 'Rohan Mehta', email: 'rohan@opsdesk.dev' },
      u6: { id: 'u6', name: 'Ananya Rao', email: 'ananya@opsdesk.dev' },
};

export const ME = USERS.u1;

export const TEAMS = [
      { id: 't1', name: 'Platform', description: 'Core services, infra and the API gateway', myRole: 'Lead' },
      { id: 't2', name: 'Payments', description: 'Payment flows, refunds and settlements', myRole: 'Member' },
      { id: 't3', name: 'Compliance', description: 'Audits, policies and data requests', myRole: 'Viewer' },
      // myRole: null -> you are not a member of this team (read-only view)
      { id: 't4', name: 'Security', description: 'Vulnerabilities, access reviews and incident response', myRole: null },
      { id: 't5', name: 'Customer Support', description: 'Escalated customer tickets and queues', myRole: null },
];

const mem = (teamId, list) =>
      list.map(([userId, role]) => ({ id: `${teamId}-${userId}`, userId, role, user: USERS[userId] }));

export const MEMBERS = {
      t1: mem('t1', [['u1', 'Lead'], ['u2', 'Member'], ['u3', 'Member'], ['u4', 'Admin'], ['u5', 'Viewer']]),
      t2: mem('t2', [['u1', 'Member'], ['u4', 'Lead'], ['u5', 'Member'], ['u6', 'Admin']]),
      t3: mem('t3', [['u1', 'Viewer'], ['u6', 'Lead'], ['u3', 'Member']]),
      t4: mem('t4', [['u4', 'Lead'], ['u2', 'Member'], ['u6', 'Member']]),
      t5: mem('t5', [['u5', 'Lead'], ['u3', 'Member'], ['u2', 'Viewer']]),
};

// [teamId, title, description, type, priority, status, assigneeId, createdById, hoursAgo]
const SEED = [
      ['t1', 'API gateway returning 502 intermittently', 'Spikes between 2-4 AM IST on /v1/orders.', 'Incident', 'Urgent', 'Open', null, 'u2', 3],
      ['t1', 'Rotate production JWT secret', 'Quarterly rotation, needs coordination with auth team.', 'Task', 'High', 'AwaitingApproval', 'u2', 'u3', 20],
      ['t1', 'Postgres connection pool exhausted', 'Pool maxes out during report generation.', 'Incident', 'Urgent', 'InProgress', 'u1', 'u4', 30],
      ['t1', 'Add index on work_items(team_id, status)', 'List queries slow past 50k rows.', 'Task', 'Medium', 'Open', 'u3', 'u1', 50],
      ['t1', 'Customer cannot reset password', 'Reset email never arrives for a corporate domain.', 'CustomerIssue', 'High', 'Open', null, 'u5', 5],
      ['t1', 'Outbox worker retries stuck jobs', 'Jobs stay PROCESSING after crash.', 'Incident', 'Urgent', 'Open', null, 'u3', 8],
      ['t1', 'Upgrade Node runtime to LTS', 'Move staging first, then production.', 'Task', 'Low', 'Resolved', 'u2', 'u1', 120],
      ['t1', 'Audit log export request', 'Finance asked for last quarter activity export.', 'Compliance', 'Medium', 'AwaitingApproval', 'u3', 'u4', 26],
      ['t1', 'Dashboard slow on first load', 'Initial render takes over 4 seconds.', 'CustomerIssue', 'Medium', 'InProgress', 'u1', 'u5', 40],
      ['t1', 'Deprecate v0 webhooks', 'Notify integrators and remove endpoints.', 'Task', 'Low', 'Closed', 'u4', 'u4', 300],
      ['t1', 'Rate limit login endpoint', 'Brute force attempts seen in logs.', 'Task', 'High', 'InProgress', 'u1', 'u2', 12],
      ['t1', 'Fix timezone bug in due dates', 'Dates shift by one day for UTC-8 users.', 'CustomerIssue', 'Medium', 'Resolved', 'u3', 'u5', 90],
      ['t1', 'Cache team lookups in middleware', 'Avoid a membership query on every request.', 'Task', 'Medium', 'Open', 'u1', 'u2', 150],
      ['t1', 'Staging database out of disk', 'Needs cleanup of old migration snapshots.', 'Incident', 'High', 'Resolved', 'u4', 'u3', 210],
      ['t2', 'Duplicate charge on retried payment', 'Customer charged twice after gateway timeout.', 'Payment', 'Urgent', 'InProgress', 'u1', 'u4', 6],
      ['t2', 'Refund stuck in pending for 5 days', 'Refund ref RF-20931 not settled.', 'Payment', 'High', 'Open', null, 'u5', 14],
      ['t2', 'Chargeback dispute: order #88412', 'Evidence due in 3 days.', 'Payment', 'Urgent', 'AwaitingApproval', 'u5', 'u6', 10],
      ['t2', 'Reconcile settlement report', 'Mismatch of 1,240 INR in weekly settlement.', 'Task', 'Medium', 'Open', 'u1', 'u4', 70],
      ['t2', 'Add UPI autopay support', 'Scope and estimate for next quarter.', 'Task', 'Low', 'Open', null, 'u6', 200],
      ['t2', 'Payment webhook signature failing', 'HMAC mismatch for one provider.', 'Incident', 'Urgent', 'Open', null, 'u1', 2],
      ['t2', 'Invoice PDF shows wrong GST', 'GST rate applied incorrectly for Karnataka.', 'CustomerIssue', 'High', 'Resolved', 'u4', 'u5', 100],
      ['t3', 'GDPR data deletion request', 'User requested full account erasure.', 'Compliance', 'High', 'InProgress', 'u3', 'u6', 36],
      ['t3', 'Annual security policy review', 'Update access control section.', 'Compliance', 'Medium', 'Open', 'u6', 'u6', 160],
      ['t3', 'Vendor risk assessment: analytics provider', 'Questionnaire pending from vendor.', 'Compliance', 'Medium', 'AwaitingApproval', 'u3', 'u6', 48],
      ['t3', 'Retention policy for activity logs', 'Define 24 month retention window.', 'Compliance', 'Urgent', 'Open', null, 'u3', 4],
      ['t3', 'SOC 2 evidence collection', 'Collect Q3 access review screenshots.', 'Task', 'Low', 'Closed', 'u6', 'u6', 400],
      ['t4', 'Critical CVE in base image layer', 'Patch available, needs rollout across services.', 'Incident', 'Urgent', 'Open', null, 'u4', 7],
      ['t4', 'Quarterly access review', 'Review admin access across production systems.', 'Compliance', 'Medium', 'InProgress', 'u2', 'u4', 60],
      ['t4', 'Rotate third-party API keys', 'Keys older than 90 days.', 'Task', 'High', 'AwaitingApproval', 'u6', 'u2', 18],
      ['t4', 'Pen-test findings triage', 'Group findings and assign owners.', 'Task', 'Medium', 'Open', null, 'u4', 72],
      ['t4', 'Disable unused service accounts', 'Cleanup of 14 dormant accounts.', 'Task', 'Low', 'Resolved', 'u2', 'u6', 140],
      ['t5', 'Enterprise customer cannot export reports', 'Export button spins forever for 3 accounts.', 'CustomerIssue', 'Urgent', 'Open', null, 'u5', 5],
      ['t5', 'Billing email goes to spam', 'Reported by several small business customers.', 'CustomerIssue', 'Medium', 'InProgress', 'u3', 'u5', 28],
      ['t5', 'Update refund macro replies', 'Align wording with the new refund policy.', 'Task', 'Low', 'Open', 'u3', 'u5', 96],
      ['t5', 'Weekend queue backlog', 'Average first response is above 6 hours.', 'Incident', 'High', 'Open', null, 'u2', 9],
];

export const buildItems = () =>
      SEED.map(([teamId, title, description, type, priority, status, assigneeId, createdById, h], i) => ({
            id: `wi-${i + 1}`,
            teamId,
            title,
            description,
            type,
            priority,
            status,
            assigneeId,
            createdById,
            version: 1,
            createdAt: hoursAgo(h),
      }));

export const buildActivities = (items) => {
      const map = {};
      items.forEach((it, i) => {
            const list = [{ id: `${it.id}-a1`, actorId: it.createdById, actionType: 'CREATED', newValue: it.title, createdAt: it.createdAt }];
            if (it.assigneeId) {
                  list.unshift({
                        id: `${it.id}-a2`,
                        actorId: it.createdById,
                        actionType: 'UPDATED',
                        newValue: `Assigned to ${USERS[it.assigneeId].name}`,
                        createdAt: hoursAgo(Math.max(1, i % 5)),
                  });
            }
            if (['InProgress', 'AwaitingApproval', 'Resolved', 'Closed'].includes(it.status)) {
                  list.unshift({
                        id: `${it.id}-a3`,
                        actorId: it.assigneeId || it.createdById,
                        actionType: 'UPDATED',
                        newValue: `Status changed to ${it.status}`,
                        createdAt: hoursAgo(Math.max(1, i % 3)),
                  });
            }
            map[it.id] = list;
      });
      return map;
};