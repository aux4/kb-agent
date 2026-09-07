#### Description

The `describe` command prints this agent's metadata as JSON: its name, a short
description, and the tools it uses. It lets the manager (or a UI) discover what the agent
does without running it.

#### Usage

```bash
aux4 agent-manager kb describe
```

#### Example

```bash
aux4 agent-manager kb describe
```

```json
{
  "name": "kb",
  "description": "Answers questions from the aux4 knowledge base",
  "tools": ["cloud kb kb search", "cloud kb kb view", "cloud kb kb list"]
}
```
