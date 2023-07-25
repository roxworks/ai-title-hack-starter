import { exec } from "child_process";
import fs from "fs";

//uses yt-dlp instead of actual youtube api
export const getCaptionsUnofficial = async (videoId: string) => {
    //exec yt-dlp then transform file
    const randomId = Math.random().toString(36).substring(7);
    const tempFileName = `${videoId}-${randomId}.srt`;
    await new Promise((resolve, reject) => exec(`yt-dlp --write-auto-sub --skip-download --sub-format srt --sub-lang en --output ${tempFileName} https://www.youtube.com/watch?v=${videoId}`, (err, stdout, stderr) => {
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
    }));

    //read file
    const fileContents = fs.readFileSync(tempFileName, 'utf8');

    //delete file
    fs.unlinkSync(tempFileName);

    //transform file
    const justTheText = fileContents.split('\n').filter((line, i) => line.length > 0 && !line.includes('-->') && !stringIsNum(line)).join('\n');

    return justTheText;

}

const stringIsNum = (line: string) => {
    return /^\d+$/.test(line);
}

