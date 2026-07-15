import { createSanchikaManifest } from "../content/generated-documents";

export function GET() {
  return new Response(`${JSON.stringify(createSanchikaManifest(), null, 2)}\n`, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
