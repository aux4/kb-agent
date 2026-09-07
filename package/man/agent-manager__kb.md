#### Description

The `kb` command is the routing entry point for the KB Q&A agent plugin. It is an agent
plugin for `aux4/agent-manager`: it extends the shared `agent-manager` profile with the
`agent-manager:kb` sub-profile, exposing `run` (answer a question) and `describe` (print
the agent's metadata). The plugin depends only on `aux4/ai-agent`, not on the manager.

#### Usage

```bash
aux4 agent-manager kb <command>
```

#### Example

```bash
aux4 agent-manager kb run "What is aux4?"
```
