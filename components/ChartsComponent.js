import React from 'react'
import { StyleSheet, View, ScrollView, Text, ActivityIndicator } from "react-native";
import { StackedBarChart, LineChart } from 'react-native-chart-kit'
import moment from "moment";
import ColourHelper from './ColourHelper';
import HeatMap from 'react-native-heatmap-chart';

function hexToHSL(H) {
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
}

function HSLToHex(hsl) {
  let h = hsl[0];
  let s = hsl[1];
  let l = hsl[2];
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
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  if (r.length === 1) {
    r = "0"+r;
  }
  if (g.length === 1) {
    gr = "0"+g;
  }
  if (b.length === 1) {
    b = "0"+b;
  }

  return "#" + r + g + b;
}

function getAverageHue(hues) {
  let avgHue;
  hues.forEach((hue, index) => {
    if (!index) { // first hue
      avgHue = hue;
    } else {
      let diff = hue - avgHue; // distance from avgHue to this hue
      if (Math.abs(diff) <= 180) { // they're on the same side of the circle
        avgHue += (diff / (index+1)); // shift the average by less each time
      } else {
        let subtraction = diff >= 0 ? 360 : -360;
        diff -= subtraction;
        avgHue += (diff / (index+1)); // shift the average by less each time
      }
    }
  })
  if (avgHue < 1) {
    avgHue += 360;
  }

  return Math.round(avgHue);
}

function getAverageColour(hues) {
  let avgHue = getAverageHue(hues);

  let newHex = ColourHelper.getColourForMode(avgHue, false, true, true);
  return newHex;
}

function getColourIntervals(colour, num) {
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
}

