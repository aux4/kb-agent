#### Description

The `run` command answers a question using the aux4 knowledge base. The question is a
positional argument; it is forwarded to `aux4 ai agent ask` with the KB instructions and
the `executeAux4` tool, which lets the agent search the `kb` command-machine on the same
scope. This command is what `aux4 agent-manager ask kb` and the deployed
`POST /kb/ask` route call.

The question is passed with aux4's `value()` mechanism, which resolves and shell-quotes it,
so shell metacharacters in the question are delivered as literal text — never interpreted.

- **question** — the question to answer (positional argument).
- **config** — model config section: `cloud` (default, inference-broker) or `local` (mlx).
  Used only when `--token` is empty.
- **token** — the caller's aux4 bearer token, forwarded by `agent-host ask-api`. When set,
  the agent calls the **inference broker** with this token instead of the configured model
  profile: `run` builds an ai-agent `--model` override (`type: openai`, `apiKey=<token>`,
  broker `baseURL`) so the broker meters and quota-checks the **caller's** scope rather than a
  shared machine credential. A leading `Bearer ` prefix is stripped. When `--token` is empty,
  `run` falls back to the `--config` model profile from `config.yaml`. The model JSON is built
  by the bundled `lib/broker-model.mjs` helper (node builtins only), because assembling it with
  a dynamic token in the aux4 DSL is quoting-fragile.
- **permissions** — tool allow-list restricting the agent to cross-VM kb calls.
- **policy** — guardrails (call budget).

The broker `baseURL` is currently the dev inference broker; it is overridable via the
`AUX4_INFERENCE_URL` environment variable and should be made fully env-driven (per-env) before
prod.

#### Usage

```bash
aux4 agent-manager kb run <question> [--token <jwt>] [--config <section>] [--permissions <json>] [--policy <json>]
```

--question     The question to answer from the KB (positional argument, required)
--token        Caller's aux4 bearer token; when set, routes to the inference broker as the caller
--config       Model config section used when no token is set (default `cloud`)
--permissions  Tool allow-list (default restricts to `aux4 cloud kb kb` search/view/list)
--policy       Guardrails such as the call budget (default `{"budget":{"calls":15}}`)

#### Example

Local / configured model profile:

```bash
aux4 agent-manager kb run "What is aux4?"
```

With a forwarded caller token (routes to the inference broker as the caller):

```bash
aux4 agent-manager kb run "What is aux4?" --token "$(aux4 aux4 token)"
```
