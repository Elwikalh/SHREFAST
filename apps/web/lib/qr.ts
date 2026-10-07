import { toString as qrToString } from "qrcode"

// QR codes are rendered as SVG so they stay razor sharp at any size — a
// sticker on a counter or a poster on a street point are printed from the
// same file. Error-correction level M survives a bit of dirt and glare.
export async function renderQrSvg(text: string): Promise<string> {
	return qrToString(text, {
		type: "svg",
		errorCorrectionLevel: "M",
		margin: 1,
		width: 512,
		color: { dark: "#1f1b18", light: "#ffffff" },
	})
}
