"use client"

import { ConversationSideBar } from "@/features/conversations/components/conversation-sidebar";
import { Id } from "../../../../convex/_generated/dataModel"
import { Navbar } from "./navbar"
import { Allotment } from "allotment";



const DEAULT_CONVERSATION_SIDEBAR_WIDTH = 400
const DEFAULT_MAIN_SIZE = 1000
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH =  800


export const ProjectIdLayout = ({children,projectId}:{children:React.ReactNode,projectId:Id<"projects">})=>{
    return (

        <div className="w-full h-screen flex flex-col"
        >
            <Navbar projectId = {projectId}/>
            <Allotment className="flex-1"
            defaultSizes={[
                DEAULT_CONVERSATION_SIDEBAR_WIDTH,
                DEFAULT_MAIN_SIZE
            ]}
            >
                <Allotment.Pane 
                minSize={MIN_SIDEBAR_WIDTH}
                maxSize={MAX_SIDEBAR_WIDTH}
                snap
                preferredSize={DEAULT_CONVERSATION_SIDEBAR_WIDTH}
                >
               <ConversationSideBar projectId  = {projectId}/>

                </Allotment.Pane>
                <Allotment.Pane >
                     {children}
                </Allotment.Pane>
                 

            </Allotment>
             
          
            
            </div>
    )
}