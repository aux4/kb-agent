# aux4/kb-agent

KB Q&A agent. Answers a question from the aux4 knowledge base by calling the `kb`
command-machine on the same scope. Independent package (depends only on aux4/ai-agent);
integrates with `aux4/agent-manager` by extending its profile.

```bash
aux4 agent-manager ask kb --question "What is X?"   # via the manager
aux4 agent-manager kb run "What is X?"              # standalone
```

## Installation

```bash
aux4 aux4 pkger install aux4/kb-agent
```

## How it works

The `run` command takes the question as a positional argument and forwards it to
`aux4 ai agent ask`, which answers using the aux4 knowledge base (the `kb`
command-machine on the same scope). The question is passed with aux4's `value()`
mechanism, so shell metacharacters in the question are delivered as literal text.

### Model selection

By default `run` uses the model profile from `config.yaml` (`--config`, default `cloud`).
The host normally injects the caller's bearer token request-locally as
`AUX4_ACCESS_TOKEN`. The agent uses it for both the **inference broker** and
executeAux4/Cloud tool calls; it is never installed as a machine-wide credential.
An explicit `--token` remains supported for backward-compatible CLI calls. The broker
then meters and quota-checks the **caller's** scope rather than a shared machine credential.
The broker `baseURL` defaults to the dev broker and is overridable via the
`AUX4_INFERENCE_URL` environment variable.

### Durable execution

The package also exposes `agent-manager kb orchestrate` with `call-llm`,
`run-tool`, `apply-results`, and the opt-in bounded `run-tools-and-resume`. This is the same contract any agent package can
implement for Step Functions. Planning and resume state lives under the Cloud
VM's automatically synchronized local state directory, while tool calls use the
normal `aux4/ai-agent` registry and the execution's request-local user token.

`run-tools-and-resume` is appropriate when the complete tool batch is expected to
finish within one Lambda invocation. It removes a workflow transition and a second
package/tool bootstrap. Agents with long-waiting tools keep the separate commands.

The agent treats matching passages returned by `kb search` as answer-grade KB
content. It calls `kb view` only when a search passage is incomplete or ambiguous,
avoiding an unnecessary remote tool call and model pass for straightforward matches.
