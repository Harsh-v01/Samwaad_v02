export async function translateText(
  text,
  fromLanguage,
  toLanguage
) {
  if (!text) {
    return ''
  }

  if (fromLanguage === toLanguage) {
    return text
  }

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    `&sl=${encodeURIComponent(fromLanguage)}` +
    `&tl=${encodeURIComponent(toLanguage)}` +
    '&dt=t' +
    `&q=${encodeURIComponent(text)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Translation failed: ${response.status}`
    )
  }

  const result = await response.json()

  if (!result?.[0]) {
    throw new Error(
      'Unexpected translation response.'
    )
  }

  return (
    result[0]
      .map((item) => item?.[0])
      .filter(Boolean)
      .join('') || text
  )
}
