import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

export async function GET() {
    const logs = await prisma.log.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(logs);
}

export async function POST(request: Request) {
    const body = await request.json() as LogRequestBody;
    const tags = normalizeTags(body.tags);

    const log = await prisma.log.create({
        data: {
            title: body.title,
            todayWork: body.todayWork,
            aiUsage: body.aiUsage,
            problem: body.problem,
            learning: body.learning,
            tags,
        },
    });

    return NextResponse.json(log);
}
