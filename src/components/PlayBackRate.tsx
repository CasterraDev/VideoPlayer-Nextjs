import React from "react";

function click() {

}

export default function PlaybackRateControl({
    playbackRate,
    setPlaybackRate
}: { playbackRate: number, setPlaybackRate: any }) {
    return (
        <div className='group/playback p-0 m-0 relative inline-block'>
            <button>
                <div className='flex items-center cursor-pointer h-[2em] justify-center rounded-[1em] w-[1em] mt-[-1em] transition-opacity duration-[500ms] hover:bg-[rgba(255,255,255,0.08)]' onClick={click}>
                    <div className={`text-white font-semibold tracking-[.5px] relative top-[-1px] w-min`}>
                        <span style={{ fontSize: "14px" }}>{playbackRate}</span>
                        <span style={{ fontSize: "11px" }}>x</span>
                    </div>
                </div>
            </button>
            <div className='hidden absolute bg-[#1D253F] border-none min-w-[3em] z-[2] rounded-sm w-[3em] group-hover/playback:block group-hover/playback:bottom-full group-hover/playback:border-2 group-hover/playback:border-black group-hover/playback:border-solid'>
                <div className='font-normal font-[12px] text-white'>
                    {[.25, .50, .75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                        <div className='cursor-pointer h-[2.5em] w-full justify-between rounded-sm flex flex-row justify-center items-center hover:bg-[rgba(0,0,0,0.4)] focus:bg-[rgba(0,0,0,0.4)]'
                            key={`playbackRate_${rate}`}
                            onClick={() => {
                                if (playbackRate === rate) return;
                                setPlaybackRate(rate);
                            }}
                        >
                            <div className='text-white font-semibold tracking-[.5px] relative top-[-1px]' style={{ fontWeight: "600", color: "white" }}>
                                {rate}x
                            </div>
                            {playbackRate === rate && (
                                <div className='border-black border-solid border-[0_3px_3px_0] inline-block p-[3px] rotate-45' style={{ width: "15px", height: "11px" }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};