export default class ChartsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.props = props;
    this.navigation = props.navigation;

    this.state = {
      graphWidth: 0,
      GraphData: {},
      isLoading: false
    };
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.props.type !== nextProps.type
        || this.props.period !== nextProps.period
        || JSON.stringify(this.props.selectedData) !== JSON.stringify(nextProps.selectedData)
        || this.props.start !== nextProps.start
        || this.props.end !== nextProps.end
        || this.state.isLoading !== nextState.isLoading
        || this.props.theme.dark !== nextProps.theme.dark;
  }

  getAverageForBar = (selectedData, dates, start, end, length, format, scaleMultiple, itemPercentage) => {
    let colourList = [];
    let data = [];
    let widths = { scaleMultiple: scaleMultiple, itemPercentage: itemPercentage };

    let dateCheck = (date) => {
      if (start && end) {
        return date.isSameOrAfter(start, "days") && date.isSameOrBefore(end, "days");
      }
      return true;
    }

    for (let i=0; i<length; i++) {
      let emptyDataEntry = [];
      for (let i=0; i<selectedData.length; i++) {
        emptyDataEntry.push(0);
      }
      data[i] = emptyDataEntry;
    }

    selectedData.forEach((selected, index) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.props[typeName+"s"].find((t) => t.id === id);
      let typeColour = ColourHelper.getColourForMode(type.hue, this.props.theme.dark, true, true);
      colourList.push(typeColour);
      let instances = this.props[typeName+"Instances"].filter((instance) => { return instance.typeId === id; });

      if (instances.length !== 0) {
        instances.forEach((instance) => {
          let date = moment(instance.date);
          let dayNum = parseInt(date.format(format)) - 1;
          if (dateCheck(date)) {
            data[dayNum][index]++;
          }
        });
      } else if (selectedData.length === 1) {
        return {};
      }
    });

    // remove empty data
    for(let i=selectedData.length-1; i>=0; i--) {
      if (!(data.filter((datum) => {
            return !!datum[i];
          }).length)) {
        data.map((datum) => {
          datum.splice(i, 1);
        });
        colourList.splice(i, 1);
      }
    }

    return {data: data, barColors: colourList, labels: dates, widths: widths};
  }

  getAllForBar(selectedData, start, end, format, funcName, addFormat) {
    let data = [];
    let dates = [];
    let colourList = [];
    let widths = {};
    let dateDict = {};

    let dateCheck = (date) => {
      if (start && end) {
        return date.isSameOrAfter(start, "days") && date.isSameOrBefore(end, "days");
      }
      return true;
    }

    selectedData.forEach((selected, index) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.props[typeName+"s"].find((t) => t.id === id);
      let typeColour = ColourHelper.getColourForMode(type.hue, this.props.theme.dark, true, true);
      colourList.push(typeColour);

      let instances = this.props[typeName+"Instances"].filter((instance) => {
        return instance.typeId === id;
      });

      instances.forEach((instance) => {
        let date = moment(instance.date);
        let monthStart = date.clone().subtract(date.clone()[funcName]()-1, "days");
        let dateString = monthStart.toISOString();
        if (dateCheck(date)) {
          // making a new date object entry for the date
          if (!dateDict[dateString]) {
            let emptyDataEntry = [];
            for (let i=0; i<selectedData.length; i++) {
              emptyDataEntry.push(0);
            }
            dateDict[dateString] = emptyDataEntry;
          }
          // adding this instance to the count
          dateDict[dateString][index]++;
        }
        
      })
    })

    // Create array of dates and corresponding data
    let dictData = Object.keys(dateDict).map(function(date) {
      return [date, dateDict[date]];
    });

    // Sort the array based on the date
    dictData.sort(function(first, second) {
      return moment(first[0]).isAfter(second[0]);
    });

    // fill out the array to include empty date intervals
    if (!start) {
      start = moment(dictData && dictData[0] && dictData[0][0]);
    } else {
      let date = moment(start);
      start = date.clone().subtract(date.clone()[funcName]()-1, "days");
    }
    let dateData = [];
    let emptyData = selectedData.map(() => { return 0; });
    for (let i=0; i<dictData.length; i++) {
      if (start.isSame(dictData[i][0], "days")) {
        dateData.push(dictData[i]);
      } else {
        dateData.push([start.toISOString(), emptyData]);
        i--;
      }
      start.add(1, addFormat);
    }

    data = dateData.map((dateDatum) => {
      return dateDatum[1];
    });
    dates = dateData.map((dateDatum) => {
      return moment(dateDatum[0]).format(format);
    });

    // remove empty data
    for(let i=selectedData.length-1; i>=0; i--) {
      if (!(data.filter((datum) => {
            return !!datum[i];
          }).length)) {
        data.map((datum) => {
          datum.splice(i, 1);
        });
        colourList.splice(i, 1);
      }
    }

    // with item percentage 0.7, ratio is 7.7 items to 1 scale
    let sm = (data && data.length) / 7.7
    widths.scaleMultiple = sm > 1 ? sm : 1;
    widths.itemPercentage = 0.7;

    return {data: data, barColors: colourList, labels: dates, widths: widths};
  }

  buildSelectedBarData = (selectedData, period, start, end) => {
    let data = [];
    let dates = [];
    let colourList = [];
    let widths = {};
    
    if (period === "week-average") {
      dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return this.getAverageForBar(selectedData, dates, start, end, 7, "E", 1, 0.7); // 'E' is ISO weekday, where sunday is the 7th day
    } else if (period === "year-average") {
      dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return this.getAverageForBar(selectedData, dates, start, end, 12, "M", 1, 0.5);
    } else if (period === "month-average") {
      dates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
              "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
              "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
      return this.getAverageForBar(selectedData, dates, start, end, 31, "D", 2, 0.4);
    } else if (period === "week-all") {
      return this.getAllForBar(selectedData, start, end, "DD MMM", "day", "w");
    } else if (period === "month-all") {
      return this.getAllForBar(selectedData, start, end, "MMM YY", "date", "M");
    } else if (period === "year-all") {
      return this.getAllForBar(selectedData, start, end, "YYYY", "dayOfYear", "y");
    }

    return {data: data, barColors: colourList, labels: dates, widths: widths};
  }

  getAverageForLine = (selectedData, dates, start, end, length, format, scaleMultiple) => {
    let typeLines = [];
    let typeList = [];

    let dateCheck = (date) => {
      if (start && end) {
        return date.isSameOrAfter(start, "days") && date.isSameOrBefore(end, "days");
      }
      return true;
    }

    selectedData.forEach((selected) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.props[typeName+"s"].find((t) => t.id === id);
      typeList.push(type.name);
      let instances = this.props[typeName+"Instances"].filter((instance) => {return instance.typeId === id});

      let emptyDataEntry = [];
      for (let i=0; i<length; i++) {
        emptyDataEntry.push(0);
      }
      let typeColour = ColourHelper.getColourForMode(type.hue, this.props.theme.dark, true, true);
      let typeLine = {
        data: [],
        color: (opacity = 1) => typeColour
      };
      let dataArr = emptyDataEntry;
      instances.forEach((instance) => {
        let date = moment(instance.date);
        let dayNum = parseInt(date.format(format)) - 1;
        if (dateCheck(date)) {
          dataArr[dayNum]++;
        }
      })

      typeLine.data = dataArr;
      typeLines.push(typeLine);
    });

    return { datasets: typeLines, labels: dates, multiple: scaleMultiple };
  }

  getAllForLine(selectedData, start, end, format, funcName, addFormat) {
    let dates = [];
    let dateDict = {};

    let dateCheck = (date) => {
      if (start && end) {
        return date.isSameOrAfter(start, "days") && date.isSameOrBefore(end, "days");
      }
      return true;
    }

    selectedData.forEach((selected, index) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);

      let instances = this.props[typeName+"Instances"].filter((instance) => {
        return instance.typeId === id;
      });

      instances.forEach((instance) => {
        let date = moment(instance.date);
        let monthStart = date.clone().subtract(date.clone()[funcName]()-1, "days");
        let dateString = monthStart.toISOString();
        if (dateCheck(date)) {
          // making a new date object entry for the date
          if (!dateDict[dateString]) {
            let emptyDataEntry = [];
            for (let i=0; i<selectedData.length; i++) {
              emptyDataEntry.push(0);
            }
            dateDict[dateString] = emptyDataEntry;
          }
          // adding this instance to the count
          dateDict[dateString][index]++;
        }
        
      })
    })

    // Create array of dates and corresponding data
    let dictData = Object.keys(dateDict).map(function(date) {
      return [date, dateDict[date]];
    });

    // Sort the array based on the date
    dictData.sort(function(first, second) {
      return moment(first[0]).isAfter(second[0]);
    });

    // fill out the array to include empty date intervals
    if (!start) {
      start = moment(dictData && dictData[0] && dictData[0][0]);
    } else {
      let date = moment(start);
      start = date.clone().subtract(date.clone()[funcName]()-1, "days");
    }
    let dateData = [];
    let emptyData = selectedData.map(() => { return 0; });
    for (let i=0; i<dictData.length; i++) {
      if (start.isSame(dictData[i][0], "days")) {
        dateData.push(dictData[i]);
      } else {
        dateData.push([start.toISOString(), emptyData]);
        i--;
      }
      start.add(1, addFormat);
    }

    // build a dataset for each of the selected data
    let typeLines = [];
    selectedData.forEach((selected, index) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.props[typeName+"s"].find((t) => t.id === id);

      let typeData = dateData.map((dateDatum) => {
        return dateDatum[1][index];
      });
      let typeColour = ColourHelper.getColourForMode(type.hue, this.props.theme.dark, true, true);
      let typeLine = {
        data: typeData,
        color: (opacity = 1) => typeColour
      };
      typeLines.push(typeLine);
    });

    dates = dateData.map((dateDatum) => {
      return moment(dateDatum[0]).format(format);
    });

    // with item percentage 0.7, ratio is 7.7 items to 1 scale
    let sm = (typeLines && typeLines[0] && typeLines[0].data.length) / 7.7;
    let scaleMultiple = sm > 1 ? sm : 1;

    !dates.length && (dates = [moment(start || moment()).format(format)]);
    typeLines.forEach((typeLine) => {
      !typeLine.data.length && (typeLine.data = [0]);
    });

    return {datasets: typeLines, labels: dates, multiple: scaleMultiple};
  }

  buildSelectedLineData = (selectedData, period, start, end) => {
    if (period === "week-average") {
      let dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return this.getAverageForLine(selectedData, dates, start, end, 7, "E", 1, 0.7);
    } else if (period === "month-average") {
      let dates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
                  "12", "13", "14", "15", "16", "17", "18", "19", "20", "21",
                  "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
      return this.getAverageForLine(selectedData, dates, start, end, 31, "D", 2, 0.4);
    } else if (period === "year-average") {
      let dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return this.getAverageForLine(selectedData, dates, start, end, 12, "M", 1, 0.5);
    } else if (period === "week-all") {
      return this.getAllForLine(selectedData, start, end, "DD MMM", "day", "w");
    } else if (period === "month-all") {
      return this.getAllForLine(selectedData, start, end, "MMM YY", "date", "M");
    } else if (period === "year-all") {
      return this.getAllForLine(selectedData, start, end, "YYYY", "dayOfYear", "y");
    }
  }

  buildSelectedHeatData = (selectedData, period, start, end) => {
    let dateCheck = (date) => {
      if (start && end) {
        return date.isSameOrAfter(start, "days") && date.isSameOrBefore(end, "days");
      }
      return true;
    }

    let hues = [];
    let dataArr = [];
    let format = "";
    switch(period) {
      case "week-average":
        dataArr = [[0],[0],[0],[0],[0],[0],[0]];
        format = "E";
        break;
      case "month-average":
        dataArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
                  ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        format = "D";
        break;
      case "year-average":
        dataArr = [0,0,0,0,0,0,0,0,0,0,0,0];
        format = "M";
        break;
    }

    let allInstances = [];
    selectedData.forEach((selected) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.props[typeName+"s"].filter((type) => {return type.id === id})[0];
      hues.push(type.hue);
      let instances = this.props[typeName+"Instances"].filter((instance) => {
        return instance.typeId === id && dateCheck(moment(instance.date));
      });

      allInstances = allInstances.concat(instances);
    });
    let colourIntervals = getColourIntervals(getAverageColour(hues), 4);

    allInstances.forEach((instance) => {
      dataArr[moment(instance.date).format(format)-1]++;
    });

    return {period: period, values: dataArr, colours: colourIntervals};
  }

  buildHeatChart = (data) => {
    if (data.period === "month-average") {
      let monthWeekDay = {
        color: this.props.theme.dark ? "#ffffff" : "#000000",
        textAlign:"center",
        width: 45,
        marginTop: -20
      };
      let monthDay = {
        color: this.props.theme.dark ? "#ffffff" : "#000000",
        height: 73,
        width: 45,
        paddingLeft: 15,
        textAlign: "center"
      };

      return (
        <View style={{ paddingTop: 30, paddingLeft: 10, display: "flex" }}>
          <View style={styles.monthList}>
            <Text style={monthWeekDay}>1</Text>
            <Text style={monthWeekDay}>2</Text>
            <Text style={monthWeekDay}>3</Text>
            <Text style={monthWeekDay}>4</Text>
            <Text style={monthWeekDay}>5</Text>
            <Text style={monthWeekDay}>6</Text>
            <Text style={monthWeekDay}>7</Text>
          </View>
            <Text style={[monthWeekDay, {marginTop: 0}]}></Text>

          <View>
            <View style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1
            }}>
              <Text style={[monthDay, {marginTop: -32}]}> 1</Text>
              <Text style={monthDay}> 7</Text>
              <Text style={monthDay}>29</Text>
            </View>

            <View style={styles.heatTransform}>
              <View style={{ width: 190, height: 265 }}>
                <HeatMap
                  numberOfLines={7}
                  values={data.values}
                  colors={data.colours}
                  blocksSize={33}
                />
              </View>
            </View>
          </View>
        </View>
      )

    } else if (data.period === "week-average") {
      let weekDay = {
        color: this.props.theme.dark ? "#ffffff" : "#000000",
        textAlign:"center",
        width: 45
      };
      
      return (
        <View style={{ paddingTop: 70 }}>
          <View style={styles.weekList}>
            <Text style={weekDay}>Mon</Text>
            <Text style={weekDay}>Tue</Text>
            <Text style={weekDay}>Wed</Text>
            <Text style={weekDay}>Thu</Text>
            <Text style={weekDay}>Fri</Text>
            <Text style={weekDay}>Sat</Text>
            <Text style={weekDay}>Sun</Text>
          </View>
          <View style={styles.heatTransform}>
            <View style={{ width: 50, height: 312 }}>
              <HeatMap
                numberOfLines={7}
                values={data.values}
                colors={data.colours}
                blocksSize={40}
              />
            </View>
          </View>
        </View>
      )
    } else if (data.period === "year-average") {
      let weekDay = {
        color: this.props.theme.dark ? "#ffffff" : "#000000",
        textAlign:"center",
        width: 45
      };
      
      return (
        <View style={{ paddingTop: 80 }}>
          <View style={styles.yearList}>
            <Text style={weekDay}>Jan</Text>
            <Text style={weekDay}>Feb</Text>
            <Text style={weekDay}>Mar</Text>
            <Text style={weekDay}>Apr</Text>
            <Text style={weekDay}>May</Text>
            <Text style={weekDay}>Jun</Text>
            <Text style={weekDay}>Jul</Text>
            <Text style={weekDay}>Aug</Text>
            <Text style={weekDay}>Sep</Text>
            <Text style={weekDay}>Oct</Text>
            <Text style={weekDay}>Nov</Text>
            <Text style={weekDay}>Dec</Text>
          </View>
          <View style={styles.heatTransform}>
            <View style={{ width: 40, height: 340 }}>
              <HeatMap
                numberOfLines={12}
                values={data.values}
                colors={data.colours}
                blocksSize={24}
              />
            </View>
          </View>
        </View>
      )
    } else {
      return (
        <View style={{width: "100%", height: "100%", display: "flex", justifyContent: "center"}}>
          <ActivityIndicator animating={this.state.isLoading} size="large" color="cornflowerblue" />
        </View>
      )
    }
  }

  updateData = async () => {
    this.setState({GraphData: {}, isLoading: true});
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (prevState.isLoading === false) {
      setTimeout(() => {
        this.setState({isLoading: false});
      }, 0);
      return;
    }

    let calculateData = function () {};
    switch (this.props.type) {
      case "bar":
        calculateData = this.buildSelectedBarData;
        break;
      case "line":
        calculateData = this.buildSelectedLineData;
        break;
      case "heat":
        calculateData = this.buildSelectedHeatData;
        break;
    }
    
    this.setState({GraphData: calculateData(this.props.selectedData, this.props.period, this.props.start, this.props.end)}, () => {
      setTimeout(() => {
        this.setState({isLoading: false}, () => {
          this.forceUpdate();
        });
      }, 0);
    });
  }

  renderGraph = (type) => {
    let bgColour = this.props.theme.dark ? "#000000" : "#ffffff";
    let textColour = this.props.theme.dark
      ? (opacity = 1) => `rgba(256, 256, 256, ${opacity})`
      : (opacity = 1) => `rgba(20, 20, 20, ${opacity})`;
    
    if (type === "bar") {
      let selectedData = this.state.GraphData;
      let widths = selectedData.widths;
      if (!widths) {
        return (
          <View style={{width: "100%", height: "100%", display: "flex", justifyContent: "center"}}>
            <ActivityIndicator animating={this.state.isLoading} size="large" color="cornflowerblue" />
          </View>
        )
      }

      return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={widths.scaleMultiple !== 1} scrollEnabled={widths.scaleMultiple !== 1}>
          <StackedBarChart
            data={selectedData}
            width={(this.state.graphWidth * widths.scaleMultiple)-10}
            height={220}
            decimalPlaces={0}
            hideLegend={true}
            chartConfig={{
              backgroundGradientFrom: bgColour,
              backgroundGradientTo: bgColour,
              withVerticalLines: true,
              color: textColour,
              labelColor: textColour,
              barPercentage: widths.itemPercentage,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
          />
        </ScrollView>
      )
    } else if (type === "line") {
      let selectedData = this.state.GraphData;
      if (!(selectedData.datasets && selectedData.datasets.length)) {
        return (
          <View style={{width: "100%", height: "100%", display: "flex", justifyContent: "center"}}>
            <ActivityIndicator animating={this.state.isLoading} size="large" color="cornflowerblue" />
          </View>
        )
      } else if (selectedData.datasets[0].data.length > 200) {
        return (
          <View style={{width: "100%", height: "100%", display: "flex", justifyContent: "center"}}>
            <Text style={{ textAlign: 'center' }}>{"I can't render "+selectedData.datasets[0].data.length+" different columns, I'd die!"}</Text>
            <Text style={{ textAlign: 'center' }}>{"Try choosing a smaller range, less than 200 columns"}</Text>
          </View>
        )
      }

      let lengthMultiple = selectedData.multiple;
      return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={lengthMultiple !== 1} scrollEnabled={lengthMultiple !== 1}>
          <LineChart
            fromZero
            data={selectedData}
            width={(this.state.graphWidth+30) * lengthMultiple}
            height={220}
            chartConfig={{
              backgroundGradientFrom: bgColour,
              backgroundGradientTo: bgColour,
              decimalPlaces: 0,
              color: textColour,
              labelColor: textColour,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#777777"
              }
            }}
            bezier
            style={{
              marginLeft: -30,
              borderRadius: 16
            }}
          />
        </ScrollView>
      )
    } else if (type === "heat") {
      return this.buildHeatChart(this.state.GraphData);
    }
  }

  render() {
    let bgColour = this.props.theme.dark ? "#000000" : "#ffffff";
    return (
      <View style={{ width: "100%", height: "100%", backgroundColor: bgColour }} onLayout={(event) => {this.setState({graphWidth: event.nativeEvent.layout.width});}}>
        {this.renderGraph(this.props.type)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  heatTransform: {
    transform: [
      { scaleX: -1 },
      { rotate: "90deg" }
    ]
  },
  weekList: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 30,
    width: 305,
    marginLeft: 25
  },
  weekDay: {
    textAlign:"center",
    width: 45
  },
  monthList: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 25,
    width: 255,
    marginLeft: 45
  },
  monthDay: {
    height: 73,
    width: 45,
    paddingLeft: 15,
    textAlign: "center"
  },
  monthWeekDay: {
    textAlign:"center",
    width: 45,
    marginTop: -20
  },
  yearList: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 15,
    width: 325,
    marginLeft: 15
  }
});