/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

type Params = Record<string, any>;

// 日期格式化
export function parseTime(
  time: string | number | Date,
  pattern?: string
): string | null {
  if (!time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date: Date;

  if (time instanceof Date) {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d{3}/g, "");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }

  const formatObj: { [key: string]: number | string } = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };

  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    if (key === "a")
      return ["日", "一", "二", "三", "四", "五", "六"][value as number];
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value.toString() || "0";
  });
  return timeStr;
}

export function parseTimeNew(time: string | number | Date) {
  if (!time) {
    return null;
  }

  let date: Date;

  if (time instanceof Date) {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d{3}/g, "");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const now = new Date();
  const timeDiff = now.getTime() - date.getTime(); // 时间差（以毫秒为单位）

  const oneSecond = 1000; // 一秒的毫秒数
  const oneMinute = 60 * oneSecond; // 一分钟的毫秒数
  const oneHour = 60 * oneMinute; // 一小时的毫秒数
  const oneDay = 24 * oneHour; // 一天的毫秒数

  const secondsDiff = Math.floor(timeDiff / oneSecond); // 秒差
  const minutesDiff = Math.floor(timeDiff / oneMinute); // 分钟差
  const hoursDiff = Math.floor(timeDiff / oneHour); // 小时差
  const daysDiff = Math.floor(timeDiff / oneDay); // 天数差

  if (secondsDiff <= 0) {
    return `刚刚`;
  }
  // 时间差在1分钟以内，显示多少秒前
  if (secondsDiff < 60) {
    return `${secondsDiff}秒前`;
  }
  // 时间差在1小时以内，显示多少分钟前
  if (minutesDiff < 60) {
    return `${minutesDiff}分钟前`;
  }
  // 时间差在1天以内，显示多少小时前
  if (daysDiff === 0) {
    return `${hoursDiff}小时前`;
  }

  // 格式化小时和分钟
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // 时间差是1天，显示昨天 + 小时:分钟
  if (daysDiff === 1) {
    return `昨天 ${hours}:${minutes}`;
  }
  // 时间差是2天，显示前天 + 小时:分钟
  if (daysDiff === 2) {
    return `前天 ${hours}:${minutes}`;
  }

  // 超过2天，显示具体日期 + 小时:分钟
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以加1
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 添加日期范围
export function addDateRange(
  params: Params,
  dateRange: [string, string],
  propName?: string
): Params {
  const search = { ...params };
  search.params =
    typeof search.params === "object" &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {};

  if (!propName) {
    search.params["beginTime"] = dateRange[0];
    search.params["endTime"] = dateRange[1];
  } else {
    search.params["begin" + propName] = dateRange[0];
    search.params["end" + propName] = dateRange[1];
  }

  return search;
}

// 回显数据字典
export function selectDictLabel(
  datas: { value: any; label: string }[],
  value: any
): string {
  if (value === undefined) return "";
  const action = datas.find((data) => data.value === String(value));
  return action ? action.label : String(value);
}

// 回显数据字典（字符串数组）
export function selectDictLabels(
  datas: { value: any; label: string }[],
  value: string | string[],
  separator = ","
): string {
  if (!value || value.length === 0) return "";

  const values = Array.isArray(value) ? value.join(",") : value;
  const temp = values.split(separator);

  const actions = temp.map((val) => {
    const match = datas.find((data) => data.value === String(val));
    return match ? match.label : val;
  });

  return actions.join(separator);
}

// 字符串格式化(%s )
export function sprintf(str: string, ...args: any[]): string {
  let i = 0;
  return str.replace(/%s/g, () =>
    typeof args[i] !== "undefined" ? args[i++] : ""
  );
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str: any): string {
  return !str || str === "undefined" || str === "null" ? "" : String(str);
}

// 数据合并
export function mergeRecursive(source: Params, target: Params): Params {
  for (const p in target) {
    try {
      if (target[p].constructor === Object) {
        source[p] = mergeRecursive(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (e) {
      source[p] = target[p];
    }
  }
  return source;
}

// 构造树型结构数据
export function handleTree(
  data: Params[],
  id = "id",
  parentId = "parentId",
  children = "children"
): Params[] {
  const config = { id, parentId, childrenList: children };

  const childrenListMap: { [key: string]: Params[] } = {};
  const nodeIds: { [key: string]: Params } = {};
  const tree: Params[] = [];

  data.forEach((d) => {
    const pid = d[config.parentId];
    if (!childrenListMap[pid]) {
      childrenListMap[pid] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[pid].push(d);
  });

  data.forEach((d) => {
    const pid = d[config.parentId];
    if (!nodeIds[pid]) {
      tree.push(d);
    }
  });

  tree.forEach((t) => adaptToChildrenList(t));

  function adaptToChildrenList(o: Params) {
    if (childrenListMap[o[config.id]]) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      o[config.childrenList].forEach((child: Params) =>
        adaptToChildrenList(child)
      );
    }
  }

  return tree;
}

// 参数处理
export function tansParams(params: Params): string {
  let result = "";
  Object.keys(params).forEach((propName) => {
    const value = params[propName];
    const part = encodeURIComponent(propName) + "=";

    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        Object.keys(value).forEach((key) => {
          if (
            value[key] !== null &&
            value[key] !== "" &&
            typeof value[key] !== "undefined"
          ) {
            const paramKey = `${propName}[${key}]`;
            result += `${encodeURIComponent(paramKey)}=${encodeURIComponent(
              value[key]
            )}&`;
          }
        });
      } else {
        result += `${part}${encodeURIComponent(value)}&`;
      }
    }
  });
  return result;
}

// 返回项目路径
export function getNormalPath(p: string): string {
  if (!p || p === "undefined") return "";
  let res = p.replace("//", "/");
  if (res[res.length - 1] === "/") {
    res = res.slice(0, res.length - 1);
  }
  return res;
}

// 验证是否为blob格式
export function blobValidate(data: Blob): boolean {
  return data.type !== "application/json";
}

export function generateDateTree(startTime, endTime) {
  const result = [];

  const startYear = startTime.getFullYear();
  const endYear = endTime.getFullYear();

  // 预生成完整的小时和分钟节点
  const fullHourMinuteNodes = generateHourMinuteNodes(0, 23, 0, 59);

  // 生成小时和分钟节点
  function generateHourMinuteNodes(startHour, endHour, startMinute, endMinute) {
    const hours = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const hourNode = {
        text: `${String(hour).padStart(2, "0")}时`,
        value: hour,
        children: [],
      };

      for (
        let minute = hour === startHour ? startMinute : 0;
        minute <= (hour === endHour ? endMinute : 59);
        minute++
      ) {
        const minuteNode = {
          text: `${String(minute).padStart(2, "0")}分`,
          value: minute,
        };
        hourNode.children.push(minuteNode);
      }

      hours.push(hourNode);
    }
    return hours;
  }

  // 生成某一天的节点
  const generateDayNode = (year, month, day, hourNodes) => {
    return {
      text: `${String(day).padStart(2, "0")}日`,
      value: day,
      children: hourNodes,
    };
  };

  // 处理部分年份（月/日/小时/分钟范围）
  const handlePartialYear = (
    year,
    startMonth,
    endMonth,
    startDay,
    endDay,
    startHour,
    endHour,
    startMinute,
    endMinute
  ) => {
    const yearNode = {
      text: `${year}年`,
      value: year,
      children: [],
    };

    for (let month = startMonth; month <= endMonth; month++) {
      const monthNode = {
        text: `${String(month).padStart(2, "0")}月`,
        value: month,
        children: [],
      };

      const daysInMonth = new Date(year, month, 0).getDate();
      const minDay = month === startMonth ? startDay : 1;
      const maxDay = month === endMonth ? endDay : daysInMonth;

      for (let day = minDay; day <= maxDay; day++) {
        let hourNodes;
        // 如果是开始的那一天，处理小时和分钟范围
        if (month === startMonth && day === startDay) {
          hourNodes = generateHourMinuteNodes(startHour, 23, startMinute, 59);
        }
        // 如果是结束的那一天，处理小时和分钟范围
        else if (month === endMonth && day === endDay) {
          hourNodes = generateHourMinuteNodes(0, endHour, 0, endMinute);
        } else {
          // 对于其他日子，使用完整的小时和分钟
          hourNodes = fullHourMinuteNodes;
        }

        const dayNode = generateDayNode(year, month, day, hourNodes);
        monthNode.children.push(dayNode);
      }

      yearNode.children.push(monthNode);
    }

    return yearNode;
  };

  // 处理完整的年份
  const handleCompleteYear = (year) => {
    return handlePartialYear(
      year,
      1,
      12,
      1,
      new Date(year, 12, 0).getDate(),
      0,
      23,
      0,
      59
    );
  };

  // 如果开始和结束在同一年
  if (startYear === endYear) {
    result.push(
      handlePartialYear(
        startYear,
        startTime.getMonth() + 1,
        endTime.getMonth() + 1,
        startTime.getDate(),
        endTime.getDate(),
        startTime.getHours(),
        endTime.getHours(),
        startTime.getMinutes(),
        endTime.getMinutes()
      )
    );
  } else {
    // 处理起始年份
    result.push(
      handlePartialYear(
        startYear,
        startTime.getMonth() + 1,
        12,
        startTime.getDate(),
        new Date(startYear, startTime.getMonth() + 1, 0).getDate(),
        startTime.getHours(),
        23,
        startTime.getMinutes(),
        59
      )
    );

    // 处理完整的中间年份
    for (let year = startYear + 1; year < endYear; year++) {
      result.push(handleCompleteYear(year));
    }

    // 处理结束年份
    result.push(
      handlePartialYear(
        endYear,
        1,
        endTime.getMonth() + 1,
        1,
        endTime.getDate(),
        0,
        endTime.getHours(),
        0,
        endTime.getMinutes()
      )
    );
  }

  return result;
}

/**
 * 计算两个时间的间隔
 * @param {Date|string|number} startTime 开始时间
 * @param {Date|string|number} endTime 结束时间
 * @returns {string} 时间间隔描述
 */
export function getTimeInterval(startTime, endTime) {
  // 转换为Date对象
  const start = new Date(startTime);
  const end = new Date(endTime);

  // 计算时间差(毫秒)
  const diff = end.getTime() - start.getTime();

  // 转换为秒
  const seconds = Math.floor(diff / 1000);

  // 小于1分钟，返回秒数
  if (seconds < 60) {
    return `${seconds}秒`;
  }

  // 小于1小时，返回分钟和秒
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    return `${minutes}分${remainSeconds}秒`;
  }

  // 小于1天，返回时分秒
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainSeconds = seconds % 60;
    return `${hours}时${minutes}分${remainSeconds}秒`;
  }

  return "大于1天";
}
