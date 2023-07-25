import { NextApiRequest, NextApiResponse } from "next";
import {getAllVideosUnofficial} from "../../utils/getAllVideosUnofficial";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const { channelId } = req.query;

    const allVideos = await getAllVideosUnofficial(channelId as string);

    res.status(200).json(allVideos);

};