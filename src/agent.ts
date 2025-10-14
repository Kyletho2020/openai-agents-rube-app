import { hostedMcpTool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { Handler } from "@netlify/functions";

// Tool definitions
const mcp = hostedMcpTool({
  serverLabel: "Rube",
  allowedTools: [
    "RUBE_CREATE_PLAN",
    "RUBE_MULTI_EXECUTE_TOOL",
    "RUBE_REMOTE_BASH_TOOL",
    "RUBE_REMOTE_WORKBENCH",
    "RUBE_SEARCH_TOOLS",
    "COMPOSIO_CREATE_RECIPE",
    "COMPOSIO_EXECUTE_RECIPE",
    "COMPOSIO_GET_RECIPE_DETAILS",
    "COMPOSIO_UPDATE_RECIPE",
    "RUBE_MANAGE_CONNECTIONS"
  ],
  authorization: process.env.RUBE_API_KEY || "",
  requireApproval: "never",
  serverUrl: "https://rube.app/mcp"
});

const myAgent = new Agent({
  name: "My agent",
  instructions: "You are my personal assistant. Use my free-to-use API programs to help me with my tasks. If you require more information or clarification about a task, ask me specific questions before proceeding. Your goal is to assist efficiently, leveraging the available APIs for task completion.",
  model: "gpt-5",
  tools: [mcp],
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto"
    },
    store: true
  }
});

type ConversationMessage = {
  role: "user" | "assistant";
  text: string;
};

type WorkflowInput = {
  input_as_text: string;
  conversation_history?: ConversationMessage[];
};

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const state = {};

  const conversationHistory: AgentInputItem[] = [
    ...(workflow.conversation_history ?? []).map((message) => {
      if (message.role === "assistant") {
        return {
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: message.text
            }
          ]
        } satisfies AgentInputItem;
      }

      return {
        role: "user",
        content: [
          {
            type: "input_text",
            text: message.text
          }
        ]
      } satisfies AgentInputItem;
    }),
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];

  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68ed195aa2e48190bb2be22f66c0d4680dafbb85cf339ce1"
    }
  });

  const myAgentResultTemp = await runner.run(
    myAgent,
    [...conversationHistory]
  );

  conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

  if (!myAgentResultTemp.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  const myAgentResult = {
    output_text: myAgentResultTemp.finalOutput ?? ""
  };

  return myAgentResult;
};

// Netlify Function Handler - wraps your agent
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use POST." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const input = body.input || body.input_as_text || "";
    const history = Array.isArray(body.conversation)
      ? (body.conversation as ConversationMessage[])
      : [];

    if (!input) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing input parameter. Send: { \"input\": \"your message\" }" 
        })
      };
    }

    // Run your workflow
    const result = await runWorkflow({
      input_as_text: input,
      conversation_history: history
    });

    const updatedConversation: ConversationMessage[] = [
      ...history,
      { role: "user", text: input },
      { role: "assistant", text: result.output_text }
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        output: result.output_text,
        conversation: updatedConversation
      })
    };
  } catch (error: any) {
    console.error("Error running agent:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error occurred"
      })
    };
  }
};
