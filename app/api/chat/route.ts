export async function GET() {
  const openai_response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  const openai_data = await openai_response.json();
  const openai_models_list = openai_data.data
    .map((m: any) => m.id)
    .filter((id: string) =>
      /^gpt-(4|5)/.test(id) &&
      !id.includes("-20") &&
      !id.includes("preview") &&
      !id.includes("realtime")
    );
  const claude_response = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
  });

  const claude_models = await claude_response.json();
  const claude_models_list = claude_models.data.map((m: any) => m.id)

  return Response.json({ openai_models_list, claude_models_list });
}


export async function POST(req: Request) {
  const { message, model, history } = await req.json();
  const isOpenAI = model.startsWith("gpt-");

  const url = isOpenAI
    ? "https://api.openai.com/v1/responses"
    : "https://api.anthropic.com/v1/messages";

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (isOpenAI) {
    headers.set("Authorization", `Bearer ${process.env.OPENAI_API_KEY!}`);
  } else {
    headers.set("x-api-key", process.env.ANTHROPIC_API_KEY!);
    headers.set("anthropic-version", "2023-06-01");
  }

  const body = isOpenAI
    ? {
      model,
      input: history.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }
    : {
      model,
      max_tokens: 1024,
      stream: true,
      messages: history.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace("data:", "").trim();
          if (!jsonStr) continue;

          if (jsonStr === "[DONE]") {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);

            let text = "";
            let usage = null;

            if (isOpenAI) {
              if (parsed.type === "response.output_text.delta") {
                text = parsed.delta || "";
              }

              if (parsed.type === "response.completed") {
                usage = parsed.response?.usage;
              }
            } else {
              if (parsed.type === "content_block_delta") {
                text = parsed.delta?.text || "";
              }

              if (parsed.type === "message_delta") {
                usage = parsed.usage;
              }
            }

            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  })}\n\n`
                )
              );
            }

            if (usage) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "usage",
                    usage,
                  })}\n\n`
                )
              );
            }

          } catch (e) { }
        }
      }

      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}