import { useFile, useUpadateFile } from "@/features/projects/hooks/use-file";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEditor } from "../hooks/use-editor";
import { CodeEditor } from "./code-editor";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation";
import Image from "next/image";
import { useEffect, useRef } from "react";
const BOUNCE_TIME = 1500
export const EditorView = ({ projectId }: { projectId: Id<'projects'> }) => {

    const { activeTabId } = useEditor(projectId)
    const activeFile = useFile(activeTabId);
    const updateFile = useUpadateFile()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isActiveFileBinary = activeFile && activeFile.storageId
    const isActiveFileText = activeFile && !activeFile.storageId

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)

            }
        }

    }, [])

    return (
        <div className="h-full flex flex-col" >
            <div className="flex items-center">
                <TopNavigation projectId={projectId} />
            </div>
            {activeTabId && <FileBreadcrumbs projectId={projectId} />}
            <div className="min-h-0 bg-background flex-1">
                {!activeFile && (<div className="h-full flex items-center justify-center ">
                    <Image src={'/globe.svg'} height={30} width={40} alt="logo" />
                </div>)}
                {isActiveFileText && (
                    <CodeEditor fileName={activeFile.name} onChange={(content: string) => {

                        timeoutRef.current = setTimeout(() => {
                            updateFile({ id: activeFile._id, content: content })

                        }, BOUNCE_TIME)
                    }} initialValue={activeFile.content} key={activeFile._id} />
                )}
                {isActiveFileBinary && (
                    <p>Todo implement binary file</p>
                )}
            </div>


        </div>
    )

}