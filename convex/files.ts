import { v } from "convex/values";
import { mutation, query } from "./_generated/server"
import { VerifyAuth } from "./auth"
import { Doc, Id } from "./_generated/dataModel";


export const getFiles = query({
    args: {
        projectId: v.id('projects')

    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const project = await ctx.db.get('projects', args.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }



        return await ctx.db.query('files').withIndex('by_project', (q) => q.eq('projectId', args.projectId)).collect()

    },
})

export const getFile = query({
    args: {
        id: v.id('files')
    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);
        const file = await ctx.db.get('files', args.id)

        if (!file) {
            throw new Error("file not found")
        }

        const project = await ctx.db.get('projects', file.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }

        return file;


    }
})


export const getFolderContent = query({
    args: {
        projectId: v.id('projects'),
        parentId: v.optional(v.id('files'))
    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const project = await ctx.db.get('projects', args.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }



        const files = await ctx.db.query('files').withIndex('by_project_parent', (q) => q.eq('projectId', args.projectId).eq('parentId', args.parentId)).collect()
        return files.sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1
            if (a.type === 'file' && b.type === 'folder') return 1
            return a.name.localeCompare(b.name);
        });

    },
})


export const createFile = mutation({
    args: {
        projectId: v.id('projects'),
        parentId: v.optional(v.id('files')),
        content: v.string(),
        name: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const project = await ctx.db.get('projects', args.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }
        const files = await ctx.db.query('files').withIndex('by_project_parent',
            (q) => q.
                eq('projectId', args.projectId).
                eq('parentId', args.parentId))
            .collect()

        const existing = files.find((file) => file.name === args.name && file.type === 'file')

        if (existing) throw new Error('file already exists');

        await ctx.db.insert('files', {
            projectId: args.projectId,
            parentId: args.parentId,
            updatedAt: Date.now(),
            type: 'file',
            name: args.name,
            content: args.content

        })
        await ctx.db.patch('projects',args.projectId,{
            
            updatedAt:Date.now()
        });
    },
})




export const createFolder = mutation({
    args: {
        projectId: v.id('projects'),
        parentId: v.optional(v.id('files')),

        name: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const project = await ctx.db.get('projects', args.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }
        const folder = await ctx.db.query('files').withIndex('by_project_parent',
            (q) => q.
                eq('projectId', args.projectId).
                eq('parentId', args.parentId))
            .collect()

        const existing = folder.find((folder) => folder.name === args.name && folder.type === 'folder')

        if (existing) throw new Error('Folder already exists');

        await ctx.db.insert('files', {
            projectId: args.projectId,
            parentId: args.parentId,
            updatedAt: Date.now(),
            type: 'folder',
            name: args.name,

        })
        await ctx.db.patch('projects',args.projectId,{
            
            updatedAt:Date.now()
        });
    },
})


export const renameFile = mutation({
    args:
        { id: v.id('files'), newName: v.string() },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const file = await ctx.db.get('files', args.id)

        if (!file) {
            throw new Error('File not found')
        }
        const project = await ctx.db.get('projects', file.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }


        //    check if a file with the new name already exists in the same parent folder
        const siblings = await ctx.db.query('files').withIndex('by_project_parent',
             (q) => q.eq('projectId', file.projectId).
             eq('parentId', file.parentId)).collect()
        
        const existing = siblings.find((sibling) => sibling.name === args.newName && sibling.type === file.type && sibling._id !== args.id)

        if(existing){
            throw new Error(
                `A ${file.type} with this name already exists in this location`
            )
        }
        await ctx.db.patch('files',args.id,{
            name:args.newName,
            updatedAt:Date.now()
        })
         await ctx.db.patch('projects',file.projectId,{
            
            updatedAt:Date.now()
        });

    }
})




export const deleteFile = mutation({
    args:
        { id: v.id('files'), },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

        const file = await ctx.db.get('files', args.id)

        if (!file) {
            throw new Error('File not found')
        }
        const project = await ctx.db.get('projects', file.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }


        const deleteRecursive = async (fileId:Id<'files'>)=>{

            const item = await ctx.db.get('files',fileId)

            if(!item){
                return ;
            }

            //  IF it's a folder delete all childrens first
            if(item.type === 'folder'){
                const childrens = await ctx.db.query('files').withIndex('by_project_parent',(q)=>
                q.eq('projectId',item.projectId).eq('parentId',fileId)
                ).collect();

            for(const child of childrens){
                await deleteRecursive(child._id)

            }

            }
            if(item.storageId){
                await ctx.storage.delete(item.storageId)

            }
            await ctx.db.delete('files',fileId)

        }
const now = Date.now();
        await deleteRecursive(args.id)
         await ctx.db.patch('projects',file.projectId,{
            
            updatedAt:now
        });

    }
})

export const updateFile = mutation({
    args:{id:v.id('files'),
        content:v.string()

    },
    handler :async (ctx,args)=>{
          const identity = await VerifyAuth(ctx);

        const file = await ctx.db.get('files', args.id)

        if (!file) {
            throw new Error('File not found')
        }
        const project = await ctx.db.get('projects', file.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }
const now = Date.now();
        
        await ctx.db.patch('files',args.id,{
            content:args.content,
            updatedAt:now
        });
        
        await ctx.db.patch('projects',file.projectId,{
            
            updatedAt:now
        });
    }
}
)




export const getFilePath = query({
    args: {
       id:v.id('files')
    },
    handler: async (ctx, args) => {
        const identity = await VerifyAuth(ctx);

         const file = await ctx.db.get('files', args.id)
              if (!file) {
            throw new Error('File not found')
        }

        const project = await ctx.db.get('projects', file.projectId)

        if (!project) {
            throw new Error('project not found')
        }

        if (project.ownerId !== identity.subject) {
            throw new Error('unauthorized access to this project')
        }
        
        const path:{_id:string,name:string}[] = [];
        let currentId : Id<"files"> |undefined = args.id;
        while (currentId){
            const file = (await ctx.db.get('files',currentId) ) as | Doc<'files'> | undefined
                if (!file) break;

            path.unshift({_id: file._id, name : file.name})
            currentId = file.parentId;

        }

return path;
   

    },
})