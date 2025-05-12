import {invoke} from "@tauri-apps/api/core";
import {addToast} from "@heroui/react";

export class ExcelCommands
{
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

}