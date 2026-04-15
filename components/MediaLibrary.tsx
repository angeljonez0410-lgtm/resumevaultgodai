"use client";

import { useEffect, useState } from "react";
import { authFetch } from "../lib/auth-fetch";

type MediaFile = {
  name: string;
  filePath: string;
  publicUrl: string;
  createdAt?: string;
};

export default function MediaLibrary({
  onSelect,
  refreshKey,
}: {
  onSelect: (url: string) => void;
  refreshKey: number;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [message, setMessage] = useState("");

  async function loadFiles() {
    const res = await authFetch("/api/media-library");
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to load media");
      return;
    }

    setFiles(data.files || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFiles();
  }, [refreshKey]);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-bold text-gray-900">Media Library</h3>

      {message ? <p className="text-sm text-gray-600 mt-3">{message}</p> : null}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <button
            key={file.filePath}
            type="button"
            onClick={() => onSelect(file.publicUrl)}
            className="border border-gray-200 rounded-xl p-2 text-left hover:border-indigo-500"
          >
            <img
              src={file.publicUrl}
              alt={file.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <p className="text-xs text-gray-600 mt-2 break-all">{file.name}</p>
          </button>
        ))}
      </div>

      {!files.length ? (
        <p className="text-sm text-gray-500 mt-4">No uploaded media yet</p>
      ) : null}
    </div>
  );
}
