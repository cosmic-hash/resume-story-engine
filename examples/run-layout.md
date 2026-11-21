# Private run layout

Personal runs are not committed. Create them under `data/private/<run-slug>/`:

```text
data/private/<run-slug>/
  00-inputs/resume.md
  00-inputs/job.md
  01-role-summary.json
  02-point-index.json
  03-points/<point-id>.json
  04-answers.json
  05-review.json
  06-preparation.json
  _progress.json
```

Use `/resume-story` in Cursor to generate this tree automatically. Say `clear` to drop intermediates after `06-preparation.json` exists.
