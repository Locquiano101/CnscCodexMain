import React, { useState, useRef } from "react";
import { Upload, X, RotateCcw, FileText, FileMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

export default function DocumentUploader({
  onFileSelect = null,
  showReset = true,
  className = "",
  acceptedFormats = "application/pdf",
  title = "Upload PDF Document",
}) {
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    setFileData({
      name: file.name,
      size: (file.size / 1024).toFixed(2), // in KB
      file,
    });

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const resetFile = () => {
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {!fileData ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">{title}</h2>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 !text-white"
            >
              Choose PDF File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Selected Document</CardTitle>
              {showReset && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFile}
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1">
              <p>
                <strong>Filename:</strong> {fileData.name}
              </p>
              <p>
                <strong>Size:</strong> {fileData.size} KB
              </p>
            </div>
            {showReset && (
              <Button
                variant="secondary"
                onClick={resetFile}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function DocumentDisplayCard({
  name = null,
  size = null,
  downloadUrl = null, // Direct link or route for the file
  className = "",
}) {
  if (!name && !size && !downloadUrl) {
    return (
      <div className="flex items-center gap-4">
        <FileMinus size={32} className="text-muted-foreground" />
        <p className="text-muted-foreground italic">No document available.</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = name || "document.pdf"; // fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      onClick={handleDownload}
      className={cn("cursor-pointer hover:bg-muted/50 transition-colors", className)}
      title="Click to download"
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div className="text-primary bg-primary/10 rounded-full p-2">
          <FileText className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-1">
          {name && <p className="font-medium">{name}</p>}
          {size && <p className="text-sm text-muted-foreground">Size: {size}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function FileRenderer({ basePath, fileName }) {
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/.test(fileName);
  const raw = `${basePath}/${isImage ? "photos" : "documents"}/${fileName}`;
  const url = encodeURI(raw);

  const [showModal, setShowModal] = useState(false);
  if (isImage) {
    return (
      <>
        <div className="object-cover h-70 object-center rounded-lg flex-shrink-0 flex flex-wrap relative overflow-hidden">
          <img
            src={url}
            alt={fileName}
            className="w-full h-70x-2 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowModal(true)}
          />
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <DialogClose className="absolute top-4 right-4 z-50">
              <Button variant="destructive" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
            <img
              src={url}
              alt={fileName}
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4 flex flex-col justify-center items-center">
        <FileText className="w-12 h-12 text-muted-foreground" />
        <Button variant="link" asChild>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            (preview) - {fileName}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
