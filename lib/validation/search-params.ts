/** 校验结果 */
export interface SearchParamsValidation {
  valid: boolean;
  error?: string;
}

/**
 * 校验搜索参数：必填、出发地≠目的地、日期≥今日
 */
export function validateSearchParams(params: {
  origin?: string;
  destination?: string;
  date?: string;
}): SearchParamsValidation {
  const { origin, destination, date } = params;
  const trimmedOrigin = typeof origin === "string" ? origin.trim() : "";
  const trimmedDest = typeof destination === "string" ? destination.trim() : "";
  const trimmedDate = typeof date === "string" ? date.trim() : "";

  if (!trimmedOrigin || !trimmedDest || !trimmedDate) {
    return { valid: false, error: "请补全出发地、目的地与出行日期" };
  }
  if (trimmedOrigin === trimmedDest) {
    return { valid: false, error: "出发地与目的地不能相同" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsed = new Date(trimmedDate);
  if (isNaN(parsed.getTime()) || parsed < today) {
    return { valid: false, error: "请选择今日或之后的日期" };
  }
  return { valid: true };
}
