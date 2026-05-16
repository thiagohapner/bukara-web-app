"use client";

import { useState, useRef, useCallback } from "react";

interface ImageRow {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Props {
  entityType: "product" | "offer";
  entityId: string;
  images: ImageRow[];
  onChange: (images: ImageRow[]) => void;
}

export default function ImageUploadManager({ entityType, entityId, images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    (file: File) => {
      if (images.length >= 4) {
        alert("Maximum 4 images allowed.");
        return;
      }
      setUploading(true);
      setProgress(0);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("entityType", entityType);
      fd.append("entityId", entityId);
      fd.append("sortOrder", String(images.length));

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () => {
        setUploading(false);
        if (xhr.status === 200) {
          const row: ImageRow = JSON.parse(xhr.responseText);
          onChange([...images, row]);
        } else {
          const err = JSON.parse(xhr.responseText);
          alert("Upload failed: " + (err.error ?? xhr.status));
        }
      });
      xhr.addEventListener("error", () => {
        setUploading(false);
        alert("Upload failed.");
      });
      xhr.open("POST", "/api/admin/upload-image");
      xhr.send(fd);
    },
    [images, entityType, entityId, onChange]
  );

  const deleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    const res = await fetch("/api/admin/delete-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, entityType }),
    });
    if (res.ok) {
      onChange(images.filter((img) => img.id !== id));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...images];
    const [item] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, item);
    const updated = reordered.map((img, i) => ({ ...img, sort_order: i }));
    onChange(updated);
    fetch("/api/admin/reorder-images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updated.map(({ id, sort_order }) => ({ id, sort_order })), entityType }),
    });
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-teal-500 bg-teal-50" : "border-slate-200"
        } ${images.length >= 4 ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-slate-500">{progress}%</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {images.length >= 4 ? "Maximum 4 images reached" : "Drop image here or click to upload"}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) handleDragItem(dragIndex, i);
                setDragIndex(null);
              }}
              className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-grab active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                  className="text-white text-xs bg-red-600 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <span className="absolute top-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
