import ky from 'ky'
import {z} from 'zod'
import { toast } from 'sonner';

const suggestionRequestSchema =  z.object({
    fileName:z.string(),
    code:z.string(),
    currentLine:z.string(),
    previousLines:z.string(),
    textBeforeCursor:z.string(),
    textAfterCursor:z.string(),
    nextLines:z.string(),
    lineNumber:z.string(),
})
const suggestionResponseSchema = z.object({
    suggestion:z.string(),
});

type suggestionRequest = z.infer<typeof suggestionRequestSchema>
type suggestionResponse = z.infer<typeof suggestionResponseSchema>

export const fetcher = async(
    playload:suggestionRequest,
    signal :AbortSignal
):Promise<string | null > =>{
    try{
        const validationPlayload = suggestionRequestSchema.parse(playload) ;
    const response = await ky.post('/api/suggestion',
        {
            json:validationPlayload,
            signal,
            timeout:10_000,
            retry:0
            

        }
    ).json<suggestionResponse>();

    const validationResponse = suggestionResponseSchema.parse(response)
    return validationResponse.suggestion ||  null;
    }catch(error){
        if(error instanceof Error && error.name === 'AbortError'){
            return null
        } 
        toast.error('Failed to fectch AI completion')
        return null;

    }

}

