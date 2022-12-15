import { describe, expect, test } from "vitest";

import { flowchart, node } from "./dory";

test("exp", () => {
  const a = node("a");
  const b = node("b");
  const fc = flowchart().link(a, b);

  expect(fc.render()).toBe("flowchart LR\n" + "    a --> b\n");
});

describe("flowchart", () => {
  describe("examples", () => {
    test("empty flowchart", () => {
      const fc = flowchart();
      expect(fc.render()).toBe("flowchart LR\n");
    });
  });

  describe("links", () => {
    test("should link node to self", () => {
      const a = node("a");
      const fc = flowchart().link(a, a);
      expect(fc.render()).toBe("flowchart LR\n" + "    a --> a\n");
    });

    test("should link nodes with text", () => {
      const fc = flowchart().link(node("a"), { text: "nemo" }, node("b"));
      expect(fc.render()).toBe("flowchart LR\n" + "    a --> |nemo| b\n");
    });

    describe("kind", () => {
      test("should link nodes with default style (arrow)", () => {
        const fc = flowchart().link(node("a"), node("b"));
        expect(fc.render()).toBe("flowchart LR\n" + "    a --> b\n");
      });

      test("should link nodes with open style", () => {
        const fc = flowchart().link(node("a"), { kind: "---" }, node("b"));
        expect(fc.render()).toBe("flowchart LR\n" + "    a --- b\n");
      });

      test("should link nodes with invisible style", () => {
        const fc = flowchart().link(node("a"), { kind: "~~~" }, node("b"));
        expect(fc.render()).toBe("flowchart LR\n" + "    a ~~~ b\n");
      });

      test("should link nodes with dotted style", () => {
        const fc = flowchart().link(node("a"), { kind: "-.-" }, node("b"));
        expect(fc.render()).toBe("flowchart LR\n" + "    a -.- b\n");
      });

      test("should link nodes with dotted style", () => {
        const fc = flowchart().link(node("a"), { kind: "==>" }, node("b"));
        expect(fc.render()).toBe("flowchart LR\n" + "    a ==> b\n");
      });
    });
  });
});
