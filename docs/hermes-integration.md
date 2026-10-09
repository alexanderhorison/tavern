# Hermes integration boundary

The current app is intentionally disconnected, as requested for the local build. A profile name entered in party settings is a mapping label; it does not discover, start, or connect an agent. There are always three agent slots, even when none is configured.

## Dated snapshot import

Use Settings → Import JSON. This is a project-defined import format, **not a claim about the Hermes gateway API**:

```json
{
  "schemaVersion": 1,
  "source": "YOUR ACTUAL SNAPSHOT SOURCE",
  "recordedAt": "2026-10-09T10:00:00Z",
  "agents": [
    {
      "slotId": "slot-1",
      "taskStatus": "STATUS FROM YOUR SOURCE",
      "taskTitle": "TASK TITLE FROM YOUR SOURCE",
      "details": "OPTIONAL SOURCE DETAILS"
    }
  ],
  "records": [
    {
      "id": "a-stable-source-record-id",
      "roomId": "tba",
      "kind": "note",
      "title": "YOUR NOTE TITLE",
      "body": "YOUR NOTE TEXT",
      "sourceUrl": "https://YOUR-SOURCE-URL",
      "createdAt": "2026-10-09T10:00:00Z"
    }
  ]
}
```

Values above are examples to replace. No example task is shown in the app by default. The allowed slot IDs are `slot-1`, `slot-2`, `slot-3`. Missing slots keep unavailable task status. Source and valid recorded time are required. `records` is optional; record kinds are `note`, `decision`, and `review`. Stable record IDs update existing records instead of adding duplicate books on repeated imports. Source links accept HTTP/HTTPS only.

Room IDs: `tba`, `power`, `kaffee`, `engage`, `archive`, `bithealth`, `supervisor`, `entrance`, `tavern`, `games`, `training`, `fishing`, `pool`, `den`.

Importing a snapshot does not start polling or change the disconnected gateway badge. Snapshot source, recorded time, and task status are shown separately from the decorative routine. Imported knowledge is labeled as imported. Manually added notes are labeled as added by you.

## Later VPS connection

When your deployed Hermes gateway version and actual API/authentication are available, add a small **server-side adapter** alongside this static app. It should map the three real profile IDs to the stable slot IDs above, retain each source timestamp, normalize actual task status, and return unavailable status when a source is missing or stale. Store gateway credentials only in that backend/container, never in a `VITE_*` variable or browser bundle.

Only then add explicit opt-in frontend fetching of the adapter, a true connected/disconnected/error state, source freshness, and a stop control. Keep the current character animation loop independent of that fetching. There is no backend adapter or such fetching in this version, and the Nginx `/api/` location returns 404.

The local guild backup contains browser presentation settings and notes. It is not a Hermes configuration file. Real Hermes profile setup continues to happen in your existing agent container.
