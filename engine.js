/* Upkeep engine - pure functions for recurring home-maintenance schedules. */
(function (root) {
  'use strict';
  var DAY = 86400000;

  function toDate(iso) {
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : ''));
    if (isNaN(d.getTime())) throw new Error('bad date: ' + iso);
    return d;
  }
  function addDays(iso, days) {
    return new Date(toDate(iso).getTime() + days * DAY).toISOString().slice(0, 10);
  }
  function diffDays(laterISO, earlierISO) {
    return Math.round((toDate(laterISO) - toDate(earlierISO)) / DAY);
  }

  function nextDue(lastDoneISO, intervalDays) { return addDays(lastDoneISO, intervalDays); }

  // positive = overdue by that many days; <=0 = that many days until due
  function daysUntilDue(dueISO, nowISO) { return diffDays(dueISO, nowISO); }

  function tier(daysUntil) {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 14) return 'due-soon';
    return 'ok';
  }
  var TIER_RANK = { overdue: 0, 'due-soon': 1, ok: 2, never: 3 };

  // task: {name, intervalDays, lastDone (ISO or null)}
  function status(task, nowISO) {
    if (!task.lastDone) return { tier: 'never', due: null, daysUntil: null, task: task };
    var due = nextDue(task.lastDone, task.intervalDays);
    var until = daysUntilDue(due, nowISO);
    return { tier: tier(until), due: due, daysUntil: until, task: task };
  }

  // overdue (most overdue first) -> due-soon (soonest) -> ok (soonest) -> never-done
  function sortTasks(tasks, nowISO) {
    return tasks.map(function (t) { return status(t, nowISO); })
      .sort(function (a, b) {
        var r = TIER_RANK[a.tier] - TIER_RANK[b.tier];
        if (r !== 0) return r;
        if (a.daysUntil === null) return 0;
        return a.daysUntil - b.daysUntil;
      });
  }

  // home health: 100 when nothing overdue; each overdue task drags by days late (capped)
  function health(tasks, nowISO) {
    if (!tasks.length) return 100;
    var penalty = 0, per = 100 / tasks.length;
    tasks.forEach(function (t) {
      var s = status(t, nowISO);
      if (s.tier === 'overdue') {
        var sev = Math.min(1, -s.daysUntil / t.intervalDays); // fraction of a full interval late
        penalty += per * Math.max(0.4, sev);
      }
    });
    return Math.max(0, Math.round(100 - penalty));
  }

  var api = { nextDue: nextDue, daysUntilDue: daysUntilDue, tier: tier, status: status, sortTasks: sortTasks, health: health };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Upkeep = api;
})(typeof window !== 'undefined' ? window : this);
