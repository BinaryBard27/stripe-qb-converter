"use client";

import { useRef, useState } from "react";

interface FileDropzoneProps {
  accept?: string;
  onFile: (file: File) => void;
  label?: string;
}

export default function FileDropzone({ accept = ".csv,.tsv,.txt", onFile, label = "CSV or TSV" }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const choose = (file: File | undefined) => {
    if (file) onFile(file);
  };

  return (
    <div
      className={`file-dropzone ${dragging ? "is-dragging" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files?.[0]); }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden-input" onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ""; }} />
      <button type="button" className="file-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="file-dropzone-icon" aria-hidden="true">↑</span>
        <strong>{dragging ? "Drop it here" : "Drop file or click to browse"}</strong>
        <small>{label} · processed locally in your browser</small>
      </button>
    </div>
  );
}
