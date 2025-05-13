import {invoke} from "@tauri-apps/api/core";
import {addToast} from "@heroui/react";
import {NavigateFunction} from "react-router-dom";

export type SheetData = {
    "PRODUCT#": string,
    "DESCRIPTION": string,
    "UPC": string,
    "ALT_BARCODE": string,
    "COST": string,
    "SELL_PRICE": string,
    "VENDOR": string,
    "LVL1_DEPARTMENT": string,
    "LVL2_CATEGORY": string,
    "TAX_CODE": string,
    "ITEM_SUBA": string,
};

export class ExcelCommands
{
    /**
     * Retrieves the sheet names from an Excel file located at the specified file path.
     *
     * @param {string} filePath - The path to the Excel file whose sheet names are to be retrieved.
     * @return {Promise<string[]>} A promise that resolves to an array of sheet names from the Excel file.
     */
    static async getSheetNames(filePath: string): Promise<string[]>
    {
        try
        {
            return invoke("get_sheet_names", {filePath: filePath});
        } catch (e)
        {
            addToast({
                title: "Excel Error",
                description: "Could not read the sheet names from the Excel file. Please read the logs for more information.",
                color: "danger",
                timeout: 10000
            });
            console.error("Could not read the sheet names from the Excel file.", e);
        }
        return [];
    }

    /**
     * Retrieves data from a specific sheet in an Excel file.
     *
     * @param {string} filePath - The path of the Excel file to read data from.
     * @param {string} sheetName - The name of the sheet within the Excel file to retrieve data from.
     * @return {Promise<SheetData[]>} A promise that resolves to an array of SheetData objects containing the data from the specified sheet.
     */
    static async getSheetData(filePath: string, sheetName: string): Promise<SheetData[]>
    {
        try
        {
            const value: string = await invoke("get_sheet_data", {filePath: filePath, sheetName: sheetName});
            return JSON.parse(value);
        } catch (e)
        {
            addToast({
                title: "Excel Error",
                description: "Could not read the sheet data from the Excel file. Please read the logs for more information.",
                color: "danger"
            });
            console.error("Could not read the sheet data from the Excel file.", e);
        }
        return [];
    }


    /**
     * Extracts sheet data from the provided search parameters.
     *
     * @param {string} search - The search parameter string containing sheet-related data.
     * @param {NavigateFunction} navigate - A navigation function used for handling errors or routing.
     * @return {Promise<{data: SheetData[][], sheetNames: string[]}>} A promise that resolves to an object containing the extracted sheet data and sheet names.
     */
    static async extractSheetDataFromSearchParams(search: string, navigate: NavigateFunction): Promise<{data: SheetData[][], sheetNames: string[]}>
    {
        const params = new URLSearchParams(search);

        const filePath = this.getFileNameFromParam(params, navigate);
        const sheetNames = this.getSheetNamesFromParams(params, navigate);
        const data = await Promise.all(sheetNames.map(sheet => ExcelCommands.getSheetData(filePath, sheet)));
        return { data, sheetNames };
    }

    /**
     * Extracts the file name from the given URLSearchParams object. If the "file" parameter is missing,
     * the user is navigated to the root page and a toast message is displayed to notify the error.
     *
     * @param {URLSearchParams} params The URLSearchParams object that contains query parameters.
     * @param {NavigateFunction} navigate The function to navigate to a different route.
     * @return {string} The decoded file name from the "file" parameter, or an empty string if the parameter is missing.
     */
    private static getFileNameFromParam(params: URLSearchParams, navigate: NavigateFunction): string
    {
        let filePath = params.get("file");
        if (filePath === null)
        {
            addToast({
                title: "Unexpected Route Change",
                description: "A transfer to the Generation page was triggered without a file path. Please report this issue to the developer.",
                color: "danger"
            });
            navigate("/");
            return "";
        }
        return decodeURIComponent(filePath);
    }

    /**
     * Retrieves an array of sheet names from the provided URLSearchParams. If the parameter is missing
     * or cannot be parsed, it handles the error and navigates to the root route.
     *
     * @param {URLSearchParams} params - The URL search parameters containing the "sheets" parameter.
     * @param {NavigateFunction} navigate - The navigation function used to redirect the user in case of an error.
     * @return {string[]} An array of sheet names parsed from the "sheets" parameter. Returns an empty array if parsing fails or the parameter is missing.
     */
    private static getSheetNamesFromParams(params: URLSearchParams, navigate: NavigateFunction): string[]
    {

        let sheets: string | string[] | null = params.get("sheets");
        if (sheets === null)
        {
            addToast({
                title: "Unexpected Route Change",
                description: "A transfer to the Generation page was triggered without having specified sheets. Please report this issue to the developer.",
                color: "danger"
            });
            navigate("/");
            return [];
        } else
        {
            try
            {
                return JSON.parse(decodeURIComponent(sheets)) as string[];
            } catch
            {
                addToast({
                    title: "Route Change Error",
                    description: "The sheets parameter could not be parsed. Please report this issue to the developer.",
                    color: "danger"
                });
            }
        }
        return [];
    }

}
