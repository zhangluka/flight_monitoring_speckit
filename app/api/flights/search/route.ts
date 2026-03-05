import { NextRequest, NextResponse } from "next/server";
import { validateSearchParams } from "@/lib/validation/search-params";
import type { Flight } from "@/lib/types/flight";

/** 开发阶段 Mock 数据；生产由环境变量切换真实 API，见 research.md / quickstart.md */
function getMockFlights(
  origin: string,
  destination: string,
  date: string
): Flight[] {
  return [
    {
      flightNumber: "CA1234",
      departureTime: `${date}T08:00:00+08:00`,
      arrivalTime: `${date}T10:30:00+08:00`,
      origin,
      destination,
      cabins: [{ name: "经济舱", price: 800 }],
    },
    {
      flightNumber: "MU5678",
      departureTime: `${date}T14:00:00+08:00`,
      arrivalTime: `${date}T16:20:00+08:00`,
      origin,
      destination,
      cabins: [{ name: "经济舱", price: 720 }],
    },
  ];
}

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

  try {
    const flights = getMockFlights(origin, destination, date);
    return NextResponse.json({ flights });
  } catch {
    return NextResponse.json(
      { error: "暂时无法查询航班，请稍后重试", code: "SERVICE_ERROR" },
      { status: 500 }
    );
  }
}
