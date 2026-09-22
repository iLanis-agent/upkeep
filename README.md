# Upkeep

Homes don't break suddenly - they degrade on schedules nobody remembers. The HVAC
filter runs on a 90-day clock, gutters on a 180-day one, smoke detector batteries on
a yearly one, and every missed interval quietly converts cheap maintenance into
expensive repair. Upkeep is the memory your house doesn't have: log each task once,
and it computes next-due dates, floats the most overdue work to the top, and rolls
it all into a single home-health score.

- Preloaded with the maintenance every home forgets (filters, gutters, detectors,
  water heater, fridge coils); add your own with any interval
- "Did it" resets the clock - schedules are recurring, not one-shot deadlines
- Overdue work sorted by how late it is; health score drags down as tasks slip
- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the schedule and health math as pure functions, shared between
  the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers due-date math, every tier edge (overdue / due today / 14-day
window / ok), never-logged tasks, worst-first sort order across all tiers, and
health-score rules: empty is 100, on-track is 100, overdue tasks drag in proportion
to how much of their interval has slipped, capped at a full penalty.
