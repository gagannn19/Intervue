import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Monaco (the VS Code editor), bundled with the app rather than fetched
// from a CDN, so the interview never depends on a third-party host. This
// module is lazy-loaded (see CodingPanel) — only the interview room's code
// editor downloads it. Monaco >= 0.57 starts its own web workers
// (new Worker(new URL(..., import.meta.url)), which Vite bundles), so no
// MonacoEnvironment setup: JavaScript gets the TypeScript worker
// (autocomplete, diagnostics); Python / Java / C++ get syntax highlighting.
loader.config({ monaco });

monaco.editor.defineTheme("cuecast-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#0D0D0D",
    "editorGutter.background": "#0D0D0D",
    "minimap.background": "#0D0D0D",
    "scrollbarSlider.background": "#FFFFFF14",
    "scrollbarSlider.hoverBackground": "#FFFFFF24",
    "editor.lineHighlightBackground": "#FFFFFF08",
    "editorLineNumber.foreground": "#FFFFFF33",
    "editorLineNumber.activeForeground": "#FFFFFFAA",
    "editorCursor.foreground": "#FF7A00",
    "editor.selectionBackground": "#FF7A0040",
    "editorIndentGuide.background1": "#FFFFFF10",
  },
});

const MONACO_LANGUAGE = { JavaScript: "javascript", Python: "python", Java: "java", "C++": "cpp" };

// `onCursorChange({ line, column, selected })` feeds the panel's status bar.
export default function CodeEditor({ lang, code, onCodeChange, onCursorChange }) {
  const handleMount = (editor) => {
    const report = () => {
      const pos = editor.getPosition();
      const sel = editor.getSelection();
      const selected = sel ? editor.getModel()?.getValueInRange(sel).length ?? 0 : 0;
      if (pos) onCursorChange?.({ line: pos.lineNumber, column: pos.column, selected });
    };
    editor.onDidChangeCursorSelection(report);
    report();
    editor.focus();
  };

  return (
    <Editor
      language={MONACO_LANGUAGE[lang] ?? "plaintext"}
      value={code}
      onChange={(value) => onCodeChange(value ?? "")}
      onMount={handleMount}
      theme="cuecast-dark"
      options={{
        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontLigatures: true,
        fontSize: 13,
        lineHeight: 21,
        minimap: { enabled: true, renderCharacters: false, scale: 1, maxColumn: 80 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: lang === "Python" ? 4 : 2,
        padding: { top: 10, bottom: 10 },
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: "active", indentation: true },
        stickyScroll: { enabled: false },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        overviewRulerBorder: false,
        fixedOverflowWidgets: true,
      }}
    />
  );
}
