import {invoke} from "@tauri-apps/api/core";

export class QRCodeCommands {

    /**
     * Generates a QR Code for the given text.
     * @param text - SVG string
     */
    static async getQRCode(text: string): Promise<string>
    {
        return invoke("generate_qrcode", {value: text})
    }
}