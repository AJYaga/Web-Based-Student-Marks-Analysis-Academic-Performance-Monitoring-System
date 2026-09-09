type HighlightMatchProps = {
  text: string
  query: string
}

function escapeRegExp(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  )
}

export function HighlightMatch({
  text,
  query,
}: HighlightMatchProps) {
  const normalizedQuery =
    query.trim()

  if (!normalizedQuery) {
    return <>{text}</>
  }

  const pattern =
    new RegExp(
      `(${escapeRegExp(
        normalizedQuery
      )})`,
      "gi"
    )

  const parts =
    text.split(pattern)

  return (
    <>
      {parts.map(
        (part, index) =>
          part.toLowerCase() ===
          normalizedQuery.toLowerCase() ? (
            <mark
              key={`${part}-${index}`}
              className="rounded bg-primary/20 px-0.5 text-foreground"
            >
              {part}
            </mark>
          ) : (
            <span
              key={`${part}-${index}`}
            >
              {part}
            </span>
          )
      )}
    </>
  )
}