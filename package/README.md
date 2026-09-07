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
