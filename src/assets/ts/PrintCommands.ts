import {SheetData} from "./ExcelCommands.ts";
import {QRCodeCommands} from "./QRCodeCommands.ts";
import {open} from "@tauri-apps/plugin-dialog";
import {invoke} from "@tauri-apps/api/core";
import html2canvas from "html2canvas";

export class PrintCommands
{
    /**
     * Sanitizes a sheet name for use as a directory name by removing illegal characters.
     *
     * @param sheetName - The sheet name to sanitize
     * @returns A sanitized version of the sheet name that can be used as a directory name
     */
    private static sanitizeSheetNameForDirectory(sheetName: string): string
    {
        // Replace characters that are illegal in Windows file/directory names
        // These include: < > : " / \ | ? *
        return sheetName
            .replace(/[<>:"\/\\|?*]/g, "_") // Replace illegal chars with underscore
            .replace(/\s+/g, "_")           // Replace spaces with underscore
            .replace(/^\.+/, "_")           // Replace leading dots
            .replace(/\.+$/, "_")           // Replace trailing dots
            .trim();                        // Remove any leading/trailing whitespace
    }

    /**
     * Prints the SheetData in a 3-column landscape format.
     * Similar to the GenerationPage display but optimized for printing.
     * Each sheet is separated by a page break.
     *
     * @param data - 2D Array of SheetData to print, where each inner array represents a separate sheet
     */
    static async printSheetData(data: SheetData[][] | SheetData[]): Promise<void>
    {
        // Handle both 1D and 2D arrays for backward compatibility
        const sheets = Array.isArray(data[0]) ? data as SheetData[][] : [data as SheetData[]];

        if (sheets.length === 0 || sheets.every(sheet => sheet.length === 0)) return;

        // Create a new window for printing
        const printWindow = window.open("", "_blank", "width=1100,height=600,toolbar=no,scrollbars=no,resizable=no");
        if (!printWindow)
        {
            console.error("Failed to open print window");
            return;
        }

        // Start the HTML document
        let fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Print Sheets</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
                    .sheet {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        grid-template-rows: repeat(5, 1fr);
                        gap: 8px;
                        background-color: white;
                        color: black;
                        margin-bottom: 8px;
                        width: 1056px; /* 11 inches at 96 DPI */
                        height: 816px; /* 8.5 inches at 96 DPI */
                        page-break-after: always;
                    }
                    .item {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        border: 1px dashed black;
                        border-radius: 8px;
                        width: 346px;
                        height: 147px;
                        padding: 4px;
                        overflow: hidden;
                    }
                    .qr-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .qr-container svg {
                        height: 100px; /* Reduced from default 200px */
                        width: auto;
                    }
                    .upc {
                        margin-top: -6px;
                        font-size: 0.8em;
                    }
                    .description {
                        margin-left: 8px;
                        font-size: 0.9em;
                        text-wrap: wrap;
                    }
                </style>
            </head>
            <body>
        `;

        // Process each sheet separately
        for (const sheetData of sheets)
        {
            if (sheetData.length === 0) continue;

            // Create a sheet div for this sheet's items
            fullHtml += "<div class=\"sheet\">";

            // Process each item in this sheet
            for (const item of sheetData)
            {
                const qrCode = await QRCodeCommands.getQRCode(item.UPC);

                fullHtml += `
                    <div class="item">
                        <div class="qr-container">
                            ${qrCode}
                            <p class="upc">${item.UPC}</p>
                        </div>
                        <p class="description">${item.DESCRIPTION}</p>
                    </div>
                `;
            }

            fullHtml += "</div>"; // Close the sheet div (with page-break-after: always)
        }

        // Finish the HTML document
        fullHtml += `
            </body>
            </html>
        `;

        // Set up the HTML document
        printWindow.document.write(fullHtml);

        // Wait for all content to load (especially QR codes)
        printWindow.document.close();

        printWindow.print();
        printWindow.focus();
        printWindow.close();
    }

    /**
     * Converts HTML to a PNG image using html2canvas.
     *
     * @param html - The HTML content to convert
     * @param width - The width of the resulting image
     * @param height - The height of the resulting image
     * @returns A Promise that resolves to a data URL of the PNG image
     */
    private static async htmlToPng(html: string, width: number, height: number): Promise<string>
    {
        if (html === "") return "";

        try
        {
            // Create a temporary container for the HTML
            const container = document.createElement("div");
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.position = "absolute";
            container.style.left = "-9999px";
            container.style.top = "-9999px";
            container.innerHTML = html;

            document.body.appendChild(container);

            // Use html2canvas to capture the content
            const canvas = await html2canvas(container, {
                width: width,
                height: height,
                scale: 1,
                useCORS: true,
                allowTaint: true
            });

            // Remove the temporary container
            document.body.removeChild(container);

            // Convert the canvas to a data URL
            return canvas.toDataURL("image/png");
        } catch (e)
        {
            console.error("Failed to convert HTML to PNG:", e);
            return "";
        }
    }


    /**
     * Saves the SheetData as PNG files in the selected directory.
     * Creates a subdirectory for each sheet using the sheet name and uses independent counters per sheet.
     *
     * @param data - 2D Array of SheetData to save, where each inner array represents a separate sheet
     * @param sheetNames - Array of sheet names corresponding to the sheets in data
     */
    static async saveSheetDataAsPng(data: SheetData[][] | SheetData[], sheetNames?: string[]): Promise<void>
    {
        // Handle both 1D and 2D arrays for backward compatibility
        const sheets = Array.isArray(data[0]) ? data as SheetData[][] : [data as SheetData[]];

        if (sheets.length === 0 || sheets.every(sheet => sheet.length === 0)) return;

        // Ask the user to select a directory
        const dirPath = await open({
            directory: true,
            title: "Select Directory to Save Images",
            multiple: false
        });

        if (!dirPath)
        {
            console.log("Directory selection cancelled");
            return;
        }

        try
        {
            // Process each sheet
            for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++)
            {
                const sheetData = sheets[sheetIndex];
                if (sheetData.length === 0) continue;

                // Create a subdirectory for this sheet using the sheet name if available
                let sheetDirName: string;
                if (sheetNames && sheetIndex < sheetNames.length)
                {
                    // Use the sanitized sheet name
                    sheetDirName = PrintCommands.sanitizeSheetNameForDirectory(sheetNames[sheetIndex]);
                } else
                {
                    // Fallback to the old naming scheme
                    sheetDirName = `sheet-${sheetIndex + 1}`;
                }
                const sheetDirPath = `${dirPath as string}\\${sheetDirName}`;

                // Calculate how many pages we need for this sheet (15 items per page)
                const itemsPerPage = 15;
                const totalPages = Math.ceil(sheetData.length / itemsPerPage);

                // Process each page for this sheet
                for (let pageNum = 0; pageNum < totalPages; pageNum++)
                {
                    // Get the items for this page
                    const pageItems = sheetData.slice(pageNum * itemsPerPage, (pageNum + 1) * itemsPerPage);

                    // Generate the HTML for this page
                    let html = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <title>Sheet ${sheetIndex + 1} - Page ${pageNum + 1}</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 0;
                                    padding: 0;
                                }
                                .sheet {
                                    display: grid;
                                    grid-template-columns: repeat(3, 1fr);
                                    grid-template-rows: repeat(5, 1fr);
                                    gap: 8px;
                                    background-color: white;
                                    color: black;
                                    width: 1056px; /* 11 inches at 96 DPI */
                                    height: 816px; /* 8.5 inches at 96 DPI */
                                }
                                .item {
                                    display: flex;
                                    flex-direction: row;
                                    align-items: center;
                                    border: 1px dashed black;
                                    border-radius: 8px;
                                    width: 346px;
                                    height: 147px;
                                    padding: 4px;
                                    overflow: hidden;
                                }
                                .qr-container {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }
                                .qr-container svg {
                                    height: 100px; /* Reduced from default 200px */
                                    width: auto;
                                }
                                .upc {
                                    margin-top: -6px;
                                    font-size: 0.8em;
                                }
                                .description {
                                    margin-left: 8px;
                                    font-size: 0.9em;
                                    text-wrap: wrap;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="sheet">
                    `;

                    // Process each item for this page
                    for (const item of pageItems)
                    {
                        const qrCode = await QRCodeCommands.getQRCode(item.UPC);

                        html += `
                            <div class="item">
                                <div class="qr-container">
                                    ${qrCode}
                                    <p class="upc">${item.UPC}</p>
                                </div>
                                <p class="description">${item.DESCRIPTION}</p>
                            </div>
                        `;
                    }

                    html += `
                            </div>
                        </body>
                        </html>
                    `;

                    // Convert the HTML to a PNG
                    const width = 1056; // 11 inches at 96 DPI
                    const height = 816; // 8.5 inches at 96 DPI
                    const dataUrl = await PrintCommands.htmlToPng(html, width, height);
                    if (dataUrl === "") continue;

                    // Create a file name with sheet-specific counter
                    const fileName = `cheat-sheet-${pageNum + 1}.png`;

                    // Send the image data to the Rust backend to save
                    try
                    {
                        const result = await invoke("save_image", {
                            request: {
                                directory: sheetDirPath,
                                filename: fileName,
                                data: dataUrl
                            }
                        });
                        console.log(result);
                    } catch (error)
                    {
                        console.error(`Error saving image: ${error}`);
                    }
                }
            }
        } catch (error)
        {
            console.error("Error saving sheet data as PNG:", error);
        }
    }
}
