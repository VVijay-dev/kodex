import { EditorView, showTooltip, Tooltip, ViewUpdate } from "@codemirror/view"
import {EditorState, StateField} from "@codemirror/state"
import { quickEditState, showQuickEditEffect } from "./qucik-edit";


let editorView : EditorView | null = null;

const createToolTipForSelection = (state:EditorState): readonly Tooltip[] =>{
    const selection = state.selection.main;
    if(selection.empty){
        return []
    }

    const isQuickEditActive = state.field(quickEditState)
    if(isQuickEditActive){
        return []
    }
    return [
        
        {
        pos:selection.to,
        above:false,
        strictSide:false,
        create(
        ){
            const dom = document.createElement('div');
            dom.className = "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-1 shadow-md flex items-center gap-2 text-sm"
            const addTochatButton = document.createElement('button');
            addTochatButton.className = "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm"
            addTochatButton.textContent = 'Add to chat'


             const qucikEditButton  = document.createElement('button');
            qucikEditButton.className = "font-sans p-1 px-2 hover:bg-foreground/10 rounded-sm flex items-center gap-1"
          


            const qucikEditButtonText = document.createElement('span');
            qucikEditButtonText.textContent = "Quick Edit"


            const qucikEditButtonShortcut = document.createElement('span')
            qucikEditButtonShortcut.textContent = "CMDK"
            qucikEditButtonShortcut.className = 'text-sm opacity-60'



            qucikEditButton.appendChild(qucikEditButtonText)
            qucikEditButton.appendChild(qucikEditButtonShortcut)


            qucikEditButton.onclick= ()=>{
                if(editorView){
                    editorView.dispatch({
                        effects:showQuickEditEffect.of(true)
                    })
                }
            }
            dom.appendChild(addTochatButton),
            dom.appendChild(qucikEditButton)



            return {dom};
        }

    }]

}


const selectionTooltipField = StateField.define<readonly Tooltip[]>({
    create(state){
        return createToolTipForSelection(state)
    },
    update(tooltips,transaction){
        if(transaction.docChanged || transaction.selection){
            return createToolTipForSelection(transaction.state);
        }
        for(const effect of transaction.effects){
            if(effect.is(showQuickEditEffect)){
                return createToolTipForSelection(transaction.state)
            }
        }
        return tooltips;
    },

    provide: (field) => showTooltip.computeN(
        [field],
        (state) => state.field(field)
    )
    
})

const captureViewExtension = EditorView.updateListener.of((update) => {
    editorView = update.view
})


export const selectionTooptip = () =>[
selectionTooltipField,
captureViewExtension
    
]