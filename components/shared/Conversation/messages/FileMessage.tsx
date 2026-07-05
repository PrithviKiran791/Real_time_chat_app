"use client";

import { Download, FileText, FileArchive, FileSpreadsheet, FileImage, File } from "lucide-react";

interface FileMessageProps {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (mimeType: string, fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (mimeType.startsWith("image/")) return <FileImage className="size-5" />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FileArchive className="size-5" />;
    if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet className="size-5" />;
    if (["doc", "docx", "pdf", "txt", "ppt", "pptx"].includes(ext)) return <FileText className="size-5" />;
    return <File className="size-5" />;
};

const FileMessage = ({ fileUrl, fileName, fileSize, mimeType }: FileMessageProps) => {
    const truncatedName =
        fileName.length > 28
            ? `${fileName.substring(0, 22)}…${fileName.split(".").pop() ?? ""}`
            : fileName;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 min-w-[220px] max-w-[280px]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {getFileIcon(mimeType, fileName)}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight" title={fileName}>
                    {truncatedName}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatFileSize(fileSize)}
                </p>
            </div>
            <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={`Download ${fileName}`}
            >
                <Download className="size-4" />
            </a>
        </div>
    );
};

export default FileMessage;
