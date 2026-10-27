import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json({ success: true, data: null });
  }
}
