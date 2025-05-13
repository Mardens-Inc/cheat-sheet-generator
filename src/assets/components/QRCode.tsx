import {HTMLAttributes, useEffect, useState} from "react";
import {QRCodeCommands} from "../ts/QRCodeCommands.ts";

interface QRCodeProps extends HTMLAttributes<HTMLDivElement>
{
    data: string;
}

export default function QRCode(props: QRCodeProps)
{
    const {data, ...otherProps} = props;
    const [svg, setSvg] = useState("");

    useEffect(() =>
    {
        QRCodeCommands
            .getQRCode(data)
            .then(setSvg);
    }, []);

    return (
        <div {...otherProps} dangerouslySetInnerHTML={{__html: svg}}/>
    );
}