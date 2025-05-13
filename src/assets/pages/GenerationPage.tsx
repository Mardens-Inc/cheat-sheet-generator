import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {ExcelCommands, SheetData} from "../ts/ExcelCommands.ts";
import QRCode from "../components/QRCode.tsx";
import {Icon} from "@iconify-icon/react";
import {Button, cn} from "@heroui/react";
import {motion} from "framer-motion";

export default function GenerationPage()
{
    const navigate = useNavigate();
    const {search} = useLocation();
    const [data, setData] = useState<SheetData[][]>([]);

    useEffect(() =>
    {
        ExcelCommands.extractSheetDataFromSearchParams(search, navigate).then(setData);
    }, [search]);
    if (data.length === 0) return null;
    return (
        <>
            <motion.div
                className={"flex flex-col overflow-auto ml-2"}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: 20}}
                transition={{duration: 0.2, delay: 0.2, ease: "easeInOut"}}
            >
                {data.map(sheetData => <QRSheet sheet={sheetData}/>)}
            </motion.div>
            <motion.div
                className={
                    cn(
                        "absolute inset-x-0 bottom-2 m-auto rounded-full w-[170px] h-16",
                        "flex flex-row justify-center items-center gap-2 px-4",
                        "bg-black/30 backdrop-blur-lg backdrop-contrast-150"
                    )
                }

                initial={{opacity: 0, y: 80}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: 20}}
                transition={{duration: 0.5, delay: .5, ease: "easeInOut"}}
            >
                <Button color={"primary"} radius={"full"} className={"min-w-0 w-10"}><Icon icon={"mage:printer-fill"}/></Button>
                <Button startContent={<Icon icon={"mage:save-floppy-fill"}/>} className={"text-black bg-white"} radius={"full"}>Save</Button>
            </motion.div>
        </>
    );
}


function QRSheet(props: { sheet: SheetData[] })
{
    return (
        <div className={"grid grid-cols-2 gap-2 bg-white text-black mb-2"}>
            {props.sheet.map(data => (
                <div className={"flex flex-row items-center border-dashed border-1 border-black rounded-lg"}>
                    <div className={"flex flex-col items-center"}>
                        <QRCode data={data.UPC}/>
                        <p className={"-mt-6"}>{data.UPC}</p>
                    </div>
                    <p>{data.DESCRIPTION}</p>
                </div>
            ))}
        </div>
    );
}