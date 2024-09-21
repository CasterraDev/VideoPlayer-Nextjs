import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  return (
    <div className="w-[50%]">
        <VideoPlayer src="Who Cooked it？ - GRILLED CHEESE ｜ Chef： £5 Budget or Normal： Unlimited Budget？-0dq5nvVjm7s-Sorted Food.mkv"
            settings qualityOptions={["20","30","40"]}
            captionFiles={[{src:"Who Cooked it？ - GRILLED CHEESE ｜ Chef： £5 Budget or Normal： Unlimited Budget？-0dq5nvVjm7s-Sorted Food.en-ehkg1hFWq8A.vtt",
                srcLang: "En", displayLang: "English"}]} defaultCaptionFile={0}/>
    </div>
  );
}
