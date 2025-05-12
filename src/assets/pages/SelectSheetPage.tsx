import SheetSelector from "../components/SheetSelector.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

export default function SelectSheetPage()
{
    const [filePath, setFilePath] = useState<string | undefined>(undefined);
    const navigate = useNavigate();
    const {search} = useLocation();

    useEffect(() =>
    {
        const params = new URLSearchParams(search);
        const filePath = params.get("file");
        if (filePath === null) navigate("/");
        else setFilePath(decodeURIComponent(filePath));
    }, [search]);

    if (filePath === undefined) return null;

    return (
        <SheetSelector filePath={filePath} onSheetSelected={_sheets =>
        {
        }} onCancel={() => navigate("/")}/>
    );
}