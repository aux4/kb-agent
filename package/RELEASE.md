# aux4/kb-agent 0.0.8

Send KB search terms through stdin so free-text queries survive the cloud VM proxy.

- `instructions.md` now tells the model to call search as
  `executeAux4({ command: "aux4 cloud kb kb search --scope aux4", stdin: "<search terms>" })`
  — the free-text terms go in the tool's `stdin` field, never embedded in the command
  string. Embedding a multi-word query in the command routed it through the URL path,
  where the cloud proxy rejects any segment containing a space (400). `view` and `list`
  keep their id-like command args (no spaces, valid path segments).
- The `run` command's `permissions` allow-list adds an exact `aux4 cloud kb kb search`
  entry alongside the existing `aux4 cloud kb kb search *`, so the search command passes
  whether or not it carries trailing flags after `search`.

Requires `aux4/kb` 0.1.11+ deployed on the `kb` command-machine (its `kb search` reads
the query from stdin).
