import { exec } from "child_process";
import fs from "fs";

//uses yt-dlp instead of actual youtube api
export const getAllVideosUnofficial = async (channelId: string) => {
    //exec yt-dlp to get all video metadata
    const randomId = Math.random().toString(36).substring(7);
    const tempFileName = `${channelId}-${randomId}.json`;

    //yt-dlp -a input.txt --print "%(channel)s - %(duration>%H:%M:%S)s - %(title)s" > output.txt
    await new Promise((resolve, reject) => exec(`yt-dlp -j --flat-playlist https://www.youtube.com/channel/${channelId} > ${tempFileName}`, {maxBuffer: 1024 * 1000000}, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err);
            reject(err);
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            //resolve when done
            resolve(null);

        }
    }

    ));

    //read file
    const fileContents = fs.readFileSync(tempFileName, 'utf8');

    console.log('info', 'fileContents', fileContents)

    //delete file
    fs.unlinkSync(tempFileName);


    const asStr = fileContents.split('\n').join(',');

    //delete last char
    const fixedStr = asStr.substring(0, asStr.length - 1);
    console.log('[' + fixedStr + ']');

    //transform file
    const allVideos = JSON.parse('[' + fixedStr + ']');

    console.log('info', 'allVideos', allVideos);

    // const justTitles = allVideos.map((video: any) => video.title);

    return allVideos;
};