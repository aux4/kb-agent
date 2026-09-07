# agent-manager kb run

Answers a question from the aux4 knowledge base. The question is passed as a
positional argument (`aux4 agent-manager kb run "<question>"`) and forwarded to
`aux4 ai agent ask`. These tests stay hermetic: a `replace` hook stands in for the
`aux4 ai agent ask` hop, so no model is called and no network is hit. The hook
echoes the question it received (via the injection-safe `value()` mechanism),
proving `run` delivers the question as an argument.

```file:.aux4
{
  "hooks": [
    {
      "command": "*/ask",
      "replace": [
        "printf 'ANSWER: %s\\n' value(question)"
      ]
    }
  ]
}
```

## passes the question as an argument

### the question reaches ai agent ask

```execute
aux4 agent-manager kb run "What is aux4?"
```

```expect:partial
ANSWER: What is aux4?
```

### a question with shell metacharacters is delivered verbatim (injection-safe)

```execute
aux4 agent-manager kb run '$(whoami) `id` && echo pwned'
```

```expect:partial
ANSWER: $(whoami) `id` && echo pwned
```
