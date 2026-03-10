import { auth } from '@clerk/nextjs/server'
import { v } from 'convex/values'
import { NextResponse } from 'next/server';
import {z} from 'zod'
import { api } from '../../../../convex/_generated/api';
import { convexClient } from '@/lib/convex-client';
import { Id } from '../../../../convex/_generated/dataModel';
import { inngest } from '@/inngest/client';


const requestSchema = z.object({
    conversationId:z.string(),
    message:z.string(),
})


export async function POST(request:Request){
    const {userId} = await auth();

    if(!userId){
        return NextResponse.json({ error:"Unauthorized"},{status:401})
    }

    const internalKey = process.env.CONVEX_INTERNAL_KEY!;



    const body = await request.json();

    const {conversationId,message} = requestSchema.parse(body);

    // call convex mutation,query
    const conversation = await convexClient.query(api.system.getConversationById,
        {conversationId:conversationId as Id<'conversations'>,
            internalKey:internalKey
        
        });

        if(!conversation){
            return NextResponse.json({error:"Conversation not found "},{status:404});
        }

        const projectId = conversation.projectId;

        // Todo check for processsing messages

        // create user message
         await convexClient.mutation(api.system.createMessage,{
            internalKey:internalKey,
            conversationId:conversationId as Id<'conversations'>,
            projectId,
            role:"user",
            content:message,
            
        })

        const assistantMessageId = await convexClient.mutation(api.system.createMessage,{
            internalKey:internalKey,
            conversationId:conversationId as Id<'conversations'>,
            projectId,
            role:"assistant",
            content:'',
            status:'processing'
            
        })


        // Todo invoke the inngest to process the message

       const event =  await inngest.send({name:'message/sent',data:{
            messageId:assistantMessageId
        }},)



        return NextResponse.json({
            success:true,
            eventId: event.ids[0],
            message:assistantMessageId
        })






    
   
    
}

