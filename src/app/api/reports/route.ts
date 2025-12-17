import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { promises as fs } from "fs";
import { join } from "path";

const baseDir = process.env.REPORTS_DIR || "";

const isValid = (name: string) =>
  /^[a-zA-Z0-9._-]+\.rdlx-json$/.test(name);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name") || "";
    if (!isValid(name)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const dir = baseDir || process.env.REPORTS_DIR || "";
    if (!dir) return NextResponse.json({ error: "dir_missing" }, { status: 500 });
    const p = join(dir, name);
    const content = await fs.readFile(p, "utf8");
    const json = JSON.parse(content);
    return NextResponse.json(json, { status: 200 });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "");
    const content = String(body.content || "");
    if (!isValid(name)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const dir = baseDir || process.env.REPORTS_DIR || "";
    if (!dir) return NextResponse.json({ error: "dir_missing" }, { status: 500 });
    const p = join(dir, name);
    await fs.writeFile(p, content, "utf8");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
