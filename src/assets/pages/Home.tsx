import DragDropArea from "../components/DragDropArea.tsx";
import {useState} from "react";

export default function Home()
{
    const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);

    return (
        <>
            {selectedFile ?
                <></> :
                <DragDropArea onFileSelected={setSelectedFile}/>
            }
        </>
    );
}