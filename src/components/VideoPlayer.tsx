"use client"
import React, { MouseEvent, Reducer, useEffect, useReducer, useRef, useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';
import ElapsedTimeTracker from './ElapsedTimeTracker';
import VolumeControl from './VolumeControl';
import VideoOptions from './VideoOptions';

type VideoPlayerProps = {
    src: string;
    settings?: boolean;
    playbackOptions?: number[] | boolean;
    qualityOptions?: string[] | boolean;
    autoplay?: boolean;
    captionFiles?: CaptionFile[];
    defaultCaptionFile?: number | string;
    preload?: "metadata" | "auto" | "none"
}

const initCaptionFile = (def: number | string, capFiles: CaptionFile[]): number | null => {
    if (typeof def == "number") {
        return def;
    } else {
        let i: number = 0;
        capFiles.map((f) => {
            if (f.displayLang == def) {
                return i
            }
            i++;
        })
    }
    console.warn("Default Caption File not found. Defaulting to first caption file in array")
    return 0
}

type CaptionStyleAction =
    | {
        type: "CHANGE_DATA_LIST";
    }
    | {
        type: "SET_IN_DROP_ZONE";
    }
    | {
        type: "CHANGE_FONT_COLOR";
        fc: string
    }
    | {
        type: "CHANGE_BG_COLOR";
        bgColor: string
    }

enum CaptionColor {
    white = 'white',
    black = 'black',
    red = 'rgb(255,0,0)',
    green = 'green-500',
    blue = 'rgb(0,0,255)',
    yellow = 'yellow-500',
    magenta = 'purple-500',
    cyan = 'cyan-500',
    transparent = 'transparent'
}

type CaptionStyleState = {
    fontColor: string
    fontSize: string
    bgColor: string
    edgeColor: string
    characterEdge: "raised" | "depressed"
}

function reducer(state: CaptionStyleState, action: CaptionStyleAction): CaptionStyleState {
    switch (action.type) {
        case "CHANGE_FONT_COLOR":
            return { ...state, fontColor: action.fc };
        case "CHANGE_BG_COLOR":
            return { ...state, bgColor: action.bgColor };
        default:
            return state;
    }
};


export default function VideoPlayer(props: VideoPlayerProps) {
    const [muted, setMuted] = useState<boolean>(false);
    const [isFullscreen, setFullscreen] = useState<boolean>(false);
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [quality, setQuality] = useState<string>(props.qualityOptions && typeof props.qualityOptions != "boolean" && props.qualityOptions[0] || "1080");
    const [durationSec, setDurationSec] = useState<number>(1);
    const [elapsedSec, setElapsedSec] = useState<number>(1);
    const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
    const [captionFileIdx, setCaptionFileIdx] = useState<number | null>(props.defaultCaptionFile != null ? initCaptionFile(props.defaultCaptionFile, props.captionFiles || []) : null)

    const [captionStyle, dispatchCaptionStyle] = useReducer<Reducer<CaptionStyleState, CaptionStyleAction>>(reducer, {
        fontColor: CaptionColor.white,
        fontSize: '2em',
        bgColor: CaptionColor.transparent,
        characterEdge: "raised",
        edgeColor: "#000000"
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const bufferRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }

        const onWaiting = () => {
            setIsWaiting(true);
        };

        const element = videoRef.current;

        const onProgress = () => {
            if (!element.buffered) return;
            const bufferedEnd: any = element.buffered.end;
            const duration = element.duration;
            if (bufferRef && duration > 0 && bufferRef.current !== null) {
                bufferRef.current.style.width = (bufferedEnd / duration) * 100 + "%";
            }
        };

        const onTimeUpdate = () => {
            setIsWaiting(false);
            const duration = element.duration;
            setElapsedSec(element.currentTime);
            if (progressRef && duration > 0 && progressRef.current !== null) {
                progressRef.current.style.width =
                    (element.currentTime / duration) * 100 + "%";
            }
        };

        const updateCues = () => {
            if (!videoRef.current) return
            const textTrack = videoRef.current.textTracks[0]
            const cues = textTrack.activeCues
            if (cues == null) return;
            const c: VTTCue = cues[0] as VTTCue
            console.log(cues[0])
            if (cues.length > 0) {
                if (captionRef.current) {
                    if (c.track) {
                        captionRef.current.innerHTML = c.text
                        captionRef.current.hidden = false;
                    } else {
                        captionRef.current.hidden = true
                    }
                }
            }
        }

        element.addEventListener("progress", onProgress);
        element.addEventListener("timeupdate", onTimeUpdate);
        element.addEventListener("waiting", onWaiting);
        videoRef.current.textTracks[0].mode = 'hidden'
        videoRef.current.textTracks[0].addEventListener("cuechange", updateCues)

        // clean up
        return () => {
            element.removeEventListener("waiting", onWaiting);
            element.removeEventListener("progress", onProgress);
            element.removeEventListener("timeupdate", onTimeUpdate);
        };
    });

    useEffect(() => {
        if (!videoRef.current) return;
        if (videoRef.current.playbackRate === playbackRate) return;
        videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    useEffect(() => {
        if (!videoRef.current) return;
        if (muted) {
            if (videoRef.current.volume === 0) return;
            videoRef.current.volume = 0;
        } else {
            videoRef.current.volume = volume;
        }
    }, [muted, volume]);

    const handlePlayPauseClick = () => {
        if (videoRef.current) {
            if (!videoRef.current.paused) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleFullscreen = () => {
        var vc = document.getElementById("videoContainer");
        var isInFullscreen = (document.fullscreenElement);

        if (!isInFullscreen) {
            if (vc !== null && vc.requestFullscreen) {
                vc.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const onFullScreenChange = () => {
            if (document.fullscreenElement !== null) {
                setFullscreen(true);
            } else {
                setFullscreen(false);
            }
        };

        const keyPresses = (e: any) => {
            e.preventDefault()
            const tagName = document.activeElement?.tagName.toLowerCase();
            if (tagName === 'input') return;
            switch (e.key.toLowerCase()) {
                case ' ':
                    if (tagName === 'button') return;
                case 'k':
                    handlePlayPauseClick()
                    break;
                case 'm':
                    setMuted(!muted)
                    break;
                case 'f':
                    toggleFullscreen()
                case 'l':
                case 'arrowright':
                    skip(5);
                    break;
                case 'j':
                case 'arrowleft':
                    skip(-5);
                    break;
                default:
                    break;
            }
        }

        const element = videoRef.current;
        const duration = element?.duration || 0;
        setDurationSec(duration);

        document.addEventListener("keyup", keyPresses)
        document.addEventListener("fullscreenchange", onFullScreenChange);
        document.addEventListener("mozfullscreenchange", onFullScreenChange);
        document.addEventListener("webkitfullscreenchange", onFullScreenChange);
        document.addEventListener("msfullscreenchange", onFullScreenChange);

        return () => {
            document.removeEventListener("keyup", keyPresses);
            document.removeEventListener("fullscreenchange", onFullScreenChange);
            document.removeEventListener("mozfullscreenchange", onFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", onFullScreenChange);
            document.removeEventListener("msfullscreenchange", onFullScreenChange);
        };
    });

    const changeQuality = (q: string) => {
        setQuality(q);
    }

    const skip = (v: number) => {
        if (!videoRef.current) return
        videoRef.current.currentTime += v;
    }

    const timelineMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const durationMs = videoRef.current.duration * 1000 || 0;
        const { left, width } =
            e.currentTarget.getBoundingClientRect();
        const clickedPos = (e.clientX - left) / width;

        const newElapsedMs = durationMs * clickedPos;
        const newTimeSec = newElapsedMs / 1000;
        if (isScrubbing) {
            e.preventDefault()
            videoRef.current.currentTime = newTimeSec;
        }
    }

    const timelineMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const durationMs = videoRef.current.duration * 1000 || 0;
        const { left, width } =
            e.currentTarget.getBoundingClientRect();
        const clickedPos = (e.clientX - left) / width;

        const newElapsedMs = durationMs * clickedPos;
        const newTimeSec = newElapsedMs / 1000;
        setIsScrubbing(true)
        setMuted(true)
        videoRef.current.currentTime = newTimeSec;
    }

    const timelineMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        setIsScrubbing(false)
        setMuted(false)
    }

    return (
        <div className='h-fit'>
            <div className='flex h-fit bg-[rgb(41,41,41)] flex-col items-center justify-center relative overflow-hidden group' id="videoContainer">
                {isWaiting && <div className='absolute'>Loading</div>}
                <video id="video" onClick={handlePlayPauseClick} ref={videoRef} preload={props.preload || "metadata"} autoPlay={props.autoplay}
                    className="w-full h-auto">
                    <source src={props.src} />
                    <track
                        kind="captions"
                        src={props.captionFiles && captionFileIdx != null ? props.captionFiles[captionFileIdx].src : undefined}
                        default
                    />
                </video>
                <div hidden ref={captionRef} className='SubtitleContainer absolute bottom-20 p-2'
                    style={{
                        color: captionStyle.fontColor, backgroundColor: captionStyle.bgColor, fontSize: `${captionStyle.fontSize}`, outlineColor: captionStyle.bgColor,
                        textShadow: `${captionStyle.characterEdge == "raised" ? `-1px -1px 4px ${captionStyle.edgeColor}, 1px -1px 4px ${captionStyle.edgeColor},
                            -1px 1px 4px ${captionStyle.edgeColor}, 1px 1px 4px ${captionStyle.edgeColor};` : ""}`
                    }}>
                </div>
                <div className='ControlsContainer group-hover:opacity-100 flex w-full box-border h-[100px] absolute opacity-0 left-0 bottom-0 items-end p-4
                    bg-[linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0.5)] transition-opacity duration-[0.3s] ease-linear'>
                    <div className='controls flex flex-col w-full items-center'>
                        <div
                            className='progressBar flex cursor-pointer w-full transiton-[height] duration-[0.1s] ease-linear h-[6px] mb-[.5rem] rounded-[5px] bg-[rgba(193,193,193,0.5)] overflow-hidden hover:h-[10px]'
                            onMouseMove={(e) => { timelineMouseMove(e) }}
                            onMouseDown={(e) => { timelineMouseDown(e) }}
                            onMouseUp={(e) => { timelineMouseUp(e) }}>
                            <div className='progressBarColors flex relative w-full h-full'>
                                <div
                                    className='playProgress h-full z-[1] bg-[#0caadc]'
                                    ref={progressRef}
                                />

                                <div
                                    className='bufferProgress absolute h-full bg-[#fdfffc]'
                                    ref={bufferRef}
                                />
                            </div>
                        </div>
                        <div className='buttonsContainer flex w-full columns-[ltr_ltr] justify-between items-center'>
                            <div className='buttonsLeft flex gap-[.8rem] columns-[ltr]'>
                                <div className='playBtnContainer flex items-center'>
                                    <button
                                        className='playBtn flex items-center cursor-pointer p-0'
                                        onClick={handlePlayPauseClick}>
                                        {!videoRef.current?.paused ? (
                                            <FaPause color="white" />
                                        ) : (
                                            <FaPlay color="white" />
                                        )}
                                    </button>
                                </div>
                                <ElapsedTimeTracker elapsedSec={elapsedSec} durationSec={durationSec} />
                                <VolumeControl
                                    setMuted={setMuted}
                                    muted={muted}
                                    volume={volume}
                                    setVolume={setVolume}
                                />
                            </div>
                            <div className='buttonsRight flex gap-[.5rem] columns-[ltr]'>
                                {(props.settings || props.qualityOptions || props.playbackOptions) &&
                                    <VideoOptions playbackRate={playbackRate} setPlaybackRate={setPlaybackRate} quality={quality} setQuality={changeQuality}
                                        captionFiles={props.captionFiles || []} setCaptionFileIdx={setCaptionFileIdx}
                                        playbackRateOptions={(props.playbackOptions || props.settings)
                                            ? (((typeof props.playbackOptions == "boolean") || (props.settings && (typeof props.playbackOptions == "undefined")))
                                                ? [.25, .50, .75, 1, 1.25, 1.5, 1.75, 2]
                                                : props.playbackOptions)
                                            : undefined}
                                        qualityOptions={(props.qualityOptions || props.settings)
                                            ? (((typeof props.qualityOptions == "boolean") || (props.settings && (typeof props.qualityOptions == "undefined")))
                                                ? ["1080p", "720p", "480p", "360p"]
                                                : props.qualityOptions)
                                            : undefined}
                                    />
                                }
                                <button
                                    title="Fullscreen"
                                    className='fullscreen cursor-pointer w-[25px] h-auto'
                                    onClick={toggleFullscreen}>
                                    {isFullscreen ? (
                                        <RiFullscreenExitFill color="white" className='w-full h-full' />
                                    ) : (
                                        <RiFullscreenFill color="white" className='w-full h-full' />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

