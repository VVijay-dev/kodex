import ky from "ky";
import { toast } from "sonner";
import { z } from "zod"

const editRequestSchema = z.object({
    selectedCode: z.string(),
    fullCode: z.string(),
    instruction: z.string()
});

const editResponseSchema = z.object({
    editedCode: z.string(),
});


type EditRequest = z.infer<typeof editRequestSchema>;
type EditResponse = z.infer<typeof editResponseSchema>;

export const fetcher = async (
    playload: EditRequest,
    signal: AbortSignal
) => {
    try {
        const validPlayload = editRequestSchema.parse(playload);
    const response = await ky.post('/api/quick-edit',
        {
            json:validPlayload,
            signal,
             timeout:90_000,
            retry:0
            

        }
    ).json<EditResponse>();

        const validResponse =  editResponseSchema.parse(response);

        return validResponse.editedCode;

    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === 'AbortError') {
            return null
        }
       if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('Request timed out. The code might be too large or the server is busy.');
        console.error('Timeout after 30s');
        return null;
    }

    // 3. Handle General Errors (404, 500, etc.)
    console.error('Fetch error:', error);
    toast.error('Failed to fetch Quick edit');
    return null;


    }

}