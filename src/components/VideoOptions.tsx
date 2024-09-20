"use client"
import React, { useRef, useState } from 'react'
import { HiCog8Tooth } from "react-icons/hi2";
import { FaC, FaRegClock } from "react-icons/fa6";
import { LuSettings2 } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";

type videoOptionsProps = {
    quality: string
    setQuality: (quality: string) => void;
    playbackRate: number
    setPlaybackRate: (playbackRate: number) => void;
    qualityOptions?: string[];
    playbackRateOptions?: number[];
}

export default function VideoOptions(props: videoOptionsProps) {
    const [menuShown, setMenuShown] = useState<boolean>(false);
    const [tabNum, setTabNum] = useState<number>(props.qualityOptions ? 1 : 2);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        setMenuShown(!menuShown)
    }

    const changeTabNum = (v: number) => {
        setTabNum(v);
    }

    return (
        <div className='group/options p-0 m-0 relative inline-block'>
            <button className='h-full w-full relative' onClick={toggleMenu}>
                <div className='flex items-center cursor-pointer justify-center rounded-[1em] w-[25px] transition-opacity duration-[500ms] hover:bg-[rgba(255,255,255,0.08)] h-full'>
                    <div className={`text-white font-semibold tracking-[.5px] relative top-[-1px] w-full`}>
                        <HiCog8Tooth className='h-full w-full' />
                    </div>
                </div>
            </button>
            {menuShown &&
                <div className="text-white absolute bg-[rgba(0,0,0,0.6)] p-2 rounded bottom-[50px] w-[12em] h-fit right-[50%] cursor-default" ref={menuRef}>
                    <div className='TabHead border-b-2 border-b-black flex gap-[.5em]'>
                        {props.qualityOptions &&
                            <div className={`Tabs p-1 bg-grey h-full w-[2em] ${tabNum === 1 ? "text-white" : "text-[rgba(200,200,200,0.9)]"}`}>
                                <button className='w-full' onClick={() => changeTabNum(1)}><LuSettings2 className='w-full h-auto' /></button>
                            </div>
                        }
                        {props.playbackRateOptions &&
                            <div className={`Tabs p-1 bg-grey h-full w-[2em] ${tabNum === 2 ? "text-white" : "text-[rgba(200,200,200,0.9)]"}`}>
                                <button className='w-full' onClick={() => changeTabNum(2)}><FaRegClock className='w-full h-auto' /></button>
                            </div>
                        }
                    </div>
                    <div className='TabBody h-full w-full'>
                        {tabNum == 1 && <div>
                            {props.qualityOptions?.map((quality) => (
                                <div className={`${quality === props.quality ? "text-blue-500" : "text-white"} cursor-pointer h-[1.5em] w-full justify-between rounded-sm flex flex-row items-center
                                    ${quality != props.quality && "hover:text-orange-500"} hover:bg-[rgba(0,0,0,0.4)] focus:bg-[rgba(0,0,0,0.4)]`}
                                    key={`playbackquality_${quality}`}
                                    onClick={() => {
                                        if (props.quality === quality) return;
                                        props.setQuality(quality);
                                    }}
                                >
                                    <div className='w-[.2em]'>
                                        {quality === props.quality ? <FaCheck /> : ''}
                                    </div>
                                    <div className="font-semibold tracking-[.5px] relative top-[-1px]">
                                        {quality}
                                    </div>
                                </div>
                            ))}
                        </div>
                        }
                        {tabNum == 2 && <div>
                            {props.playbackRateOptions?.map((rate) => (
                                <div className={`${rate === props.playbackRate ? "text-blue-500" : "text-white"} cursor-pointer h-[1.5em] w-full justify-between rounded-sm flex flex-row items-center 
                                    ${rate != props.playbackRate && "hover:text-orange-500"} hover:bg-[rgba(0,0,0,0.4)] focus:bg-[rgba(0,0,0,0.4)]`}
                                    key={`playbackRate_${rate}`}
                                    onClick={() => {
                                        if (props.playbackRate === rate) return;
                                        props.setPlaybackRate(rate);
                                    }}
                                >
                                    <div className='w-[.2em]'>
                                        {rate === props.playbackRate ? <FaCheck /> : ''}
                                    </div>
                                    <div className="font-semibold tracking-[.5px] relative top-[-1px]">
                                        {rate}x
                                    </div>
                                </div>
                            ))}
                        </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
}
