import axios, { AxiosRequestConfig } from 'axios';
import { env } from '~/env.mjs';

type LLMResponseChunk = {
    choices: {
        index: number,
        delta: {
            role: string,
            content: string
        },
        finish_reason: string | null
    }[],
    model: string
}

export const genericCompletion = async (model: string, messages: { role: string, content: string }[], temperature: number): Promise<string | null> => {
    const URL = `https://openrouter.ai/api/v1/chat/completions`;
    const headers = {
        'Authorization': 'Bearer ' + env.OPENROUTER_API_KEY,
        'X-Title': 'Ai-Title-Generator'
    };
    const body = {
        model,
        messages,
        stream: true,
    };

    const config: AxiosRequestConfig = {
        headers,
        responseType: 'stream',
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    };

    try {
        const response = await axios.post(URL, body, config);

        let partialResponses: LLMResponseChunk[] = [];
        let buffer = '';

        // The data is streamed in chunks from the server, so we concatenate it until it's fully loaded.
        response.data.on('data', (chunk: any) => {
            try {
                console.log(chunk?.toString());
                if(chunk.toString() === 'data: [DONE]' || chunk.toString().includes('OPENROUTER')) {
                    console.log('info chunk', chunk.toString());
                    return;
                }
                buffer += chunk.toString();
            } catch (error) {
                console.log(chunk);
            }

        });


        // The 'end' event indicates that the entire body was received
        return new Promise<string>((resolve, reject) => {
            response.data.on('end', () => {
                // convert buffer into array of partial responses
                const partialResponsesStr = buffer.split('data: ');
                partialResponses = partialResponsesStr.map(str => {
                    try {
                        return JSON.parse(str);
                    } catch (error) {
                        console.log('error parsing', str);
                        return null;
                    }
                }).filter(res => res !== null) as LLMResponseChunk[];

                //combine all content
                
                const allContent = partialResponses.reduce((acc, curr) => {
                    return acc + (curr?.choices?.[0]?.delta?.content || '');
                }, '');

                console.log('allContent', allContent);
                resolve(allContent);
            });

            //on error
            response.data.on('error', (err: any) => {
                console.log(err);
                reject(null);
            });
        });

    } catch (error: any) {
        console.log(error);
        console.log(error?.response?.data?.error);
        return null;
    }
};
