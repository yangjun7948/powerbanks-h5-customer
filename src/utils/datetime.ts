/**
 * 将服务端 UTC 时间字符串解析为本地 Date 对象。
 * 服务端返回格式 "2026-03-01 14:31:30"（无时区标记），
 * 直接 new Date() 会被 JS 解析为本地时间，需补 Z 强制识别为 UTC，
 * 之后 getHours() 等方法会自动转换为客户端本地时区。
 */
export const parseUtcDate = (dateStr: string | Date): Date => {
  if (dateStr instanceof Date) return dateStr;
  // 已含 T 或 Z 的标准格式直接解析
  if (dateStr.includes("T") || dateStr.endsWith("Z")) {
    return new Date(dateStr);
  }
  // "2026-03-01 14:31:30" → "2026-03-01T14:31:30Z"
  return new Date(dateStr.replace(" ", "T") + "Z");
};

/**
 * 将 UTC 时间字符串格式化为本地时区的 "YYYY-MM-DD HH:mm:ss"。
 */
export const formatUtcToLocal = (
  dateTime: string | Date | null | undefined,
  withSeconds = true,
  fallback = "--"
): string => {
  if (!dateTime) return fallback;
  const date = parseUtcDate(dateTime as string | Date);
  if (isNaN(date.getTime())) return fallback;

  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");

  return withSeconds
    ? `${y}-${mo}-${d} ${h}:${mi}:${s}`
    : `${y}-${mo}-${d} ${h}:${mi}`;
};
