# Mermaid TS

## Examples

Minimal

```typescript
flowchart()
  .link("hello", "world")
  .render()
```

```mermaid
flowchart LR
    hello --> world
```

Complex links

```typescript
const a = node("fish")
const b = node("are")
const c = node("friends")

flowchart({ direction: 'TD' })
  .link(a, b, [a, c])
  .link(c, a)
  .render()
```

```mermaid
flowchart TD
    fish --> are --> fish & friends
    friends --> fish
```

More options

```typescript
flowchart({ direction: 'LR' })
  .link(
    "a",
    { kind:'-.-', text: 'd' },
    ["b", "c"],
    {},
    ["d", "e"],
  )
  .render()
```

```mermaid
flowchart LR
    a -.- |d| b & c --> d & e
```

Flowchart TODO
- Shapes
- Node text (not id) & escaping
- The rest of the link syntax options
- Link lengths
- Subgraphs
- Styling

Other TODO
- sequence diagrams
- others
