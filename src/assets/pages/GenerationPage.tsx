import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {addToast} from "@heroui/react";

export default function GenerationPage()
{
    const [filePath, setFilePath] = useState<string | undefined>(undefined);
    const [sheets, setSheets] = useState<string[]>([]);
    const navigate = useNavigate();
    const {search} = useLocation();

    useEffect(() =>
    {
        const params = new URLSearchParams(search);

        // Get filepath
        const filePath = params.get("file");
        if (filePath === null)
        {
            addToast({
                title: "Unexpected Route Change",
                description: "A transfer to the Generation page was triggered without a file path. Please report this issue to the developer.",
                color: "danger"
            });
            navigate("/");
        } else setFilePath(decodeURIComponent(filePath));

        // Get sheets
        const sheets = params.get("sheets");
        if (sheets === null)
        {
            addToast({
                title: "Unexpected Route Change",
                description: "A transfer to the Generation page was triggered without having specified sheets. Please report this issue to the developer.",
                color: "danger"
            });
            navigate("/");
        } else setSheets(JSON.parse(decodeURIComponent(sheets)));

    }, [search]);
    return (
        <>
            hello world
        </>
    );
}