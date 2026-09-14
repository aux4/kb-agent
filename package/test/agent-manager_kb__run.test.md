# agent-manager kb run

Answers a question from the aux4 knowledge base. The question is passed as a
positional argument (`aux4 agent-manager kb run "<question>"`) and forwarded to
`aux4 ai agent ask`. These tests stay hermetic: a `replace` hook stands in for the
`aux4 ai agent ask` hop, so no model is called and no network is hit. The hook
echoes the question and the resolved `model` it received (both via the
injection-safe `value()` mechanism), proving `run` delivers the question as an
argument and selects the right model.

```file:.aux4
{
  "profiles": [
    {
      "name": "ai:agent",
      "commands": [
        {
          "name": "run-tool",
          "execute": ["echo should-be-replaced"],
          "help": {
            "text": "Hermetic stand-in for the unreleased ai-agent run-tool command",
            "variables": [
              { "name": "toolCall", "arg": true },
              { "name": "tools", "default": "" },
              { "name": "permissions", "default": "{}" }
            ]
          }
        },
        {
          "name": "run-tools-and-resume",
          "execute": ["echo should-be-replaced"],
          "help": {
            "text": "Hermetic stand-in for the fused ai-agent command",
            "variables": [
              { "name": "toolCalls", "arg": true },
              { "name": "history", "default": "" },
              { "name": "historySeed", "default": "" },
              { "name": "model", "default": "{}" },
              { "name": "instructions", "default": "" },
              { "name": "tools", "default": "" },
              { "name": "permissions", "default": "{}" }
            ]
          }
        }
      ]
    }
  ],
  "hooks": [
    {
      "command": "*/ask",
      "replace": [
        "printf 'ANSWER: %s | MODEL: %s\\n' value(question) value(model)"
      ]
    },
    {
      "command": "ai:agent/plan",
      "replace": [
        "printf 'PLAN: %s | HISTORY: %s | TOOLS: %s\\n' value(question) value(history) value(tools)"
      ]
    },
    {
      "command": "ai:agent/run-tool",
      "replace": [
        "printf 'TOOL: %s | TOOLS: %s\\n' value(toolCall) value(tools)"
      ]
    },
    {
      "command": "ai:agent/resume",
      "replace": [
        "printf 'RESUME: %s | HISTORY: %s | TOOLS: %s\\n' value(toolResults) value(history) value(tools)"
      ]
    },
    {
      "command": "ai:agent/run-tools-and-resume",
      "replace": [
        "printf 'FUSED: %s | HISTORY: %s | SEED: %s | TOOLS: %s\\n' value(toolCalls) value(history) value(historySeed) value(tools)"
      ]
    }
  ]
}
```

## passes the question as an argument (no token)

Without `--token`, the agent uses its configured model profile (`config.yaml`),
so no `--model` override is passed and the hook sees an empty model.

### the question reaches ai agent ask

```execute
aux4 agent-manager kb run "What is aux4?"
```

```expect:partial
ANSWER: What is aux4? | MODEL: 
```

### a question with shell metacharacters is delivered verbatim (injection-safe)

```execute
aux4 agent-manager kb run '$(whoami) `id` && echo pwned'
```

```expect:partial
ANSWER: $(whoami) `id` && echo pwned | MODEL: 
```

## forwards the caller token to the broker via a --model override

With `--token`, `run` builds an ai-agent `--model` config (`type: openai`) whose
`apiKey` is the caller token and whose `baseURL` is the inference broker, so
metering is attributed to the caller. The `Bearer ` prefix is stripped.

### the model carries the token and the broker baseURL

```execute
aux4 agent-manager kb run "What is aux4?" --token "Bearer test-jwt-123"
```

```expect:partial
ANSWER: What is aux4? | MODEL: *"apiKey":"test-jwt-123"*"baseURL":"https://aux4.on.dev.aux4.cloud/inference-broker/api/v1"*
```

### a bare token (no Bearer prefix) is accepted too

```execute
aux4 agent-manager kb run "What is aux4?" --token "bare-token-xyz"
```

```expect:partial
ANSWER: What is aux4? | MODEL: *"apiKey":"bare-token-xyz"*
```

### the host can inject the token only through the request-local environment

```execute
AUX4_ACCESS_TOKEN=environment-token-xyz aux4 agent-manager kb run "What is aux4?"
```

```expect:partial
ANSWER: What is aux4? | MODEL: *"apiKey":"environment-token-xyz"*
```

## exposes the generic durable orchestration contract

### call-llm delegates one planning turn to ai-agent

```execute
AUX4_ACCESS_TOKEN=test-execution-token aux4 agent-manager kb orchestrate call-llm --message "Find the architecture" --history /tmp/state/agent-sessions/run-1.json
```

```expect:partial
PLAN: Find the architecture | HISTORY: /tmp/state/agent-sessions/run-1.json | TOOLS: executeAux4
```

### run-tool uses ai-agent's shared tool registry

```execute
aux4 agent-manager kb orchestrate run-tool '{"id":"call-1","name":"executeAux4","arguments":{"command":"aux4 cloud kb kb search architecture"}}'
```

```expect:partial
TOOL: *"id":"call-1"*"name":"executeAux4"* | TOOLS: executeAux4
```

### apply-results resumes from the synchronized history checkpoint

```execute
AUX4_ACCESS_TOKEN=test-execution-token aux4 agent-manager kb orchestrate apply-results '[{"id":"call-1","content":"found"}]' --history /tmp/state/agent-sessions/run-1.json
```

```expect:partial
RESUME: *"id":"call-1"*"content":"found"* | HISTORY: /tmp/state/agent-sessions/run-1.json | TOOLS: executeAux4
```

### run-tools-and-resume keeps the initial checkpoint and tool batch intact

```execute
AUX4_ACCESS_TOKEN=test-execution-token aux4 agent-manager kb orchestrate run-tools-and-resume '[{"id":"call-1","name":"executeAux4","arguments":{"command":"aux4 cloud kb kb search architecture"}}]' --history /tmp/state/agent-sessions/run-1.json --historySeed '{"messages":[{"role":"user","content":"Find the architecture"}]}'
```

```expect:partial
FUSED: *"id":"call-1"*"name":"executeAux4"* | HISTORY: /tmp/state/agent-sessions/run-1.json | SEED: *"role":"user"* | TOOLS: executeAux4
```
