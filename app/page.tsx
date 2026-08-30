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

/* =========================================================
   LET SPARK FLY PROFILE
========================================================= */

const profile = {
  username: "@let.sparks.fly",
  name: "Let Spark Fly",

  bio: [
    "Luxury Group Travel for Black Women.",
    "🌍 38+ Trips | 17 Countries | 1,000+ Women",
    "⭐ 4.8★ Google | Inc. 5000",
    "👇🏾 Book the trip. Stay for the sisterhood!",
  ],

  website: "https://letsparksfly.net/",
  websiteLabel: "letsparksfly.net",
};

/* =========================================================
   HIGHLIGHTS
========================================================= */

const highlights = [
  {
    name: "About",
    emoji: "✨",
  },
  {
    name: "Trips",
    emoji: "✈️",
  },
  {
    name: "Sisterhood",
    emoji: "💗",
  },
  {
    name: "Reviews",
    emoji: "⭐",
  },
  {
    name: "Destinations",
    emoji: "🌍",
  },
];

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMedia, setSelectedMedia] =
    useState<MediaItem | null>(null);

  const [activeTab, setActiveTab] =
    useState<"grid" | "reels">("grid");

  const [activeHighlight, setActiveHighlight] =
    useState<string | null>(null);

  /* =========================================================
     LOAD PINNED POSTS
  ========================================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pinnedImageIds");

      if (saved) {
        setPinnedIds(new Set(JSON.parse(saved)));
      }
    } catch (err) {
      console.error("Could not load pinned posts:", err);
    }
  }, []);

  /* =========================================================
     SAVE PINNED POSTS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "pinnedImageIds",
      JSON.stringify(Array.from(pinnedIds))
    );
  }, [pinnedIds]);

  /* =========================================================
     FETCH NOTION CONTENT
  ========================================================= */

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/images", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || "Failed to fetch content"
        );
      }

      setMedia(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching content:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch content"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  /* =========================================================
     SORT PINNED POSTS FIRST
  ========================================================= */

  const sortedMedia = [...media].sort((a, b) => {
    const aPinned = pinnedIds.has(a.id);
    const bPinned = pinnedIds.has(b.id);

    if (aPinned === bPinned) {
      return 0;
    }

    return aPinned ? -1 : 1;
  });

  /* =========================================================
     PIN / UNPIN
  ========================================================= */

  const togglePin = (
    id: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    const newPinned = new Set(pinnedIds);

    if (newPinned.has(id)) {
      newPinned.delete(id);
    } else {
      newPinned.add(id);
    }

    setPinnedIds(newPinned);
  };

  /* =========================================================
     GRID / REELS FILTER
  ========================================================= */

  const visibleMedia =
    activeTab === "grid"
      ? sortedMedia.filter(
          (item) => item.type === "image"
        )
      : sortedMedia.filter(
          (item) => item.type === "video"
        );

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-xl px-4 pb-12">

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <section className="pt-8">

          {/* Username */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.username}
            </h1>
          </div>

          {/* Name */}
          <p className="mt-2 text-sm font-medium">
            {profile.name}
          </p>

          {/* Stats */}
          <div className="mt-4 flex gap-6 text-sm">

            <div>
              <strong>{media.length}</strong>
              <span className="ml-1 text-gray-500">
                posts
              </span>
            </div>

            <div>
              <strong>38+</strong>
              <span className="ml-1 text-gray-500">
                trips
              </span>
            </div>

            <div>
              <strong>17</strong>
              <span className="ml-1 text-gray-500">
                countries
              </span>
            </div>

          </div>

          {/* Bio */}
          <div className="mt-4 text-sm leading-6">

            {profile.bio.map((line) => (
              <div key={line}>
                {line}
              </div>
            ))}

            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-medium text-blue-600 hover:underline"
            >
              {profile.websiteLabel}
            </a>

          </div>

        </section>

        {/* =====================================================
            HIGHLIGHTS
        ===================================================== */}

        <section className="mt-7">

          <div className="flex gap-5 overflow-x-auto pb-2">

            {highlights.map((highlight) => (

              <button
                key={highlight.name}
                onClick={() =>
                  setActiveHighlight(
                    highlight.name
                  )
                }
                className="flex w-16 shrink-0 flex-col items-center gap-2"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-2xl">
                  {highlight.emoji}
                </div>

                <span className="w-full truncate text-center text-xs">
                  {highlight.name}
                </span>

              </button>

            ))}

          </div>

        </section>

        {/* =====================================================
            REFRESH
        ===================================================== */}

        <div className="mt-4 flex justify-end">

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium transition hover:bg-gray-100 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div className="mt-5 grid grid-cols-2 border-t border-gray-200">

          <button
            onClick={() => setActiveTab("grid")}
            className={`border-b-2 py-3 text-sm transition ${
              activeTab === "grid"
                ? "border-black font-semibold"
                : "border-transparent text-gray-400"
            }`}
          >
            ▦ Grid
          </button>

          <button
            onClick={() => setActiveTab("reels")}
            className={`border-b-2 py-3 text-sm transition ${
              activeTab === "reels"
                ? "border-black font-semibold"
                : "border-transparent text-gray-400"
            }`}
          >
            ▶ Reels
          </button>

        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (

          <div className="py-16 text-center text-sm text-gray-500">
            Loading your content...
          </div>

        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <p className="font-semibold">
              Could not load your content.
            </p>

            <p className="mt-1 break-words">
              {error}
            </p>

          </div>

        )}

        {/* =====================================================
            MEDIA GRID
        ===================================================== */}

        {!loading && !error && (

          <>

            {visibleMedia.length === 0 ? (

              <div className="py-16 text-center text-sm text-gray-500">

                {activeTab === "grid"
                  ? "No image posts yet."
                  : "No reels yet."}

              </div>

            ) : (

              <div className="grid grid-cols-3 gap-0.5">

                {visibleMedia.map((item) => {

                  const isPinned =
                    pinnedIds.has(item.id);

                  return (

                    <div
                      key={item.id}
                      className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                      onClick={() =>
                        setSelectedMedia(item)
                      }
                    >

                      {/* IMAGE */}
                      {item.type === "image" && (

                        <img
                          src={item.src}
                          alt={item.alt}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                      )}

                      {/* VIDEO */}
                      {item.type === "video" && (

                        <>

                          <video
                            src={item.src}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-0 flex items-center justify-center">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white">
                              ▶
                            </div>

                          </div>

                        </>

                      )}

                      {/* PINNED */}
                      {isPinned && (

                        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-black">
                          Pinned
                        </div>

                      )}

                      {/* PIN BUTTON */}
                      <button
                        onClick={(event) =>
                          togglePin(
                            item.id,
                            event
                          )
                        }
                        className="absolute bottom-2 right-2 hidden rounded-full bg-white/90 px-3 py-2 text-[10px] font-medium text-black shadow-sm group-hover:block"
                      >
                        {isPinned
                          ? "Unpin"
                          : "Pin"}
                      </button>

                    </div>

                  );

                })}

              </div>

            )}

          </>

        )}

        {/* =====================================================
            MEDIA LIGHTBOX
        ===================================================== */}

        {selectedMedia && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() =>
              setSelectedMedia(null)
            }
          >

            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-black"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* CLOSE */}
              <button
                onClick={() =>
                  setSelectedMedia(null)
                }
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-xl text-white"
              >
                ×
              </button>

              {/* IMAGE */}
              {selectedMedia.type === "image" && (

                <img
                  src={selectedMedia.src}
                  alt={selectedMedia.alt}
                  className="max-h-[80vh] w-full object-contain"
                />

              )}

              {/* VIDEO */}
              {selectedMedia.type === "video" && (

                <video
                  src={selectedMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-full object-contain"
                />

              )}

              {/* INFORMATION */}
              <div className="bg-white p-4 text-black">

                {selectedMedia.title && (

                  <h2 className="font-semibold">
                    {selectedMedia.title}
                  </h2>

                )}

                {selectedMedia.date && (

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      selectedMedia.date
                    ).toLocaleDateString()}
                  </p>

                )}

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            HIGHLIGHT MODAL
        ===================================================== */}

        {activeHighlight && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() =>
              setActiveHighlight(null)
            }
          >

            <div
              className="relative flex h-[75vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-black"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* Highlight header */}
              <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4 text-white">

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/10">
                  ✈️
                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    {profile.username}
                  </p>

                  <p className="text-xs opacity-80">
                    {activeHighlight}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setActiveHighlight(null)
                  }
                  className="text-2xl"
                >
                  ×
                </button>

              </div>

              {/* Highlight placeholder */}
              <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-white">

                This is your{" "}
                <strong className="mx-1">
                  {activeHighlight}
                </strong>
                highlight.

                <br />

                We can connect each highlight
                to its own Notion content next.

              </div>

            </div>

          </div>

        )}

      </div>
    </main>
  );
}