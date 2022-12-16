import { createSignal, onMount } from "solid-js";
import * as monaco from "monaco-editor";

export const App = () => {
  let iframeRef: any;
  const [mermaid, setMermaid] = createSignal("");

  // validation settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  // compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
  });

  const doryLibSrc = `declare class MNode {
    id: string;
    text: string | undefined;
    shape: NodeShape | undefined;
    constructor(id: string, text: string | undefined, shape: NodeShape | undefined);
}
type NodeShape = "()" | "([])" | "[[]]" | "[()]" | "(())" | ">]" | "{}" | "{{}}" | "[//]" | "[\\\\]";
 declare function node(id: string, options?: string | {
    text?: string;
    shape?: NodeShape;
}): MNode;
 type LinkKind = "-->" | "---" | "~~~" | "-.-" | "-.->" | "==>";
 type LinkOptions = {
    text?: string;
    kind?: LinkKind;
};
 type FlowchartDirection = "LR" | "RL" | "TB" | "TD" | "BT";
 type FlowchartOptions = {
    direction?: FlowchartDirection;
};
declare class Flowchart {
    direction: FlowchartDirection;
    lines: (MNode | MNode[] | LinkOptions | string)[][];
    constructor(options?: FlowchartOptions);
    link(...sections: (MNode | MNode[] | LinkOptions | string)[]): this;
    render(): string;
}
 declare function flowchart(options?: FlowchartOptions): Flowchart;
`;
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    doryLibSrc,
    "ts:filename/dory.d.ts"
  );
  monaco.editor.createModel(
    doryLibSrc,
    "typescript",
    monaco.Uri.parse("ts:filename/dory.d.ts")
  );

  onMount(() => {
    const f = iframeRef as HTMLIFrameElement;
    f.addEventListener("load", () => {
      f.contentDocument.body.innerHTML = `
      <style>
        html {width: 100%;height: 100%; background: #1e1e1e }
        body {width: 100%;height: 100%; margin: 0}
        .bag {width:100%;height:100%;display:flex;flex-direction:column}
        pre.mermaid {width: 100%;height:100% }
        svg {width: 100%;height: 100%; max-width: unset !important; }
      </style>
        <pre class="mermaid">${mermaid()}</pre>
      `;
      const s = f.contentDocument.createElement("script");
      s.innerHTML = `
import mermaid from 'https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs';
mermaid.initialize({
  securityLevel: 'loose',
  theme: 'dark',
});
mermaid.init({theme:'dark'}, '.mermaid')
`;
      s.type = "module";
      f.contentDocument.head.append(s);
    });
  });

  const handleEditorChange = (value: string) => {
    try {
      const res = eval(dorySrc + value);
      if (typeof res === "string" && res.startsWith("flowchart")) {
        // don't need to re-do if nothing changed
        if (res === mermaid()) return;

        console.log(res);

        setMermaid(res);

        // this could be a better reload by triggering a function...
        (iframeRef as HTMLIFrameElement).contentWindow?.location?.reload();
      }
    } catch (e) {
      console.warn("failed to eval", e);
    }
  };

  return (
    <div style="width:100%;height:100%;display:flex">
      <div style="width:50%;height:100%">
        <Editor onChange={handleEditorChange} />
      </div>
      <div style="width:50%;height:100%">
        <iframe
          style="width:100%;height:100%;background: white;border: 0;"
          ref={iframeRef}
        ></iframe>
      </div>
    </div>
  );
};

const Editor = (p: { onChange: (value: string) => void }) => {
  let editorRef: any;

  let e: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    e = monaco.editor.create(editorRef, {
      value: `const a = node("fish")
const b = node("are")
const c = node("friends")
const d = node("not")
const e = node("food")

flowchart({ direction: 'TB' /* 'LR' */ })
  // Hello world
  .link(
    node("hello"),
    { kind: '==>' },
    node("world"),
    { text: "from", kind: '-.-' },
    node("dory")
  )
  // Fish are friends
  .link(
    a,
    [b, c],
    { kind: '-.->' },
    [d, e]
  )
  .render();
`,
      language: "javascript",
      theme: "vs-dark",
      fontSize: 18,
      lineNumbers: "off",
      minimap: { enabled: false },
      bracketPairColorization: { enabled: true },
    });

    const value = e.getModel()?.getValue();
    if (value) p.onChange(value);

    e.onDidChangeModelContent(() => {
      const value = e.getModel()?.getValue();
      if (value) p.onChange(value);
    });
  });

  return (
    <div style="width:100%;height:100%">
      <div style="width:100%;height:100%" ref={editorRef} />
    </div>
  );
};

const dorySrc = `
class MNode {
  id;
  text;
  constructor(id, text) {
      this.id = id;
      this.text = text;
  }
}
function node(id, text) {
  return new MNode(id, text);
}
class Flowchart {
  // nodes: Set<MNode> = new Set();
  direction = "LR";
  lines = [];
  constructor(options) {
      if (options === undefined)
          return;
      if (options.direction)
          this.direction = options.direction;
  }
  link(...sections) {
      this.lines.push(sections);
      return this;
  }
  render() {
      let o = '';
      let prefix = "    ";
      o += "flowchart " + this.direction + "\\n";
      for (let li = 0; li < this.lines.length; li += 1) {
          const line = this.lines[li];
          let options = {};
          o += prefix;
          let hasRenderedSection = false;
          let sectionNodes = [];
          for (let si = 0; si < line.length; si += 1) {
              const section = line[si];
              if (section instanceof MNode) {
                  sectionNodes.length = 1;
                  sectionNodes[0] = section;
              }
              else if (section instanceof Array) {
                  const nodes = [];
                  for (let ni = 0; ni < section.length; ni++) {
                      const n = section[ni];
                      if (typeof n === 'string') {
                          nodes.push(node(n));
                      }
                      else {
                          nodes.push(n);
                      }
                  }
                  sectionNodes = nodes;
              }
              else if (typeof section === 'string') {
                  sectionNodes.length = 1;
                  sectionNodes[0] = node(section);
              }
              else {
                  options = section;
                  continue;
              }
              if (hasRenderedSection) {
                  o += ' ' + (options.kind || '-->') + ' ';
                  if (options.text)
                      o += '|' + options.text + '| ';
              }
              for (let ni = 0; ni < sectionNodes.length; ni++) {
                  const n = sectionNodes[ni];
                  if (ni > 0)
                      o += ' & ';
                  o += n.id;
              }
              hasRenderedSection = true;
          }
          o += "\\n";
      }
      return o;
  }
}
function flowchart(options) {
  return new Flowchart(options);
}

`;
