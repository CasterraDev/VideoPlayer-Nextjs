import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const CHUNK_SIZE_IN_BYTES = 1000000; //1mb

function streamFile(path: string, options?: any): ReadableStream<Uint8Array> {
    const downloadStream = fs.createReadStream(path, options);

    return new ReadableStream({
        start(controller) {
            downloadStream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            downloadStream.on("end", () => controller.close());
            downloadStream.on("error", (error: NodeJS.ErrnoException) => controller.error(error));
        },
        cancel() {
            downloadStream.destroy();
        },
    });
}

export async function GET(req: NextRequest) {
    let range = req.headers.get('range');
    const search = new URL(req.url || "").search;
    const urlParams = new URLSearchParams(search);
    if (!range) {
        return new Response('Error')
    }

    const videoPath = urlParams.get('videoPath');
    //TODO: Check that the file exists
    if (videoPath == null) {
        return NextResponse.json({ error: "Failed to parse video path" }, {
            status: 500,
        })
    }

    const videoSizeInBytes = fs.statSync(videoPath).size;

    const chunkStart = Number(range.replace(/\D/g, ""));

    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE_IN_BYTES, videoSizeInBytes - 1);

    const contentLength = chunkEnd - chunkStart + 1;

    const myHeaders = new Headers();
    myHeaders.append("Content-Range", `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`)
    myHeaders.append("Accept-Ranges", "bytes");
    myHeaders.append("Content-Length", contentLength.toString());
    myHeaders.append("Content-Type", "video/mp4");
    const data: ReadableStream = streamFile(videoPath, { start: chunkStart, end: chunkEnd });
    return new Response(data, {
        status: 206,
        headers: myHeaders,
    })
}
