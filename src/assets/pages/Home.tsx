import DragDropArea from "../components/DragDropArea.tsx";
import {useNavigate} from "react-router-dom";

export default function Home()
{
    const navigate = useNavigate();

    return (
        <DragDropArea onFileSelected={file =>
        {
            navigate(`/select-sheets?file=${encodeURIComponent(file)}`);
        }}/>
    )
        ;
}