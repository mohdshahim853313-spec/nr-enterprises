import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const EXPORT_MAP: Record<string, { filename: string; exportName: string; title: string }> = {
  home: {
    filename: "home.ts",
    exportName: "homeContent",
    title: "NR Enterprises Home Page Content Configuration",
  },
  collections: {
    filename: "collections.ts",
    exportName: "collectionsContent",
    title: "NR Enterprises Collections Catalog Content Configuration",
  },
  legacy: {
    filename: "legacy.ts",
    exportName: "legacyContent",
    title: "NR Enterprises Our Legacy Content Configuration",
  },
  about: {
    filename: "about.ts",
    exportName: "aboutContent",
    title: "NR Enterprises About Us Content Configuration",
  },
  contact: {
    filename: "contact.ts",
    exportName: "contactContent",
    title: "NR Enterprises Contact Page Content Configuration",
  },
};

export async function POST(req: Request) {
  try {
    const { pageId, data } = await req.json();

    if (!pageId || !EXPORT_MAP[pageId]) {
      return NextResponse.json(
        { success: false, error: `Invalid pageId: ${pageId}` },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid data payload" },
        { status: 400 }
      );
    }

    const config = EXPORT_MAP[pageId];
    const targetFilePath = path.join(process.cwd(), "lib", "siteContent", config.filename);

    // Format data into clean JavaScript / TypeScript object
    const formattedJson = JSON.stringify(data, null, 2);

    const fileContent = `/**
 * 🌟 ${config.title}
 * 
 * Auto-synced from Admin Panel (/admin/content).
 * Aap is file ke andar direct edit bhi kar sakte hain ya Admin se sync kar sakte hain.
 * Last updated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
 */

export const ${config.exportName} = ${formattedJson};
`;

    await fs.promises.writeFile(targetFilePath, fileContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: `Successfully saved to lib/siteContent/${config.filename}`,
      filePath: `lib/siteContent/${config.filename}`,
    });
  } catch (error: any) {
    console.error("Error saving to codebase:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to write to codebase file" },
      { status: 500 }
    );
  }
}
