"use client"
import React, { Reducer, useEffect, useReducer, useRef, useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';
import ElapsedTimeTracker from './ElapsedTimeTracker';
import VolumeControl from './VolumeControl';
import VideoOptions from './VideoOptions';
import { CaptionColor, CaptionFile, CaptionStyleState } from '@/types/VideoPlayer';
import { displayColorsToCaptionColors, AddAlphaToRGBColor } from '@/utils/VideoPlayer';

type VideoPlayerProps = {
    src: string;
    settings?: boolean;
    playbackOptions?: number[] | boolean;
    qualityOptions?: string[] | boolean;
    autoplay?: boolean;
    captionFiles?: CaptionFile[];
    defaultCaptionFile?: number | string | null;
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

const characterEdgeTextShadow = (s: string, edgeColor: string): string => {
    if (s == "Raised") {
        return `-1px -1px 4px ${edgeColor}, 1px -1px 4px ${edgeColor},
            -1px 1px 4px ${edgeColor}, 1px 1px 4px ${edgeColor}`
    }else if (s == "Depressed"){
        return `0px -3px 2px ${edgeColor}`
    }else if (s == "Uniform"){
        return `2px 0 ${edgeColor}, -2px 0 ${edgeColor}, 0 2px ${edgeColor}, 0 -2px ${edgeColor},
             1px 1px ${edgeColor}, -1px -1px ${edgeColor}, 1px -1px ${edgeColor}, -1px 1px ${edgeColor}`
    }else if (s == "Drop Shadow"){
        return `-3px 0 2px ${edgeColor}`
    }
    return "";
}

type CaptionStyleAction = {
    type: string
    val: string
}

function reducer(state: CaptionStyleState, action: CaptionStyleAction): CaptionStyleState {
    switch (action.type) {
        case "CHANGE_FONT_COLOR":
            return { ...state, fontColor: action.val };
        case "CHANGE_FONT_SIZE":
            const str = action.val.slice(0, -1)
            const num = 2 * (Number(str) / 100)
            const s = String(num) + "em"
            return { ...state, fontSize: s };
        case "CHANGE_BG_COLOR":
            return { ...state, bgColor: action.val };
        case "CHANGE_BG_OPACITY":
            return { ...state, bgOpacity: action.val };
        case "CHANGE_CHARACTER_EDGE":
            return { ...state, characterEdge: action.val };
        case "CHANGE_EDGE_COLOR":
            return { ...state, edgeColor: action.val };
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
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    const [captionStyles, dispatchCaptionStyles] = useReducer<Reducer<CaptionStyleState, CaptionStyleAction>>(reducer, {
        fontColor: CaptionColor.white,
        fontSize: '2em',
        bgColor: CaptionColor.black,
        bgOpacity: '0%',
        characterEdge: "Raised",
        edgeColor: CaptionColor.black
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const bufferRef = useRef<HTMLDivElement>(null);

    const updateStyles = (str: string, val: any) => {
        switch (str) {
            case "Font Color":
                dispatchCaptionStyles({ type: "CHANGE_FONT_COLOR", val: displayColorsToCaptionColors(val) })
                break;
            case "Font Size":
                dispatchCaptionStyles({ type: "CHANGE_FONT_SIZE", val: val })
                break;
            case "Background Color":
                dispatchCaptionStyles({ type: "CHANGE_BG_COLOR", val: displayColorsToCaptionColors(val) })
                break;
            case "Background Opacity":
                dispatchCaptionStyles({ type: "CHANGE_BG_OPACITY", val: val })
                break;
            case "Character Edge":
                dispatchCaptionStyles({ type: "CHANGE_CHARACTER_EDGE", val: val })
                break;
            case "Edge Color":
                dispatchCaptionStyles({ type: "CHANGE_EDGE_COLOR", val: displayColorsToCaptionColors(val) })
                break;
            default:
                break;
        }
    }

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
                setIsPlaying(false)
            } else {
                videoRef.current.play();
                setIsPlaying(true)
            }
        }
    };

    const pauseVideo = (b: boolean, updateState: boolean) => {
        if (videoRef.current) {
            if (!videoRef.current.paused && b) {
                videoRef.current.pause();
                if (updateState) {
                    setIsPlaying(false)
                }
            } else if (videoRef.current.paused && !b) {
                videoRef.current.play();
                if (updateState) {
                    setIsPlaying(true)
                }
            }
        }
    }

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
        if (!videoRef.current) {
            return;
        }

        const vid = videoRef.current;

        const onWaiting = () => {
            setIsWaiting(true);
        };

        const onProgress = () => {
            if (!vid.buffered) return;
            const bufferedEnd: number = vid.buffered.end(vid.buffered.length - 1);
            const duration: number = vid.duration;
            if (bufferRef && duration > 0 && bufferRef.current && bufferedEnd) {
                bufferRef.current.style.width = (bufferedEnd / duration) * 100 + "%";
            }
        };

        const onTimeUpdate = () => {
            setIsWaiting(false);
            setElapsedSec(vid.currentTime);
            if (progressRef && progressRef.current && thumbRef.current) {
                // FIXME: Scrubbing is laggy for some reason
                progressRef.current.style.width =
                    (vid.currentTime / duration) * 100 + "%";
                // FIXME: This isn't completely centered on the progressBar line but it's good enough that no one should notice
                thumbRef.current.style.left = (vid.currentTime / duration) * 100 - .5 + "%"
            }
        };

        const updateCues = () => {
            if (!videoRef.current) return
            const textTrack = videoRef.current.textTracks[0]
            const cues = textTrack.activeCues
            if (cues == null) return;
            const c: VTTCue = cues[0] as VTTCue
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

        let timeoutID: NodeJS.Timeout | string | number | undefined = undefined
        const videoMouseMove = () => {
            if (!controlsRef.current || !videoContainerRef.current) return
            clearTimeout(timeoutID)
            controlsRef.current.style.opacity = '100'
            videoContainerRef.current.style.cursor = 'auto'

            if (isFullscreen) {
                timeoutID = setTimeout(function() {
                    if (!controlsRef.current || !videoContainerRef.current) return
                    controlsRef.current.style.opacity = '0'
                    videoContainerRef.current.style.cursor = 'none'
                }, 5000)
            }
        }

        const videoMouseLeave = () => {
            if (!controlsRef.current || !videoContainerRef.current) return
            clearTimeout(timeoutID)
            videoContainerRef.current.style.cursor = 'auto'
            if (isPlaying) {
                controlsRef.current.style.opacity = '0'
            }
        }

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

        const timelineMouseMove = (e: any) => {
            if (!videoRef.current || !timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect()
            const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width
            if (isScrubbing) {
                videoRef.current.currentTime = percent * videoRef.current.duration;
                setElapsedSec(vid.currentTime);
                if (progressRef && progressRef.current && thumbRef.current) {
                    // FIXME: Scrubbing is laggy for some reason
                    progressRef.current.style.width =
                        (vid.currentTime / duration) * 100 + "%";
                    // FIXME: This isn't completely centered on the progressBar line but it's good enough that no one should notice
                    thumbRef.current.style.left = (vid.currentTime / duration) * 100 - .5 + "%"
                }
            }
        }

        const timelineMouseDown = (e: any) => {
            e.stopPropagation()
            e.preventDefault()
            if (!videoRef.current || !timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect()
            const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width
            setIsScrubbing(true)
            if (isPlaying) pauseVideo(true, false)
            videoRef.current.currentTime = percent * videoRef.current.duration;
        }

        const timelineMouseUp = (e: any) => {
            e.stopPropagation()
            e.preventDefault()
            if (isScrubbing) {
                setIsScrubbing(false)
                if (isPlaying) pauseVideo(false, false);
            }
        }

        const duration = vid?.duration || 0;
        setDurationSec(duration);

        vid.addEventListener("progress", onProgress);
        vid.addEventListener("timeupdate", onTimeUpdate);
        vid.addEventListener("waiting", onWaiting);
        if (videoContainerRef.current) {
            videoContainerRef.current.addEventListener("mousemove", videoMouseMove)
            videoContainerRef.current.addEventListener("mouseleave", videoMouseLeave)
        }
        vid.textTracks[0].mode = 'hidden'
        vid.textTracks[0].addEventListener("cuechange", updateCues)

        if (timelineRef.current) {
            timelineRef.current.addEventListener("mousedown", timelineMouseDown)
            document.addEventListener("mousemove", timelineMouseMove)
            document.addEventListener("mouseup", timelineMouseUp)
        }

        document.addEventListener("keyup", keyPresses)
        document.addEventListener("fullscreenchange", onFullScreenChange);
        document.addEventListener("mozfullscreenchange", onFullScreenChange);
        document.addEventListener("webkitfullscreenchange", onFullScreenChange);
        document.addEventListener("msfullscreenchange", onFullScreenChange);

        return () => {
            if (videoContainerRef.current) {
                videoContainerRef.current.removeEventListener("mousemove", videoMouseMove)
                videoContainerRef.current.removeEventListener("mouseleave", videoMouseLeave)
            }
            vid.removeEventListener("waiting", onWaiting);
            vid.removeEventListener("progress", onProgress);
            vid.removeEventListener("timeupdate", onTimeUpdate);
            vid.textTracks[0].removeEventListener("cuechange", updateCues)

            if (timelineRef.current) {
                timelineRef.current.removeEventListener("mousedown", timelineMouseDown)
                document.removeEventListener("mousemove", timelineMouseMove)
                document.removeEventListener("mouseup", timelineMouseUp)
            }
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

    return (
        <div className='h-fit'>
            <div ref={videoContainerRef} className='flex h-fit bg-[rgb(41,41,41)] flex-col items-center justify-center relative overflow-hidden group' id="videoContainer">
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
                <div hidden ref={captionRef} className={`SubtitleContainer absolute bottom-20 p-2 ${props.captionFiles && captionFileIdx != null ? "block" : "hidden"}`}
                    style={{
                        color: captionStyles.fontColor, backgroundColor: AddAlphaToRGBColor(captionStyles.bgColor, captionStyles.bgOpacity), fontSize: captionStyles.fontSize, outlineColor: captionStyles.bgColor,
                        textShadow: characterEdgeTextShadow(captionStyles.characterEdge, captionStyles.edgeColor),
                    }}>
                </div>
                <div ref={controlsRef} className={`ControlsContainer ${!isPlaying && "opacity-100"} flex w-full box-border h-[100px] absolute opacity-0 left-0 bottom-0 items-end p-4
                    bg-[linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0.5)] transition-opacity duration-[0.3s] ease-linear`}>
                    <div className='controls flex flex-col w-full items-center'>
                        <div
                            className='group/timelineBar relative flex cursor-pointer overflow-visible w-full transiton-[height] duration-[0.1s] ease-linear h-[6px]
                                mb-[.5rem] rounded-[5px] bg-[rgba(193,193,193,0.5)] hover:h-[10px]'
                            ref={timelineRef}>
                            <div className='absolute opacity-0 w-[1em] h-[1em] overflow-visible rounded-full bg-[#0caadc] bottom-[-75%]
                                group-hover/timelineBar:bottom-[-25%] group-hover/timelineBar:opacity-100 z-10 pointer-events-none' ref={thumbRef} />
                            <div className='progressBarColors flex relative w-full h-full overflow-hidden'>
                                <div
                                    className='playProgress h-full z-[1] bg-[#0caadc] relative rounded-lg'
                                    ref={progressRef}
                                >
                                </div>

                                <div
                                    className='bufferProgress absolute h-full bg-slate-400 rounded-lg'
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
                                        captionProps={{ captionFiles: props.captionFiles || [], setCaptionFileIdx, captionStyles, updateStyles }}
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

