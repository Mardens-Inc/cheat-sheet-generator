import SheetSelector from "../components/SheetSelector.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {addToast} from "@heroui/react";

export default function SelectSheetPage()
{
    const [filePath, setFilePath] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const {search} = useLocation();

    useEffect(() =>
    {
        const params = new URLSearchParams(search);
        const filePath = params.get("file");
        if (filePath === null)
        {
            addToast({
                title: "Unexpected Route Change",
                description: "A transfer to the Select Sheet page was triggered without a file path. Please report this issue to the developer.",
                color: "danger"
            });
            navigate("/");
        } else setFilePath(decodeURIComponent(filePath));
    }, [search]);

    if (filePath === undefined) return null;

    return (
        <SheetSelector
            filePath={filePath}
            onSheetSelected={
                sheets =>
                {
                    navigate(`/generate?file=${encodeURIComponent(filePath)}&sheets=${encodeURIComponent(JSON.stringify(sheets))}`);
                }
            }
            onCancel={() => navigate("/")}
        />
    );
}