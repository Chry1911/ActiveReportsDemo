import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { promises as fs } from "fs";
import { join } from "path";

const baseDir = process.env.REPORTS_DIR || "";

const isValid = (name: string) => {
  const lower = name.toLowerCase();
  return lower.endsWith(".rdlx-json");
};

export async function GET() {
  try {
    const dir = baseDir || process.env.REPORTS_DIR || "";
    if (!dir) return NextResponse.json([], { status: 200 });
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) return NextResponse.json([], { status: 200 });
    const files = await fs.readdir(dir, { withFileTypes: true });
    const list = files
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => isValid(name))
      .map((name) => ({ name }));
    return NextResponse.json(list, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
