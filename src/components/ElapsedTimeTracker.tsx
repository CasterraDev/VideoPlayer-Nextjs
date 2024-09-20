import React from "react";

export default function ElapsedTimeTracker({ ...props }) {
    const secFormatter = (secLen: number) => {
        const dv = Math.floor(secLen / 86400)

        const hv = Math.floor((secLen % 86400) / 3600)
        const mv = Math.floor((secLen % 86400 % 3600) / 60)
        const s = Math.floor(secLen % 86400 % 3600 % 60).toString()

        const d = dv > 0 ? dv : ''
        const h: string = hv > 0 ? hv.toString() : ''
        const m = mv > 0 ? mv.toString() : ''

        if (d !== '') return `${d}:${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
        else if (h !== '') return `${h}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
        else if (m !== '') return `${m}:${s.padStart(2, '0')}`
        else return `${m.padStart(1,'0')}:${s.padStart(2, '0')}`
    }

    return (
        <div className='flex items-center font-semibold gap-[4px] p-0 text-white h-auto block'>
            <div className='flex justify-self-end'>
                <p className="p-0 m-0">
                    {secFormatter(props.elapsedSec)} / {secFormatter(props.durationSec)}
                </p>
            </div>
        </div>
    );
}
