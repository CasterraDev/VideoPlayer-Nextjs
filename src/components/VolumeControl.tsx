import styles from "../css/VolumeControl.module.css";

export default function VolumeControl({ muted, setMuted, volume, setVolume }: {muted: boolean, setMuted: any, volume: number, setVolume: any}) {
	const volumeChange = () => {
		var l: any = document.getElementById("volumeInput");
		var val = l?.value / 100;
		setVolume(val);
	};

	const volumeIcon = (v: number) => {
		let vol = v * 100;
		if (muted || vol === 0) {
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					width="100%"
					height="100%"
					fillOpacity="context-fill-opacity">
					<path d="M7.245 1.35 4.117 5 2 5a2 2 0 0 0-2 2l0 2a2 2 0 0 0 2 2l2.117 0 3.128 3.65C7.848 15.353 9 14.927 9 14L9 2c0-.927-1.152-1.353-1.755-.65z" />
					<g transform="translate(10,5)">
						<line
							x1="0"
							y1="0"
							x2="5"
							y2="5"
							style={{ stroke: "#FFF", "strokeWidth": "1" }}
						/>
						<line
							x1="5"
							y1="0"
							x2="0"
							y2="5"
							style={{ stroke: "#FFF", "strokeWidth": "1" }}
						/>
					</g>
				</svg>
			);
		}
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				width="100%"
				height="100%"
				fillOpacity="context-fill-opacity">
				<path d="M7.245 1.35 4.117 5 2 5a2 2 0 0 0-2 2l0 2a2 2 0 0 0 2 2l2.117 0 3.128 3.65C7.848 15.353 9 14.927 9 14L9 2c0-.927-1.152-1.353-1.755-.65z" />
				{vol > 66 && (
					<path d="M11.764 15a.623.623 0 0 1-.32-1.162 6.783 6.783 0 0 0 3.306-5.805 6.767 6.767 0 0 0-3.409-5.864.624.624 0 1 1 .619-1.085A8.015 8.015 0 0 1 16 8.033a8.038 8.038 0 0 1-3.918 6.879c-.1.06-.21.088-.318.088z" />
				)}

				<path d="M11.434 11.85A4.982 4.982 0 0 0 13.25 8a4.982 4.982 0 0 0-1.819-3.852l-.431 0 0 7.702.434 0z" />
			</svg>
		);
	};

	return (
		<>
			<div className='flex gap-[inherit] group/volume block'>
				<button
					id="muteBtn"
					className='flex shrink-0 items-center cursor-pointer max-w-[25px] w-[25px] p-0 fill-[rgb(255,255,255)]'
					onClick={() => {
						setMuted(!muted);
					}}>
					{volumeIcon(volume)}
				</button>
				<div className='group-hover/volume:opacity-100 group-hover/volume:w-full group-hover/volume:block w-0 opacity-0 hidden'>
					<input
						id="volumeInput"
						type="range"
						min="0"
						max="100"
						defaultValue="100"
						onChange={volumeChange}></input>
				</div>
			</div>
		</>
	);
}

