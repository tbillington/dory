class MNode {
    constructor(public id: string, public text: string | undefined, public shape: NodeShape | undefined) { }
}

// todo export constants for these for convenience
type NodeShape = "()" | "([])" | "[[]]" | "[()]" | "(())" | ">]" | "{}" | "{{}}" | "[//]" | "[\\\\]";

export function node(id: string, options?: string | { text?: string; shape?: NodeShape }): MNode {
    return typeof options === 'string' ? new MNode(id, options, undefined) :
        new MNode(id, options?.text, options?.shape)
}

export type LinkKind = "-->" | "---" | "~~~" | "-.-" | "-.->" | "==>";

export type LinkOptions = {
    text?: string;
    kind?: LinkKind;
}

export type FlowchartDirection = "LR" | "RL" | "TB" | "TD" | "BT";

export type FlowchartOptions = { direction?: FlowchartDirection }

class Flowchart {
    // nodes: Set<MNode> = new Set();
    direction: FlowchartDirection = "LR";

    lines: (MNode | MNode[] | LinkOptions | string)[][] = [];

    constructor(options?: FlowchartOptions) {
        if (options === undefined) return;

        if (options.direction) this.direction = options.direction

    }

    link(...sections: (MNode | MNode[] | LinkOptions | string)[]): this {
        // TODO: validate arrays are non-empty
        this.lines.push(sections);
        return this;
    }

    render(): string {
        let o = ''
        let prefix = "    ";
        o += "flowchart " + this.direction + "\n";

        const seenNodes = new Set<string>();

        for (let li = 0; li < this.lines.length; li += 1) {
            const line = this.lines[li];

            let options: LinkOptions = {}
            o += prefix;

            let hasRenderedSection = false;

            let sectionNodes: MNode[] = [];

            for (let si = 0; si < line.length; si += 1) {
                const section = line[si];


                if (section instanceof MNode) {
                    sectionNodes.length = 1;
                    sectionNodes[0] = section;
                } else if (section instanceof Array) {
                    const nodes: MNode[] = [];
                    for (let ni = 0; ni < section.length; ni++) {
                        const n = section[ni];
                        if (typeof n === 'string') {
                            nodes.push(node(n))
                        } else {
                            nodes.push(n);
                        }
                    }
                    sectionNodes = nodes;
                } else if (typeof section === 'string') {
                    sectionNodes.length = 1;
                    sectionNodes[0] = node(section)
                } else {
                    options = section;
                    continue;
                }

                if (hasRenderedSection) {
                    o += ' ' + (options.kind || '-->') + ' '
                    if (options.text) o += '|' + options.text + '| '
                }


                for (let ni = 0; ni < sectionNodes.length; ni++) {
                    const n = sectionNodes[ni];

                    if (ni > 0) o += ' & '

                    o += n.id
                }

                hasRenderedSection = true;

            }

            o += "\n"
        }

        return o;
    }
}

export function flowchart(options?: FlowchartOptions): Flowchart {
    return new Flowchart(options);
}
