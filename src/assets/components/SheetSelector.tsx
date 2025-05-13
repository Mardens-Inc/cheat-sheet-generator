import {useEffect, useState} from "react";
import {ExcelCommands} from "../ts/ExcelCommands.ts";
import {Button, Listbox, ListboxItem, Spinner} from "@heroui/react";
import {motion} from "framer-motion";

type SheetSelectorProps = {
    filePath: string;
    onSheetSelected: (sheets: string[]) => void;
    onCancel: () => void;
}
export default function SheetSelector(props: SheetSelectorProps)
{
    const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set([]));
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUnloadingComponent, setIsUnloadingComponent] = useState(false);
    useEffect(() =>
    {
        setIsLoading(true);
        ExcelCommands
            .getSheetNames(props.filePath)
            .then(setSheetNames)
            .finally(() => setIsLoading(false));
    }, [props.filePath]);
    return (
        <>
            {isLoading ?
                <div className={"flex w-full h-full items-center justify-center"}>
                    <Spinner size={"lg"} color={"primary"}/>
                </div>
                :
                <motion.div
                    className={"flex flex-col w-full gap-4 mb-4 mx-4 overflow-hidden"}
                    animate={{opacity: isUnloadingComponent ? 0 : 1, y: isUnloadingComponent ? 40 : 0}}
                    initial={{opacity: 0, y: 20}}

                >
                    <p className={"text-2xl"}>Select Sheet</p>
                    <Listbox
                        label={"Select Sheet"}
                        aria-label={"Select Sheet"}
                        selectionMode={"multiple"}
                        selectedKeys={selectedSheets}
                        onSelectionChange={keys => setSelectedSheets(new Set([...keys] as string[]))}
                        className={"h-full bg-foreground/10 rounded-lg p-2 overflow-auto"}
                        variant={"flat"}
                        color={"primary"}
                    >
                        {sheetNames.map(sheetName => (
                            <ListboxItem key={sheetName} textValue={sheetName} aria-label={sheetName}>{sheetName}</ListboxItem>
                        ))}
                    </Listbox>
                    <div className={"flex flex-row gap-2 mx-auto"}>
                        <Button isDisabled={selectedSheets.size === 0} onPress={()=>props.onSheetSelected([...selectedSheets])}>Select Sheet</Button>
                        <Button variant={"light"} color={"danger"} onPress={() =>
                        {
                            setIsUnloadingComponent(true);
                            setTimeout(() => props.onCancel(), 200);
                        }}>Cancel</Button>
                    </div>
                </motion.div>
            }
        </>
    );
}