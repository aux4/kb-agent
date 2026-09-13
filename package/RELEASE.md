# kb-agent 0.0.11

Reduces answer latency for straightforward KB matches. `kb search` already returns
matching passages, so the agent may now answer directly from those passages and calls
`kb view` only when it needs more context. This removes one remote Cloud command and
one model pass from the common case while preserving citations and KB-only grounding.

# kb-agent 0.0.10

Adds the standard durable-agent command contract:

- `agent-manager kb orchestrate call-llm`
- `agent-manager kb orchestrate run-tool`
- `agent-manager kb orchestrate apply-results`

The commands use `aux4/ai-agent`'s shared `plan`, `run-tool`, and `resume`
primitives. The Cloud VM runtime injects a short-lived execution token; no
machine-wide user token or KB-specific worker image is needed.

The synchronous compatibility path now reads the same request-local
`AUX4_ACCESS_TOKEN` environment used by the durable path. The explicit `--token`
input remains available for existing CLI callers.

# kb-agent 0.0.9

Fix the broker model id: `google/gemma-4-26b-a4b` (slash) → `google.gemma-4-26b-a4b` (dot).

The aux4 inference-broker / Bedrock Mantle registers this model under the **dot**
form. The slash form 404s (`The model '…' does not exist`); that error body has no
`choices`, so the LangChain OpenAI adapter throws
`Cannot read properties of undefined (reading 'message')`, which surfaced as the
agent's entire reply. Reverted to the dot form in both `config.yaml` (cloud profile)
and `lib/broker-model.mjs` (per-request forwarded-token model).

Carries forward 0.0.8: KB search terms are sent via the `executeAux4` tool's `stdin`
parameter (the cloud VM proxy rejects free text with spaces in the command path), and
the permissions allow-list includes the arg-less `aux4 cloud kb kb search`.
