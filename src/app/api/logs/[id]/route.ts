import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

type LogRequestBody = {
    title: string;
    todayWork: string;
    aiUsage: string;
    problem: string;
    learning: string;
    tags?: unknown;
};

const normalizeTags = (tags: unknown) => {
    if (!Array.isArray(tags)) {
        return [];
    }

    return tags.filter((tag): tag is string => typeof tag === "string");
};

export async function PUT(
        request: Request,
        { params }: Params
    ) {
    const { id } = await params;
    const body = await request.json() as LogRequestBody;
    const tags = normalizeTags(body.tags);

    const log = await prisma.log.update({
        where: {
            id: Number(id),
        },
        data: {
            title: body.title,
            todayWork: body.todayWork,
            aiUsage: body.aiUsage,
            problem: body.problem,
            learning: body.learning,
            tags: {
                set: tags,
            },
        },
    });

    return NextResponse.json(log);
}

export async function DELETE(
        _request: Request,
        { params }: Params
    ) {
    const { id } = await params;

    await prisma.log.delete({
        where: {
            id: Number(id),
        },
    });

    return NextResponse.json({ message: "deleted" });
}
