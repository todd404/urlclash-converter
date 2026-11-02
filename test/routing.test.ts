import { describe, expect, test } from "bun:test";
import { linkToClash } from "../src/converter";
import { parseJsYaml } from "../src/jsyaml";

const sampleLink = "ss://YWVzLTI1Ni1nY206cGFzcw@1.2.3.4:8388#Test";

describe("Clash routing presets", () => {
  test("keeps the legacy output by default", () => {
    const result = linkToClash([sampleLink]);
    expect(result.success).toBe(true);
    expect(result.data.startsWith("proxies:")).toBe(true);
    expect(result.data.includes("proxy-groups:")).toBe(false);
  });

  test("generates China bypass rules and selectable proxy groups", () => {
    const result = linkToClash([sampleLink], "proxies", "bypass-cn");
    expect(result.success).toBe(true);
    const config = parseJsYaml(result.data);
    expect(config.proxies).toHaveLength(1);
    expect(config["proxy-groups"].map((group: any) => group.name)).toContain("🚀 节点选择");
    expect(config.rules).toContain("GEOSITE,CN,DIRECT");
    expect(config.rules).toContain("GEOIP,CN,DIRECT,no-resolve");
    expect(config.rules.at(-1)).toBe("MATCH,🚀 节点选择");
  });

  test("generates global proxy and direct modes", () => {
    const proxy = parseJsYaml(linkToClash([sampleLink], "proxies", "global").data);
    expect(proxy.rules).toEqual(["MATCH,🚀 节点选择"]);
    const direct = parseJsYaml(linkToClash([sampleLink], "proxies", "direct").data);
    expect(direct.rules).toEqual(["MATCH,DIRECT"]);
    expect(direct["proxy-groups"]).toBeUndefined();
  });

  test("makes duplicate proxy names unique", () => {
    const result = linkToClash([sampleLink, sampleLink], "proxies", "bypass-cn");
    const config = parseJsYaml(result.data);
    expect(config.proxies.map((proxy: any) => proxy.name)).toEqual(["Test", "Test (2)"]);
  });
});
