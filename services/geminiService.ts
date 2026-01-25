
import { GoogleGenAI, Type } from "@google/genai";
import { TeamRoom, AIResponse, RoomRole, UserStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are TeamFlow AI Core. Respond ONLY in JSON.

ACTION TRIGGERS:
1. ADD_TASK: 
   - Pattern: "[Name] needs to [action]", "I should [action]", "Task: [action]", "[Name] will [action]".
   - Assignee: Map names to the PERSONNEL list (e.g., "Alex" -> "Alex Rivera").
   - Title: The specific action and deadline mentioned.

2. ANNOUNCE:
   - Pattern: "Announce...", "Broadcast...", "Tell everyone...".
   - Scope: "global" for all channels, "local" for this channel.

3. PRESENCE_UPDATE:
   - Pattern: "going on a break", "brb", "away", "back", "lunch", "meeting", "signing off".
   - Status: "idle" for breaks/lunch, "offline" for signing off, "online" for back.

RESPONSE PROTOCOL:
- shouldIntervene: MUST be true if any of the above patterns are detected.
- replyText: A very short confirmation (e.g., "Logged the task for Alex.").
- presenceUpdates: Array of { userId: string, status: "online" | "offline" | "idle" }.
- actions: Array of { type: "ADD_TASK" | "ANNOUNCE", payload: { title, assignee, content, scope } }.`;

export async function processChatContext(
  room: TeamRoom, 
  newMessage: string, 
  senderName: string,
  userRole: RoomRole = 'member'
): Promise<AIResponse> {
  const history = room.messages.slice(-2).map(m => `${m.senderName}: ${m.content}`).join("\n");
  const personnel = room.members.map(m => m.name).join(", ");

  const prompt = `ROOM: #${room.name}\nSENDER: ${senderName}\nPERSONNEL: ${personnel}\nHISTORY:\n${history}\nINPUT: "${newMessage}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shouldIntervene: { type: Type.BOOLEAN },
            replyText: { type: Type.STRING },
            presenceUpdates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  userId: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["userId", "status"]
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  payload: { 
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      assignee: { type: Type.STRING },
                      content: { type: Type.STRING },
                      scope: { type: Type.STRING }
                    }
                  }
                },
                required: ["type", "payload"]
              }
            }
          },
          required: ["shouldIntervene", "replyText", "actions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      shouldIntervene: parsed.shouldIntervene ?? false,
      replyText: parsed.replyText ?? "",
      actions: parsed.actions ?? [],
      presenceUpdates: parsed.presenceUpdates ?? []
    };
  } catch (error) {
    console.error("AI Context Error:", error);
    return { shouldIntervene: false, replyText: "System busy.", actions: [] };
  }
}

export async function summarizeChannel(room: TeamRoom): Promise<string> {
  const history = room.messages.slice(-10).map(m => `${m.senderName}: ${m.content}`).join("\n");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Short technical recap:\n\n${history}`,
      config: { 
        systemInstruction: "One short sentence.",
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "No recent logs.";
  } catch (error) {
    return "Recap failed.";
  }
}
