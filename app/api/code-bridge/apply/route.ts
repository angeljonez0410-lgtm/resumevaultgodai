import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";

function runGitApply(args: string[], patch: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `git apply exited with code ${code}`));
    });

    child.stdin.end(patch);
  });
}

function isLocalRequest(req: NextRequest) {
  const hostname = req.nextUrl.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Code bridge is only available in development" }, { status: 403 });
    }

    if (!isLocalRequest(req)) {
      return NextResponse.json({ error: "Code bridge is local only" }, { status: 403 });
    }

    const expectedSecret = process.env.CODE_BRIDGE_SECRET;
    const providedSecret = req.headers.get("x-code-bridge-secret") || "";

    if (expectedSecret && providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid code bridge secret" }, { status: 401 });
    }

    const body = await req.json();
    const patch = typeof body.patch === "string" ? body.patch : "";

    if (!patch.trim()) {
      return NextResponse.json({ error: "Patch is required" }, { status: 400 });
    }

    await runGitApply(["apply", "--whitespace=nowarn", "--recount", "--check", "-"], patch);
    const applied = await runGitApply(["apply", "--whitespace=nowarn", "--recount", "-"], patch);

    return NextResponse.json({
      success: true,
      stdout: applied.stdout,
      stderr: applied.stderr,
      message: "Patch applied locally",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply patch" },
      { status: 500 }
    );
  }
}
