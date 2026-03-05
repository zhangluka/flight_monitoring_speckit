import { test, expect } from "@playwright/test";

test.describe("航班搜索主流程", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("输入条件并提交后，出现结果列表或加载/无结果/错误态", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /国内航班与价格查询/ })
    ).toBeVisible();
    await page.getByPlaceholder("城市或机场").first().fill("北京");
    await page.getByPlaceholder("城市或机场").nth(1).fill("上海");
    await page.locator('input[type="date"]').fill("2025-12-01");
    await page.getByRole("button", { name: "搜索" }).click();
    await expect(
      page.getByText(
        /加载中|暂无符合条件的航班|CA|MU|起飞|到达|请求失败|请补全|不能相同|今日或之后/
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test("必填项未填时提交，显示校验提示", async ({ page }) => {
    await page.getByRole("button", { name: "搜索" }).click();
    await expect(
      page.getByText(/请补全|出发地|目的地|日期|不能相同|今日或之后/)
    ).toBeVisible({ timeout: 3000 });
  });
});
