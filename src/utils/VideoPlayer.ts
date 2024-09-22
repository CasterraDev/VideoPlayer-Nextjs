import { CaptionColor } from "@/types/VideoPlayer"

export const ColorDisplayNameArray = ["White", "Black", "Red", "Green", "Blue", "Yellow", "Magenta", "Cyan"]

export const displayColorsToCaptionColors = (s: string): string => {
    switch (s) {
        case "White":
            return CaptionColor.white
        case "Black":
            return CaptionColor.black
        case "Red":
            return CaptionColor.red
        case "Blue":
            return CaptionColor.blue
        case "Green":
            return CaptionColor.green
        case "Yellow":
            return CaptionColor.yellow
        case "Magenta":
            return CaptionColor.magenta
        case "Cyan":
            return CaptionColor.cyan
        case "Transparent":
            return CaptionColor.transparent
        default:
            break;
    }
    return "Error"
}

export const captionColorsToDisplayColors = (s: string): string => {
    switch (s) {
        case CaptionColor.white:
            return "White"
        case CaptionColor.black:
            return "Black"
        case CaptionColor.red:
            return "Red"
        case CaptionColor.green:
            return "Green"
        case CaptionColor.blue:
            return "Blue"
        case CaptionColor.yellow:
            return "Yellow"
        case CaptionColor.magenta:
            return "Magenta"
        case CaptionColor.cyan:
            return "Cyan"
        case CaptionColor.transparent:
            return "Transparent"
        default:
            break;
    }
    return "Error"
}

export const AddAlphaToRGBColor = (color: string, opacity: string): string => {
    if (color == CaptionColor.transparent) return color
    const i = color.lastIndexOf(")")
    const rgb = color.slice(0, i);
    const opc = String(Number(opacity.slice(0, -1)) / 100)
    const str = rgb + "," + opc + ")"
    return str
}
