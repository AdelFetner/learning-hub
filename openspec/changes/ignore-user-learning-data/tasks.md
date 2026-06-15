# Tasks: Ignore User Learning Data

## 1. Gitignore

- [x] 1.1 Add to root `.gitignore`: `topics/` (private learning data), plus `.DS_Store`, `Thumbs.db`, `*.log`. Keep the existing `.claude/settings.local.json` entry.
- [x] 1.2 Untrack the committed test topic without deleting it: `git rm -r --cached topics/http-status-codes`.

## 2. Verify

- [x] 2.1 `git status` shows `topics/` ignored and `topics/http-status-codes` no longer tracked; the files still exist on disk. (Verified: `git ls-files topics/` empty; both topic folders present on disk.)
- [x] 2.2 A simulated fresh clone (or `git ls-files topics/`) shows no `topics/` content tracked. (`git ls-files topics/` returns nothing.)
- [x] 2.3 Mark tasks complete and offer `openspec archive ignore-user-learning-data`.
