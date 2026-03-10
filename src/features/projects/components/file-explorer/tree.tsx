import { ChevronRightIcon } from "lucide-react";
import { FileIcon,FolderIcon } from "@react-symbols/icons/utils";
import { cn } from "@/lib/utils";
import { useCreateFile,useCreateFolder,useDeleteFile,useFolderContents, useRenameFile } from "../../hooks/use-file";
import { getItemPadding } from "./constants";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { Doc,Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { RenameInput } from "./rename-input";
import { useEditor } from "@/features/editor/hooks/use-editor";

export const Tree = ({item,projectId,level= 0}:{
    item:Doc<'files'>,
    projectId:Id<'projects'>
    level?:number
})=>{
    const [isOpen ,setIsOpen] = useState(false)
    const [isRenaming,setIsRenaming] = useState(false)
    const [creating,setCreating] = useState<'file' | 'folder'| null>(null)


    const renameFile = useRenameFile();
    const deleteFile = useDeleteFile();
    const createFile = useCreateFile();
     const createFolder = useCreateFolder();

     const {openFile,closeTab,activeTabId}  = useEditor(projectId);

     const folderContents = useFolderContents(
        {
            projectId,
            parentId:item._id,
            enabled:item.type === 'folder' && isOpen,
        }
     )

     const startCreating = (type : 'file' | 'folder')=>{
        setIsOpen(true)
        setCreating(type)

     }


     const handleRename =  (newName:string)=>{
        setIsRenaming(false)
    
       

        if(item.name === newName)
        {
            return;
        }
        renameFile({
            newName,
            id: item._id
        })
     }

     const handleCreate = (name:string) =>{
        setCreating(null)
        if (creating === 'file'){
            createFile({
                projectId,
                name:name,
                parentId:item._id,
                content:''
            })
        }else{
            createFolder({
                name,
                projectId,
                parentId:item._id
            })
        }

     }
 
     
     
      if(item.type === 'file'){
        const fileName = item.name
        const isActive = activeTabId === item._id
        if(isRenaming){
            return (
                <RenameInput level={level} defaultValue={item.name} onSubmit={handleRename} isOpen={isOpen} type={'file'} onCancel={()=>setIsRenaming(false)}/>
            )

        }
        return (
            <TreeItemWrapper item={item}
         isActive={isActive}
         onClick={()=>openFile(item._id,{pinned:false})}
          onDoubleClick={()=>openFile(item._id,{pinned:true})}
           onRename={()=> setIsRenaming(true)}
            onDelete={async()=>{
               await  deleteFile({id:item._id})
                closeTab(item._id)
                
            }}
         level={level}
         >
            
            <FileIcon fileName={fileName} className="size-4"></FileIcon>
            <span className="text-sm truncate"> {item.name}</span>

         </TreeItemWrapper>
        )
        
     }
     const folderName = item.name

     const folderRender = (
        <>
        <div className="flex items-center gap-0.5">
            <ChevronRightIcon className={cn(
                  'size-4 shrink-0 text-muted-foreground',
                    isOpen && 'rotate-90'
            )}/>
            <FolderIcon folderName={folderName} className="size-4"/>
               <span className="text-sm truncate"> {item.name}</span>
        </div>
        </>
     )

     if(creating){
        return (
            <>
            <button 
            onClick={() => setIsOpen(value => !value)}

            className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-gull" style={{paddingLeft:getItemPadding(level,false)}}>
            
            {folderRender}
            </button>
            {isOpen && (<> {folderContents === undefined && <LoadingRow level={level+1}/>}
            
            <CreateInput  type={creating} level={level+1} onSubmit={handleCreate} onCancel={()=> setCreating(null)} />
{folderContents?.map((subItem)=> (
    <Tree key={subItem._id} item={subItem} level={level+1} projectId={projectId}/>
))}
            </>)}
           
            </>
        )

     }

     
     if(isRenaming){
        return (
            <>
             <RenameInput level={level} defaultValue={item.name} onSubmit={handleRename} isOpen={isOpen} type={'folder'} onCancel={()=>setIsRenaming(false)}/>
            
           
            {isOpen && (<> {folderContents === undefined && <LoadingRow level={level+1}/>}
            
            
{folderContents?.map((subItem)=> (
    <Tree key={subItem._id} item={subItem} level={level+1} projectId={projectId}/>
))}
            </>)}
           
            </>
        )

     }

    return (
        <>
        <TreeItemWrapper
        item={item}
        isActive={false}
         onClick={()=>{setIsOpen(prev => !prev
         ),
        
        handleRename
        }}
         
           onRename={()=> setIsRenaming(true)}
            onDelete={()=>deleteFile({id:item._id})}
         level={level}
         onCreateFile={()=> startCreating('file')}
         onCreateFolder={()=> startCreating('folder')}
        >
            {folderRender}
        </TreeItemWrapper>
        {isOpen && (
            <>
            {folderContents === undefined && <LoadingRow level={level +1}/>}
            {folderContents?.map((subItem)=>(
                <Tree key={subItem._id} item={subItem} level={level+1} projectId={projectId}/>
            ) )}
            </> 
        )}
        
        </>
    )
    

}