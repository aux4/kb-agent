// broker-model — build the ai-agent `--model` JSON that points at the aux4
// inference-broker, authenticated with the CALLER's aux4 token.
//
// `agent-manager:kb run` calls this when it is handed a `--token` (forwarded from
// the agent front). It prints an ai-agent model config of `type: "openai"` whose
// `apiKey` is the caller token and whose `baseURL` is the broker's
// OpenAI-compatible surface, so ai-agent sends `Authorization: Bearer <token>`
// to the broker. The broker validates the token, signs SigV4 to Bedrock, and
// meters per the caller's scope — no per-machine Bedrock credential involved.
//
// The token is argv[2]; a leading "Bearer " prefix is stripped if present. The
// broker baseURL comes from AUX4_INFERENCE_URL, defaulting to the dev broker.
// TODO(SFA): the broker baseURL should become fully env-driven (per-env) before
// prod — the default below is dev-only.
//
// Prints nothing when no token is given (the caller then falls back to its own
// configured model profile). Zero third-party dependencies — node builtins only,
// so the package needs no bundling step.

const DEFAULT_BROKER_URL = "https://aux4.on.dev.aux4.cloud/inference-broker/api/v1";

export function brokerModel(rawToken, baseURL) {
  const token = String(rawToken || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return "";
  const url = (baseURL || "").trim() || DEFAULT_BROKER_URL;
  return JSON.stringify({
    type: "openai",
    config: {
      model: "google/gemma-4-26b-a4b",
      apiKey: token,
      maxTokens: 1024,
      temperature: 0,
      configuration: {
        baseURL: url
      }
    }
  });
}

function main() {
  const [rawToken = ""] = process.argv.slice(2);
  const modelJson = brokerModel(rawToken, process.env.AUX4_INFERENCE_URL);
  if (modelJson) process.stdout.write(modelJson);
}

main();
