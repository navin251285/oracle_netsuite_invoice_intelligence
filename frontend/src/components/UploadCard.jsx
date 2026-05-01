import React, { useRef } from "react";

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadCard({ file, disabled, onFileSelect, onSubmit }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") onFileSelect(dropped);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <section className="card upload-card fade-in">
      <h2>Upload Invoice PDF</h2>
      <p className="section-subtitle">Drop a file or browse from your system.</p>

      <div
        className={`drop-zone ${disabled ? "disabled" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          disabled={disabled}
          hidden
        />
        <p className="drop-title">Drag and drop PDF here</p>
        <p className="drop-hint">or click to choose a file</p>
      </div>

      {file ? (
        <div className="file-meta">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatSize(file.size)}</span>
        </div>
      ) : null}

      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={!file || disabled}
        type="button"
      >
        Process PDF
      </button>
    </section>
  );
}
