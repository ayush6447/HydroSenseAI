import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { detectDisease } from '../../api/predict';
export default function ImageUpload() {
    const [result, setResult] = useState(null);
    const handleFile = async (e) => {
        if (!e.target.files?.[0])
            return;
        const r = await detectDisease(e.target.files[0]);
        setResult(r.data);
    };
    return (_jsxs("div", { className: "border-2 border-dashed rounded-lg p-8 text-center", children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleFile, className: "hidden", id: "img" }), _jsx("label", { htmlFor: "img", className: "cursor-pointer text-green-600", children: "Upload plant image for YOLOv8 analysis" }), result && _jsx("pre", { className: "mt-4 text-xs text-left", children: JSON.stringify(result, null, 2) })] }));
}
