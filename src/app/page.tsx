import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
    const urlEncode = encodeURI("public/Who Cooked it？ - GRILLED CHEESE ｜ Chef： £5 Budget or Normal： Unlimited Budget？-0dq5nvVjm7s-Sorted Food.mkv")
    return (
        <div className="w-[50%]">
            <VideoPlayer src={`/api/getVideo?videoPath=${urlEncode}`}
                settings qualityOptions={["20", "30", "40"]}
                captionFiles={[{
                    src: "Who Cooked it？ - GRILLED CHEESE ｜ Chef： £5 Budget or Normal： Unlimited Budget？-0dq5nvVjm7s-Sorted Food.en-ehkg1hFWq8A.vtt",
                    srcLang: "En", displayLang: "English"
                }]} />
        </div>
    );
}
