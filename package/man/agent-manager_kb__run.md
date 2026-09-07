#### Description

The `run` command answers a question using the aux4 knowledge base. The question is a
positional argument; it is forwarded to `aux4 ai agent ask` with the KB instructions and
the `executeAux4` tool, which lets the agent search the `kb` command-machine on the same
scope. This command is what `aux4 agent-manager ask kb` and the deployed
`POST /kb/ask` route call.

The question is passed with aux4's `value()` mechanism, which resolves and shell-quotes it,
so shell metacharacters in the question are delivered as literal text — never interpreted.

- **question** — the question to answer (positional argument).
- **config** — model config section: `openai-mini` (default), `cloud` (Bedrock Mantle) or
  `local` (mlx).
- **permissions** — tool allow-list restricting the agent to cross-VM kb calls.
- **policy** — guardrails (call budget).

#### Usage

```bash
aux4 agent-manager kb run <question> [--config <section>] [--permissions <json>] [--policy <json>]
```

--question     The question to answer from the KB (positional argument, required)
--config       Model config section (default `openai-mini`)
--permissions  Tool allow-list (default restricts to `aux4 cloud kb kb` search/view/list)
--policy       Guardrails such as the call budget (default `{"budget":{"calls":15}}`)

#### Example

```bash
aux4 agent-manager kb run "What is aux4?"
```
