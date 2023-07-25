import { Configuration, OpenAIApi } from "openai";
import { genericCompletion } from "./genericModelCompletion";
import { env } from "~/env.mjs";

const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const ONE_TOKEN = 4; // general GPT estimate, 1 token = 4 characters

//costs like $0.30 for a 2 hour podcast on average
export const summarizeTranscript = async (transcript: string) => {

    const maxPromptTokens = 90000;
    const maxPromptLength = maxPromptTokens * ONE_TOKEN;

    console.log('Estimated transcript tokens: ', transcript.length / ONE_TOKEN);

    const partialTranscript = transcript.substring(0, maxPromptLength);

    console.log('partial transcript', partialTranscript.length / ONE_TOKEN);

    const response = await genericCompletion(
        "anthropic/claude-2",
        [{
            role: "system",
            content: `Please summarize the main events in of this youtube video transcript in a few paragraphs, so we can make a good title.

            Do not give any preface or introduction, just summarize the main events and story of the video.

            Use names where you can.

            Transcript: "${partialTranscript}"
        `}
        ],
        0.9
    );

    return response;

}
