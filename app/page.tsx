"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  date?: string;
  type: "image" | "video";
}

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pinnedImageIds");

    if (saved) {
      setPinnedIds(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "pinnedImageIds",
      JSON.stringify(Array.from(pinnedIds))
    );
  }, [pinnedIds]);

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/images");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || "Failed to fetch media");
      }

      setMedia(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching media:", err);

      setError(
        err instanceof Error ? err.message : "Failed to fetch media"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const sortedMedia = [...media].sort((a, b) => {
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);

    if (aPinned === bPinned) return 0;

    return aPinned ? -1 : 1;
  });

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const newPinned = new Set(pinnedIds);

    if (newPinned.has(id)) {
      newPinned.delete(id);
    } else {
      newPinned.add(id);
    }

    setPinnedIds(newPinned);
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Content Planner</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Instagram-style preview from your Notion database
            </p>
          </div>

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading your content...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <strong>Could not load content.</strong>
            <div className="mt-1 break-words">{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && media.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No images or videos found in your Notion database.
          </div>
        )}

        {/* Grid */}
        {!loading && media.length > 0 && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {sortedMedia.slice(0, 30).map((item) => {
              const isPinned = pinnedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-900"
                  onClick={() => setSelectedMedia(item)}
                >
                  {/* Image */}
                  {item.type === "image" && (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}

                  {/* Video */}
                  {item.type === "video" && (
                    <>
                      <video
                        src={item.src}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                          <svg
                            className="ml-0.5 h-5 w-5 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                        Reel
                      </div>
                    </>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                  {/* Pinned */}
                  {isPinned && (
                    <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-black">
                      Pinned
                    </div>
                  )}

                  {/* Pin button */}
                  <button
                    onClick={(e) => togglePin(item.id, e)}
                    className="absolute right-2 bottom-2 hidden rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-black shadow-sm group-hover:block"
                  >
                    {isPinned ? "Unpin" : "Pin"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox */}
        {selectedMedia && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-xl text-white"
              >
                ×
              </button>

              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.src}
                  alt={selectedMedia.alt}
                  className="max-h-[80vh] w-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-full object-contain"
                />
              )}

              <div className="bg-white p-4 text-black dark:bg-gray-950 dark:text-white">
                {selectedMedia.title && (
                  <h2 className="font-semibold">{selectedMedia.title}</h2>
                )}

                {selectedMedia.date && (
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(selectedMedia.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}