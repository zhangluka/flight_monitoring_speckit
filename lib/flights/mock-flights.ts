import type { Flight } from "@/lib/types/flight";

/** 内存 mock 数据源；供 BFF 在 mode=mock 或配置缺失时使用。 */
export function getMockFlights(
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
