import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  return (
    <div className="w-[50%]">
        <VideoPlayer src="(No Copyright Music) Cinematic Soft Piano [Cinematic Music] by MokkaMusic ⧸ Raindrop-vrmI8lgqEas-Mokka - No Copyright Music.mkv"
            settings qualityOptions={["20","30","40"]} captionFiles={[]}/>
    </div>
  );
}
