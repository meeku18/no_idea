import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";

const YT_REG = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() 
})

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REG);
        if (!isYt) {
            return NextResponse.json({
                message: "Wrong Url format"
            }), {
                status: 411
            }
        }
        const extractedId = data.url.split("?v=")[1];
        const detail  = await youtubesearchapi.GetVideoDetails(extractedId);
        const title = detail.title;
        const thumbnail = detail.thumbnail.thumbnails;

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                extractedId,
                url: data.url,
                smallImg: (thumbnail.length > 1 ? thumbnail[thumbnail.length - 2].url : thumbnail[thumbnail.length - 1])?? "https://media.istockphoto.com/id/1147544806/vector/no-thumbnail-image-vector-graphic.jpg?s=1024x1024&w=is&k=20&c=RevfxWm_T7B9o7ILk5Bl39hpm9rYm8ZVmoKuXAfD-ew=",
                bigImg : (thumbnail[thumbnail.length - 1].url) ?? "https://media.istockphoto.com/id/1147544806/vector/no-thumbnail-image-vector-graphic.jpg?s=1024x1024&w=is&k=20&c=RevfxWm_T7B9o7ILk5Bl39hpm9rYm8ZVmoKuXAfD-ew=",
                title : title ?? "Cant find video",
                type: "YouTube"
            }
        })

        return NextResponse.json({
            message: "Stream created successfully",
            id : stream.id
        },{
            status : 200
        })

    } catch (err) {
        return NextResponse.json({
            message: "Error while adding a stream"
        }, {
            status: 411
        })
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    })

    return NextResponse.json({
        streams
    })

}