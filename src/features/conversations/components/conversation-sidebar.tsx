import { Id } from "../../../../convex/_generated/dataModel";
import {Conversation, ConversationScrollButton, ConversationContent} from "@/components/ai-elements/conversation"
import {Message, MessageAction, MessageActions, MessageContent, MessageResponse} from "@/components/ai-elements/message"

import {PromptInput, PromptInputActionMenuTrigger, PromptInputBody, PromptInputFooter, PromptInputMessage, PromptInputSubmit, PromptInputTextarea, PromptInputTools} from '@/components/ai-elements/prompt-input'
import { DEAULT_CONVERSATION_TITLE } from "../../../../convex/constants";
import { Button } from "@/components/ui/button";
import { CopyIcon, HistoryIcon, LoaderCircle, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useConverstaion, useConverstaions, useCreateConversation, useMessages } from "../hooks/use-conversations";
import { toast } from "sonner";
import ky from "ky";
import { Spinner } from "@/components/ui/spinner";


export const ConversationSideBar = ({projectId}:{projectId:Id<'projects'>})=>{

    const [input, setInput] = useState('')

    const [selectedConversationId, setSelectedConversationId] = useState<Id<'conversations'> | null>(null);
    const createConversation = useCreateConversation();
    const conversations = useConverstaions(projectId);

   // Add a check to ensure conversations exists and has at least one item
const activeConversationId = selectedConversationId ?? (conversations && conversations.length > 0 ? conversations[0]._id : null);
    const activeConversation = useConverstaion(activeConversationId);



    const conversationMessages = useMessages(activeConversationId);


    // check if any message is currently processing 
    const isProcessing = 
    
     conversationMessages?.some((msg) => msg.status === 'processing')


    const handleCreateConversation = async () =>{
        try{
            const newconversationId = await createConversation({projectId:projectId,title:DEAULT_CONVERSATION_TITLE})
       
       
            setSelectedConversationId(newconversationId)
            return newconversationId;
        }catch(error){
            toast.error('Unable to create new conversation')
            return null
        }

    }

    const handleSubmit = async(message:PromptInputMessage)=>{
        // if processing and no new message this is just a stop function

        if(isProcessing && !message.text){
            // todo await handleCancel()
            setInput('')
            return;
        }

        let conversationId = activeConversationId;

        if(!conversationId) {
            conversationId = await handleCreateConversation();
        }

        if(!conversationId)return;


        // Trigger Inngest function via API 

        try{
            await ky.post('/api/messages',{
                json:
                {
                    conversationId:conversationId,
                    message:message.text               
                }
            })
            setInput('')


        } catch(error){
            console.error(error)
            toast.error('Message failed to send!');

        }
    }


 
    return (
       <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
            <div className="text-sm truncate pl-3">
                
                {activeConversation?.title ?? DEAULT_CONVERSATION_TITLE}
                
                </div>

        
        <div className="flex items-center px-1 gap-2">
            <Button variant='hightlight' size='icon-sm'>
                <HistoryIcon className="size-3.5"/>
            </Button>
              <Button variant='hightlight' size='icon-sm' onClick={handleCreateConversation}>
                <PlusIcon className="size-3.5"/>
            </Button>
        </div>
        </div>

        <Conversation>
            <ConversationContent>
                {conversationMessages?.map((message,messageIndex) => {
                    return (

                        <Message key={message._id} from={message.role}>
                            <MessageContent>
                                {message.status === 'processing' ? (<div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Spinner>
                                    </Spinner><span>Thinking...</span></div>):
                                
                                <MessageResponse>{message.content}</MessageResponse>
                                
                                }
                               
                            </MessageContent>
                            {message.role === 'assistant' && message.status === 'completed'
                             && messageIndex === (conversationMessages.length>>0)-1  && (
                                <MessageActions>
                                    <MessageAction onClick={() => {navigator.clipboard.writeText(message.content)} } label="Copy">
                                        <CopyIcon /> 
                                    </MessageAction>
                                </MessageActions>
                            )}


                        </Message>
                    )
                })}
            </ConversationContent>
            <ConversationScrollButton/>

        </Conversation>
        <div className="p-3">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
                <PromptInputTextarea placeholder="Ask for AI" 
                onChange={(e)=>setInput(e.target.value)}
                 value={input} disabled={isProcessing

                }/>
            </PromptInputBody>
            <PromptInputFooter>
                <PromptInputTools/>
                <PromptInputSubmit disabled={isProcessing? false : !input} status={isProcessing ? 'streaming' :undefined } />

            </PromptInputFooter>

          </PromptInput>

        </div>
       </div>
    )
}