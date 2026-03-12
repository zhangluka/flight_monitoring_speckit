import { NextRequest, NextResponse } from "next/server";
import { validateSearchParams } from "@/lib/validation/search-params";
import { getDataSourceConfig } from "@/lib/flights/data-source-config";
import { getFlightsForSearch } from "@/lib/flights";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const date = searchParams.get("date") ?? "";

  const validation = validateSearchParams({ origin, destination, date });
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const config = getDataSourceConfig();

  try {
    const flights = await getFlightsForSearch(origin, destination, date);
    return NextResponse.json({ flights });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "暂时无法查询航班，请稍后重试";
    if (config.mode === "real") {
      console.warn("[flight-search]", "真实接口请求失败", {
        errorType: err instanceof Error ? err.name : "unknown",
        origin,
        destination,
        date,
      });
    }
    return NextResponse.json(
      { error: message, code: "SERVICE_ERROR" },
      { status: 500 }
    );
  }
}
