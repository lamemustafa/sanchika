import { createLlmsText } from "../content/generated-documents";

export function GET() {
  return new Response(createLlmsText(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
