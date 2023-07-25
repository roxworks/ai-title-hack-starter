import { google, youtube_v3 } from "googleapis";
import { generateAuthedClient } from "./youtubeAuth";
let service = google.youtube('v3');

export const getVideosForChannel = async (channelId: string, accessToken: string, refreshToken: string, getAllVideos: boolean) => {

    const tokensToUse = {
        accessToken,
        refreshToken,
    }

    let authedClient = generateAuthedClient({...tokensToUse, redirectUrl: null});
    // get my channel ID
    const channelIdResponse = await service.channels.list({
        auth: authedClient,
        part: ['contentDetails'],
        id: [channelId]
        // id: [FORCED_ID]
    });
    console.log('info', 'channel id response', channelIdResponse.data, null, null, 1)
    let uploadsPlaylistId = channelIdResponse.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    // console.console.log(JSON.stringify(channelIdResponse.data, null, 4));
    // get my uploads
    let uploadsResponse = await service.playlistItems.list({
        auth: authedClient,
        part: ['snippet'],
        playlistId: uploadsPlaylistId,
        maxResults: getAllVideos ? 50 : 10
    });
    let uploadsItems = uploadsResponse.data?.items;
    let nextUploadPageToken = uploadsResponse.data?.nextPageToken;

    if (getAllVideos) {
        console.log('info', 'going for next page');
        // get next page
        while (nextUploadPageToken) {
            // console.console.log(nextUploadPageToken);
            let nextPageResponse = await service.playlistItems.list({
                auth: authedClient,
                part: ['snippet'],
                playlistId: uploadsPlaylistId,
                pageToken: nextUploadPageToken,
                maxResults: 50
            });
            console.log('info', 'nextPageResponse', null, null, null, 1)
            nextUploadPageToken = nextPageResponse.data?.nextPageToken;
            uploadsItems = (uploadsItems || []).concat(nextPageResponse.data?.items || []);
        }
    }

    console.log('info', 'Total videos in uploads playlist: ', uploadsItems?.length);
    let uploads = uploadsItems;

    // get all video info 
    let allVideoIds = uploads?.map(item => item.snippet?.resourceId?.videoId).filter(id => id !== undefined && id !== null) as string[];

    console.log('info', 'Total filtered videos in uploads playlist: ', allVideoIds?.length);

    let videoStats: youtube_v3.Schema$Video[] = [];
    console.log('info', "all video ids", allVideoIds.join(','));
    const uniqueVideoIds = Array.from(new Set(allVideoIds));
    console.log('info', 'Total unique videos in uploads playlist: ', uniqueVideoIds?.length);
    console.log('info', 'ids: ', uniqueVideoIds.slice(0, 75));
    console.log('info', 'more ids: ', uniqueVideoIds.slice(76, 150));

    // get next page
    const videoPromises = [];
    for (let offset = 0; offset < uniqueVideoIds.length; offset += 50) {
        let videoIds = uniqueVideoIds.slice(offset, offset + 50);
        console.log('info', `Searching for ${videoIds.length} videos`, null, null, null, 1);
        videoPromises.push(service.videos.list({
            auth: authedClient,
            part: ['snippet', 'status'],
            id: videoIds
        }).then(res => res.data?.items || []));
    }
    let videoStatsResponse = await Promise.all(videoPromises);
    videoStats = videoStatsResponse.flat();
    //check for missing ids
    let missingIds = allVideoIds.filter(id => !videoStats.find(vid => vid.id === id));
    console.log('info', 'missing', missingIds);
    console.log('info', 'first vid', videoStats[0]);

    const justMainInfo = videoStats.map(v => ({
        id: v.id,
        title: v.snippet?.title,
        description: v.snippet?.description,
        publishedAt: v.snippet?.publishedAt,
    }))

    //filter for only public + scheduled videos
    return { videos: videoStats, justMainInfo };
}
