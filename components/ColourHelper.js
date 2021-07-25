const ColourHelper = {
  HSLToHex: function (h,s,l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },

  getColourForMode: function (hue, dark, darker, chart) {
    if (chart) {
      return dark
        ? ColourHelper.HSLToHex(hue, 80, 30)
        : ColourHelper.HSLToHex(hue, 70, 70);
    }

    return darker
      ? dark
        ? ColourHelper.HSLToHex(hue, 80, 20)
        : ColourHelper.HSLToHex(hue, 70, 70)
      : dark
        ? ColourHelper.HSLToHex(hue, 80, 20)
        : ColourHelper.HSLToHex(hue, 100, 85);
  }
}

export default ColourHelper;