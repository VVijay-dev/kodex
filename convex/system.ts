import { NextResponse } from "next/server";
import { mutation, query } from "./_generated/server";
import {v} from "convex/values"

const validateInternalKey = (key:string) =>{
    const internalKey = process.env.CONVEX_INTERNAL_KEY;

    if(!internalKey){
        throw Error("Convex_internal_key is not configured")
    }

    if(key !== internalKey){
        throw Error('Invalid internal key');
    }
}

export const getConversationById  = query({
    args:{conversationId : v.id('conversations'),internalKey:v.string()},
    handler:async (ctx, args )=>{
        validateInternalKey(args.internalKey);
        return await ctx.db.get('conversations', args.conversationId);

    }
})


export const createMessage  = mutation({
    args:{
        conversationId : v.id('conversations'),
        internalKey:v.string(),
    
        projectId: v.id('projects'),
        role:v.union(v.literal('user'),v.literal('assistant')),
        content:v.string(),
        status:v.optional(
            v.union(
                v.literal('processing'),
                v.literal('completed'),
                v.literal('cancelled')
            )
        )
    
    },
    handler:async (ctx, args )=>{
        validateInternalKey(args.internalKey);

    const messageId = await ctx.db.insert('messages',{
        conversationId:args.conversationId,
        projectId:args.projectId,
        role:args.role,
        content:args.content,
        status: args.status,

    })

    await ctx.db.patch(args.conversationId,{
        updatedAt: Date.now(),
    })


    return messageId;
      

    }
})

export const updateMessageContent  = mutation({
    args:{
        messageId: v.id('messages'),
        content:v.string(),
        internalKey:v.string(),

    },
    handler:async (ctx, args )=>{
        validateInternalKey(args.internalKey);

   
    await ctx.db.patch(args.messageId,{
        content:args.content,
        status:'completed' as const , 

    })

    
      

    }
})
