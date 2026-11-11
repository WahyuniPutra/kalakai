function rgb(hex: string): number[] {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "183b32";
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
}

function luminance(hex: string) {
  const channels = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground: string, background: string) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function mixColor(color: string, target: string, amount: number) {
  const destination = rgb(target);
  return "#" + rgb(color).map((channel, index) =>
    Math.round(channel + (destination[index] - channel) * amount).toString(16).padStart(2, "0"),
  ).join("");
}

export function readableColor(preferred: string, backgrounds: string[], minimum = 4.5) {
  const score = (color: string) => Math.min(...backgrounds.map((background) => contrastRatio(color, background)));
  if (score(preferred) >= minimum) return preferred;
  const target = score("#ffffff") >= score("#000000") ? "#ffffff" : "#000000";
  for (let step = 1; step <= 20; step++) {
    const candidate = mixColor(preferred, target, step / 20);
    if (score(candidate) >= minimum) return candidate;
  }
  return target;
}
