import { getDataSourceConfig } from "@/lib/flights/data-source-config";

describe("getDataSourceConfig", () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it("未设置 FLIGHT_DATA_SOURCE 时返回 mode mock", () => {
    delete process.env.FLIGHT_DATA_SOURCE;
    delete process.env.FLIGHT_API_BASE_URL;
    delete process.env.FLIGHT_API_KEY;
    const config = getDataSourceConfig();
    expect(config.mode).toBe("mock");
    expect(config.baseUrl).toBeUndefined();
    expect(config.apiKey).toBeUndefined();
  });

  it("FLIGHT_DATA_SOURCE=mock 时返回 mode mock", () => {
    process.env.FLIGHT_DATA_SOURCE = "mock";
    process.env.FLIGHT_API_BASE_URL = "https://api.example.com";
    const config = getDataSourceConfig();
    expect(config.mode).toBe("mock");
  });

  it("FLIGHT_DATA_SOURCE=real 且 BASE_URL 有效时返回 mode real 与 baseUrl", () => {
    process.env.FLIGHT_DATA_SOURCE = "real";
    process.env.FLIGHT_API_BASE_URL = "https://api.example.com";
    process.env.FLIGHT_API_KEY = "key123";
    const config = getDataSourceConfig();
    expect(config.mode).toBe("real");
    expect(config.baseUrl).toBe("https://api.example.com");
    expect(config.apiKey).toBe("key123");
  });

  it("FLIGHT_DATA_SOURCE=real 但 BASE_URL 为空时回退 mode mock", () => {
    process.env.FLIGHT_DATA_SOURCE = "real";
    process.env.FLIGHT_API_BASE_URL = "";
    process.env.FLIGHT_API_KEY = "key123";
    const config = getDataSourceConfig();
    expect(config.mode).toBe("mock");
  });

  it("FLIGHT_DATA_SOURCE 无效值时视为 mock", () => {
    process.env.FLIGHT_DATA_SOURCE = "invalid";
    process.env.FLIGHT_API_BASE_URL = "https://api.example.com";
    const config = getDataSourceConfig();
    expect(config.mode).toBe("mock");
  });

  it("baseUrl 末尾斜杠被去除", () => {
    process.env.FLIGHT_DATA_SOURCE = "real";
    process.env.FLIGHT_API_BASE_URL = "https://api.example.com/";
    const config = getDataSourceConfig();
    expect(config.mode).toBe("real");
    expect(config.baseUrl).toBe("https://api.example.com");
  });
});
