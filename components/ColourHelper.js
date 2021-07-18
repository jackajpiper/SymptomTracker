const ColourHelper = {
  shadeColour: function (color, percent) {

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);
  
    let mag = Math.sqrt(R*R + G*G + B*B);
    R = (R / mag) * 255;
    G = (G / mag) * 255;
    B = (B / mag) * 255;
  
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
  
    if(percent > 0) {
      if(R !== 0) {
        if(G === 0) {
          G = Math.floor(R * percent / 100);
        }
        if(B === 0) {
          B = Math.floor(R * percent / 100);
        }
      }
      if(G !== 0) {
        if(R === 0) {
          R = Math.floor(G * percent / 100);
        }
        if(B === 0) {
          B = Math.floor(G * percent / 100);
        }
      }
      if(B !== 0) {
        if(G === 0) {
          G = Math.floor(B * percent / 100);
        }
        if(B === 0) {
          R = Math.floor(B * percent / 100);
        }
      }
    }
  
    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;
  
    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
  
    return "#"+RR+GG+BB;
  },
  
  hexToHSL: function (H) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
  
    if (delta == 0)
      h = 0;
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    else if (cmax == g)
      h = (b - r) / delta + 2;
    else
      h = (r - g) / delta + 4;
  
    h = Math.round(h * 60);
  
    if (h < 0)
      h += 360;
  
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
  
    return [h, s, l];
  },

  HSLToHex: function (h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  },

  getAverageColour: function (colours) {
    let hues = []
    colours.forEach(function (colour) {
      let hsl = hexToHSL(colour);
      hues.push(hsl[0]);
    });
  
    let totalHue = 0;
    hues.forEach(function (hue) {
      totalHue += hue;
    })
    let avgHue = Math.round(totalHue/hues.length);
  
    let hsl = [avgHue, 30, 60]; // this is an arbitrary choice for saturation and lightness that should be corrected
  
    let newHex = HSLToHex(hsl);
    return newHex;
  },
  
  getColourIntervals: function (colour, num) {
    if (colour === "#NaNNaNNaN") return;
    
    let startHex = "#ebedf0"; // starts with neutral grey
    let startHSL = hexToHSL(startHex);
    let hsl = hexToHSL(colour);
  
    let colours = [startHex];
  
    let saturationChange = hsl[1] - startHSL[1];
    let lightnessChange = hsl[2] - startHSL[2];
  
    let saturationInterval = saturationChange/num;
    let lightnessInterval = lightnessChange/num;
  
    for(let i=1; i<=num; i++) {
      let newSaturation = startHSL[1] + (saturationInterval * i);
      let newLightness = startHSL[2] + (lightnessInterval * i);
      let newHSL = [hsl[0], newSaturation, newLightness];
      let newHex = HSLToHex(newHSL);
      colours.push(newHex);
    }
  
    return colours;
  },

  getColourForMode: function (hue, dark, darker) {
    return darker
      ? dark
        ? ColourHelper.HSLToHex(hue, 50, 20)
        : ColourHelper.HSLToHex(hue, 70, 70)
      : dark
        ? ColourHelper.HSLToHex(hue, 50, 20)
        : ColourHelper.HSLToHex(hue, 100, 85);
  }
}

export default ColourHelper;