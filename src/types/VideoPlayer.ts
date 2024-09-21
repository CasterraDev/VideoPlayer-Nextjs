export type CaptionFile = {
    src: string;
    // 2 Char code for the language
    srcLang: string;
    // Display name for the language that the user will see
    displayLang: string;
}

export type CaptionStyleState = {
    fontColor: string
    fontSize: string
    bgColor: string
    bgOpacity: string
    edgeColor: string
    characterEdge: string
}

export type CaptionProps = {
    captionFiles: CaptionFile[];
    captionStyles: CaptionStyleState
    setCaptionFileIdx: (captionIdx: number | null) => void;
    updateStyles: (str: string, val: any) => void
    defaultCaptionFile?: number | string;
}

export enum CaptionColor {
    white = 'rgb(255,255,255)',
    black = 'rgb(0,0,0)',
    red = 'rgb(255,0,0)',
    green = 'rgb(0,255,0)',
    blue = 'rgb(0,0,255)',
    yellow = 'rgb(255,255,0)',
    magenta = 'rgb(255,0,255)',
    cyan = 'rgb(0,255,255)',
    transparent = 'transparent'
}
