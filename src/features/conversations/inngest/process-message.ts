import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError, step } from "inngest";
import { convexClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";


interface MessageEvent {
    messageId: Id<'messages'>,
    // conversationId:Id<'conversations'>,
    // projectId:Id<'projects'>,
    // message:string
}

export const processMessge = inngest.createFunction(
    {
        id: 'process-message',

        cancelOn: [
            {
                event: 'message/cancel',
                if: 'event.data.messageId == async.data.messageId'

            }
        ],

        onFailure: async ({ event, step }) => {
            const { messageId } = event.data.event.data as MessageEvent;
            const internalKey = process.env.CONVEX_INTERNAL_KEY;
            if (internalKey) {


                await step.run('update-message-on-failure', async () => {
                    await convexClient.mutation(api.system.updateMessageContent, {
                        messageId,
                        internalKey,
                        content: 
                        'My apologies,I encountered an error while processing your request, Let me know if you need anything else!'
                    })

                })
            }


        }
    },
    {
        event: "message/sent"
    },
    async ({ event, step }) => {
        const { messageId } = event.data as MessageEvent

        const internalKey = process.env.CONVEX_INTERNAL_KEY;

        if (!internalKey) {
            throw new NonRetriableError('convex internal is not configured');
        }

        await step.sleep('wait-for-ai-processing', '5s');
        
       

        await step.run('update-assistant-message', async () => {
            await convexClient.mutation(api.system.updateMessageContent, {
                messageId,
                internalKey,
                content: "AI processed this message todo"
            })
        })
    }

);