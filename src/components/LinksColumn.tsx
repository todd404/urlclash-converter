import { useState } from "react";
import {
  Button,
  Textarea,
  Title3,
  Text,
  RadioGroup,
  Radio,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  ClipboardPasteRegular,
  CopyRegular,
  ArrowLeftRegular,
  FolderOpenRegular,
  GlobeRegular,
  ArrowDownloadRegular,
} from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { setParser, type ClashRoutingMode } from "../converter";
import { getPyodide } from "../pyyaml";
import { useIoActions } from "../hooks/useIoActions";
import { UrlBar } from "./UrlBar";
import { EngineSwitcher } from "./EngineSwitcher";

const useStyles = makeStyles({
  column: { display: "flex", flexDirection: "column", gap: "16px" },
  columnHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  controls: { display: "flex", gap: "8px" },
  ioControls: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" },
  textarea: {
    height: "400px",
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontFamily: "monospace",
  },
  options: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    padding: "16px",
  },
  actionButton: { marginTop: "8px" },
});

interface LinksColumnProps {
  value: string;
  onChange: (v: string) => void;
  clashValue: string;
  onConvert: (outputMode: string, routingMode: ClashRoutingMode) => void;
  configType: "clash" | "singbox";
}

export function LinksColumn({ value, onChange, clashValue, onConvert, configType }: LinksColumnProps) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { handleCopy, handlePaste, handleLoadFile, handleFetchUrl, handleDownload } = useIoActions();

  const [copyText, setCopyText] = useState(t("copy"));
  const [pasteText, setPasteText] = useState(t("paste"));
  const [showUrl, setShowUrl] = useState(false);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [usePyYaml, setUsePyYaml] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);
  const [outputMode, setOutputMode] = useState("proxies");
  const [routingMode, setRoutingMode] = useState<ClashRoutingMode>("none");

  const handleEngineChange = async (checked: boolean) => {
    setUsePyYaml(checked);
    setParser(checked ? "py" : "js");
    if (checked) {
      setPyLoading(true);
      try {
        await getPyodide();
      } finally {
        setPyLoading(false);
      }
    }
  };

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <Title3>{t("nodeLinks")}</Title3>
          <Text size={200} style={{ opacity: 0.7 }}>{t("onePerLine")}</Text>
        </div>
        <div className={styles.controls}>
          <Button icon={<ClipboardPasteRegular />} onClick={() => handlePaste(value, onChange, setPasteText)}>{pasteText}</Button>
          <Button icon={<CopyRegular />} appearance="primary" onClick={() => handleCopy(value, setCopyText)}>{copyText}</Button>
        </div>
      </div>

      <div className={styles.ioControls}>
        <Button size="small" appearance="subtle" icon={<FolderOpenRegular />} onClick={() => handleLoadFile(onChange)}>{t("loadFile")}</Button>
        <Button size="small" appearance="subtle" icon={<GlobeRegular />} onClick={() => setShowUrl((v) => !v)}>{t("loadUrl")}</Button>
        <Button size="small" appearance="subtle" icon={<ArrowDownloadRegular />} disabled={!value.trim()} onClick={() => handleDownload(value, "node-links.txt")}>{t("download")}</Button>
      </div>

      {showUrl && (
        <UrlBar
          url={url}
          setUrl={setUrl}
          fetching={fetching}
          onFetch={() => handleFetchUrl(url, onChange, setFetching, setShowUrl, setUrl)}
          onCancel={() => { setShowUrl(false); setUrl(""); }}
        />
      )}

      {configType === "clash" && <EngineSwitcher usePyYaml={usePyYaml} pyLoading={pyLoading} onChange={handleEngineChange} />}

      <Textarea className={styles.textarea} value={value} onChange={(e, data) => onChange(data.value)} placeholder={t("linksPlaceholder")} resize="none" />

      {configType === "clash" && (
        <div className={styles.options}>
          <Text weight="semibold">{t("outputFormat")}</Text>
          <RadioGroup layout="horizontal" value={outputMode} onChange={(e, data) => setOutputMode(data.value)}>
            <Radio value="proxies" label="proxies:" />
            <Radio value="payload" label="payload:" />
            <Radio value="none" label={t("noPrefix")} />
          </RadioGroup>
          <div style={{ marginTop: "16px" }}>
            <Text weight="semibold">{t("routingMode")}</Text>
            <RadioGroup layout="vertical" value={routingMode} onChange={(_, data) => setRoutingMode(data.value as ClashRoutingMode)}>
              <Radio value="none" label={t("routingNone")} />
              <Radio value="bypass-cn" label={t("routingBypassCn")} />
              <Radio value="rule" label={t("routingRule")} />
              <Radio value="global" label={t("routingGlobal")} />
              <Radio value="direct" label={t("routingDirect")} />
            </RadioGroup>
            <Text size={200} style={{ opacity: 0.75 }}>{t("routingHint")}</Text>
          </div>
        </div>
      )}

      <Button className={styles.actionButton} appearance="primary" size="large" icon={<ArrowLeftRegular />} onClick={() => onConvert(outputMode, routingMode)}>
        {configType === "singbox" ? t("linkToSingbox") : t("linkToClash")}
      </Button>
    </div>
  );
}
