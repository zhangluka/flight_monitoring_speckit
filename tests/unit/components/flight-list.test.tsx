import React from "react";
import { render, screen } from "@testing-library/react";
import { FlightList } from "@/components/flight-list";
import type { Flight } from "@/lib/types/flight";

const mockFlights: Flight[] = [
  {
    flightNumber: "CA1234",
    departureTime: "2025-03-10T08:00:00+08:00",
    arrivalTime: "2025-03-10T10:30:00+08:00",
    origin: "北京",
    destination: "上海",
    cabins: [{ name: "经济舱", price: 800 }],
  },
];

describe("FlightList", () => {
  it("有数据时渲染航班号、起降时间、舱位与价格", () => {
    render(<FlightList flights={mockFlights} status="idle" />);
    expect(screen.getByText(/CA1234/)).toBeInTheDocument();
    expect(screen.getByText(/北京/)).toBeInTheDocument();
    expect(screen.getByText(/上海/)).toBeInTheDocument();
    expect(screen.getByText(/经济舱/)).toBeInTheDocument();
    expect(screen.getByText(/800|¥800/)).toBeInTheDocument();
  });

  it("空列表时不报错", () => {
    render(<FlightList flights={[]} status="empty" />);
    expect(screen.getByText(/暂无符合条件的航班/)).toBeInTheDocument();
  });

  it("loading 时显示加载中", () => {
    render(<FlightList flights={[]} status="loading" />);
    expect(screen.getByText(/加载中/)).toBeInTheDocument();
  });

  it("error 时显示错误信息", () => {
    render(<FlightList flights={[]} status="error" errorMessage="网络错误" />);
    expect(screen.getByText(/网络错误/)).toBeInTheDocument();
  });
});

describe("FlightList 格式与一致性 (US3)", () => {
  it("价格以人民币格式展示（含 ¥）", () => {
    render(
      <FlightList
        flights={[
          {
            flightNumber: "MU1",
            departureTime: "2025-03-10T08:00:00+08:00",
            arrivalTime: "2025-03-10T10:00:00+08:00",
            origin: "北京",
            destination: "上海",
            cabins: [{ name: "经济舱", price: 999 }],
          },
        ]}
        status="idle"
      />
    );
    expect(screen.getByText(/¥999/)).toBeInTheDocument();
  });

  it("时间以统一格式展示", () => {
    render(
      <FlightList
        flights={[
          {
            flightNumber: "CA1",
            departureTime: "2025-03-10T14:30:00+08:00",
            arrivalTime: "2025-03-10T16:45:00+08:00",
            origin: "上海",
            destination: "北京",
            cabins: [{ name: "经济舱", price: 500 }],
          },
        ]}
        status="idle"
      />
    );
    expect(screen.getByText(/起飞/)).toBeInTheDocument();
    expect(screen.getByText(/到达/)).toBeInTheDocument();
  });
});
