import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
    streamId: z.string()
})
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    // todo : add id in server session and get rid of this db call
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })
    if (!user) {
        return NextResponse.json({
            message: "unauthorized"
        }, {
            status: 403
        })
    }
    try {
        const data = UpvoteSchema.parse(await req.json());
        await prismaClient.upvotes.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        })
        return NextResponse.json({
            message: "downvote success"
        }, { status: 200 })
    } catch (erro) {
        return NextResponse.json({
            message: "Error while upvoting"
        }, {
            status: 403
        })
    }
}