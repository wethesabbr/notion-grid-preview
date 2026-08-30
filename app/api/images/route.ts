import { NextResponse } from "next/server";

interface NotionFile {
  type: "file" | "external";
  name: string;
  file?: {
    url: string;
    expiry_time?: string;
  };
  external?: {
    url: string;
  };
}

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  date?: string;
  type: "image" | "video";
}

function getMediaType(filename: string): "image" | "video" {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const videoExtensions = [
    "mp4",
    "mov",
    "webm",
    "m4v",
    "avi",
    "mkv",
  ];

  return videoExtensions.includes(extension) ? "video" : "image";
}

export async function GET() {
  try {
    const token = process.env.NOTION_API_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!token || !databaseId) {
      throw new Error("Missing NOTION_API_TOKEN or NOTION_DATABASE_ID");
    }

    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      console.error("Notion API error:", errorData);

      throw new Error(
        `Notion API error: ${response.status} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    const media: GalleryItem[] = [];

    for (const page of data.results) {
      const properties = page.properties || {};

      let title = "Untitled";

      if (
        properties.Name &&
        (properties.Name as any).type === "title" &&
        (properties.Name as any).title?.length
      ) {
        title =
          (properties.Name as any).title[0]?.plain_text || "Untitled";
      }

      for (const [propName, property] of Object.entries(properties)) {
        if ((property as any).type !== "files") {
          continue;
        }

        const files: NotionFile[] = (property as any).files || [];

        for (const file of files) {
          const mediaUrl =
            file.type === "file"
              ? file.file?.url
              : file.external?.url;

          if (!mediaUrl) {
            continue;
          }

          const filename = file.name || "media";
          const type = getMediaType(filename);

          media.push({
            id: `${page.id}-${filename}`,
            src: mediaUrl,
            alt: filename,
            title,
            date: page.created_time,
            type,
          });
        }
      }
    }

    return NextResponse.json(media);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("Error in /api/images:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to fetch media from Notion",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}