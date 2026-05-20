export const getPerkImageUrl = (imagePath: string) => {
  return `/perks/${imagePath.split("/").pop() ?? ""}.png`;
};

const INPUT_LABELS: Record<string, string> = {
  'Input.ActivatableButton1': 'Ability Button 1',
  'Input.ActivatableButton2': 'Ability Button 2',
  'Input.UseItem': 'Use Item',
};

export function resolveDescription(
  description: string,
  tunables: Record<string, number[]> | null,
): string {
  return description
    .replace(/\{Tunable\.[^.}]+\.([^}]+)\}/g, (_match, varName: string) => {
      const key = varName.toLowerCase();
      const values = tunables?.[key];
      if (!values) return varName;
      return values.length === 1 ? String(values[0]) : values.join('/');
    })
    .replace(/\{Keyword\.([^}]+)\}/g, (_match, name: string) =>
      `<span class="keyword">${name}</span>`,
    )
    .replace(/\{(Input\.[^}]+)\}/g, (_match, key: string) =>
      `<kbd>${INPUT_LABELS[key] ?? key}</kbd>`,
    );
}
