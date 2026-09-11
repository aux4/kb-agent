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
  "hooks": [
    {
      "command": "*/ask",
      "replace": [
        "printf 'ANSWER: %s | MODEL: %s\\n' value(question) value(model)"
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
