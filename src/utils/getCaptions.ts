import { google } from 'googleapis';
var service = google.youtube('v3');
import { generateAuthedClient } from "~/utils/youtubeAuth";

const stringIsNum = (str: string) => {
    return /^\d+$/.test(str);
}

export const getCaptions = async (videoId: string, accessToken: string, refreshToken: string, redirectUrl?: string) => {
    const authedClient = generateAuthedClient({ accessToken: accessToken, refreshToken: refreshToken, redirectUrl });

    const allCaptions = await service.captions.list({
        auth: authedClient,
        part: ['snippet', 'id'],
        videoId: videoId,
        // maxResults: 50
    });

    console.log('allCaptions', allCaptions);

    const bestCaption = allCaptions?.data?.items?.[0];

    if (!bestCaption || !bestCaption.id) {
        return null;
    }

    const rawCaption = await service.captions.download({
        auth: authedClient,
        id: bestCaption.id,
        tfmt: 'srt',
    });

    const captionRawText = rawCaption?.data as string;

    if (!captionRawText) {
        return null;
    }

    const justTheText = captionRawText.split('\n').filter((line, i) => line.length > 0 && !line.includes('-->') && !stringIsNum(line)).join('\n');

    console.log('justTheText', justTheText);

    return justTheText;
}