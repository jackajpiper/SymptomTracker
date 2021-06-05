import React from 'react'
import { StyleSheet, View, ScrollView, Text, DrawerLayoutAndroidComponent } from "react-native";
import { StackedBarChart, LineChart, ContributionGraph } from 'react-native-chart-kit'
import moment from "moment";
import AsyncManager from './AsyncManager';
import HeatMap from 'react-native-heatmap-chart';

function shadeColour(color, percent) {

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
}

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

function getAverageColour(colours) {
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

export default class ChartsComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.props = props;
    this.navigation = props.navigation;

    this.state = props.state;
    this.state.graphWidth = 0;
  }

  pollUpdates = async () => {
    let symptomResult = await AsyncManager.pollUpdates("Analysis", "symptoms");
    let treatmentResult = await AsyncManager.pollUpdates("Analysis", "treatments");
    let triggerResult = await AsyncManager.pollUpdates("Analysis", "triggers");

    let newSymptoms = symptomResult.Symptoms;
    let newSymptomInstances = symptomResult.Instances;
    let newTreatments = treatmentResult.Treatments;
    let newTreatmentInstances = treatmentResult.Instances;
    let newTriggers = triggerResult.Triggers;
    let newTriggerInstances = triggerResult.Instances;

    if (newSymptoms) {
      this.setState({Symptoms: newSymptoms});
    } else {
      newSymptoms = this.state.Symptoms;
    }
    if (newSymptomInstances) {
      this.setState({SymptomInstances: newSymptomInstances});
    } else {
      newSymptomInstances = this.state.SymptomInstances;
    }
    if (newTreatments) {
      this.setState({Treatments: newTreatments});
    } else {
      newTreatments = this.state.Treatments;
    }
    if (newTreatmentInstances) {
      this.setState({TreatmentInstances: newTreatmentInstances});
    } else {
      newTreatmentInstances = this.state.TreatmentInstances;
    }
    if (newTriggers) {
      this.setState({Triggers: newTriggers});
    } else {
      newTriggers = this.state.Triggers;
    }
    if(newTriggerInstances) {
      this.setState({TriggerInstances: newTriggerInstances});
    } else {
      newTriggerInstances = this.state.TriggerInstances;
    }
  }

  async componentDidMount() {
    this.willFocusListener = this.navigation.addListener('focus', async () => {
      await this.pollUpdates();
    });
    this._mounted = true;
  }

  componentWillUnmount = () => {
    this._mounted = false;
    if(this.willFocusListener && typeof this.willFocusListener.remove === "function") {
      this.willFocusListener.remove();
    };
  }

  selectedBarDataByMonth = (selectedData) => {
    let allInstances = [];
    let typeList = [];
    let colourList = [];
    selectedData.forEach((selected) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.state[typeName+"s"].find((t) => t.id === id);
      typeList.push(type.name);
      colourList.push(shadeColour(type.colour, 40));
      let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});
      
      instances.map((instance) => {
        instance.type = typeName;
        return instance;
      })

      allInstances = allInstances.concat(instances);
    });

    let dateDict = {};
    let firstDate = moment("9999-12-31");
    let lastDate = moment("0001-01-01");
    allInstances.forEach((instance) => {
      let date = moment(instance.date)
      let dateString = date.format("MMM YY");
      if (date.isBefore(firstDate)) {
        firstDate = date;
      } else if (date.isAfter(lastDate)) {
        lastDate = date;
      }

      let type = this.state[instance.type+"s"].find((type) => { return type.id === instance.typeId; });
      if (!dateDict[dateString]) {
        dateDict[dateString] = {
          month: new Date(instance.date),
          monthString: moment(instance.date).format("MMM"),
          [type.name]: 1
        };
      } else {
        if (!dateDict[dateString][type.name]) {
          dateDict[dateString][type.name] = 1;
        } else {
          dateDict[dateString][type.name]++;
        }
      }
    });

    // fill out missing months
    while (lastDate > firstDate || firstDate.format('M') === lastDate.format('M')) {
      let dateString = firstDate.format("MMM YY");
      if (!dateDict[dateString]) {
        dateDict[dateString] = {
          month: new Date(firstDate.format("YYYY-MM-DD")),
          monthString: firstDate.format("MMM")
        }
      }
      firstDate.add(1,'month');
    }

    let dateArr = Object.keys(dateDict).map(function(key) { return [key, dateDict[key]]; });
    dateArr.sort(function(first, second) { return moment(second[0], "MMM YY").isBefore(moment(first[0], "MMM YY")) });

    let dates = dateArr.map((i)=>{return i[1].monthString});
    let dataArr = dateArr.map((i)=>{return i[1]});
    let data = [];
    dataArr.forEach(function(dict) {
      let datum = [];
      typeList.forEach((type) => {
        datum.push(dict[type] || 0)
      });
      data.push(datum);
    });

    return {data: data, barColors: colourList, labels: dates};
  }

  selectedLineDataByMonth = (selectedData, rangeType, start, end) => {
    let typeLines = [];
    let typeList = [];
    let dates = [];
    let firstDate = moment("9999-12-31");
    let lastDate = moment("0001-01-01");

    if (rangeType === "year-average") {

      dates = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      selectedData.forEach((selected) => {
        let typeName = selected.split(' ')[0];
        let id = parseInt(selected.split(' ')[1]);
        let type = this.state[typeName+"s"].find((t) => t.id === id);
        typeList.push(type.name);
        let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});
  
        let typeLine = {
          data: [],
          color: (opacity = 1) => shadeColour(type.colour, 40)
        };
        let dataArr = [];
        // constructs the dictionary of dates and respective counts for this type (e.g Headache)
        for (let i=0; i<12; i++) {
          let dayInstances = instances.filter(function (instance) { return parseInt(moment(instance.date).month()) === i; });
          dataArr.push(dayInstances.length);
        }
  
        typeLine.data = dataArr;
        typeLines.push(typeLine);
      });
      
    } else if (rangeType === "week-average") {

      dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      selectedData.forEach((selected) => {
        let typeName = selected.split(' ')[0];
        let id = parseInt(selected.split(' ')[1]);
        let type = this.state[typeName+"s"].find((t) => t.id === id);
        typeList.push(type.name);
        let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});
  
        let typeLine = {
          data: [],
          color: (opacity = 1) => shadeColour(type.colour, 40)
        };
        let dataArr = [];
        // constructs the dictionary of dates and respective counts for this type (e.g Headache)
        for (let i=1; i<=7; i++) {
          let dayInstances = instances.filter(function (instance) { return parseInt(moment(instance.date).day()) === i; });
          dataArr.push(dayInstances.length);
        }
  
        typeLine.data = dataArr;
        typeLines.push(typeLine);
      });

    } else if (rangeType === "month-average") {

      dates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
              "12", "13", "14", "15", "16", "17", "18", "19", "20", "21",
              "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];

      selectedData.forEach((selected) => {
        let typeName = selected.split(' ')[0];
        let id = parseInt(selected.split(' ')[1]);
        let type = this.state[typeName+"s"].find((t) => t.id === id);
        typeList.push(type.name);
        let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});
  
        let typeLine = {
          data: [],
          color: (opacity = 1) => shadeColour(type.colour, 40)
        };
        let dataArr = [];
        dates.forEach(function (date) {
          let dayInstances = instances.filter(function (instance) { return moment(instance.date).date() === parseInt(date); });
          dataArr.push(dayInstances.length);
        });
  
        typeLine.data = dataArr;
        typeLines.push(typeLine);
      });
    }

    return { datasets: typeLines, labels: dates };

  }

  buildHeatChart = (selectedData, rangeType, start, end) => {
    let colours = [];
    let dataArr = [];

    let allInstances = [];
    selectedData.forEach((selected) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.state[typeName+"s"].filter((type) => {return type.id === id})[0];
      colours.push(type.colour);
      let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});

      allInstances = allInstances.concat(instances);
    });
    
    if (rangeType === "month-average") {
      for (let i = 1; i < 32; i++) {
        let filtered = allInstances.filter(function (instance) { return parseInt(moment(instance.date).format("D")) === i; });
        dataArr.push(filtered.length);
      }
      
      let colourIntervals = getColourIntervals(getAverageColour(colours), 4);

      return (
        <View style={{ paddingTop: 30, paddingLeft: 10, display: "flex" }}>
          <View style={styles.monthList}>
            <Text style={styles.monthWeekDay}>1</Text>
            <Text style={styles.monthWeekDay}>2</Text>
            <Text style={styles.monthWeekDay}>3</Text>
            <Text style={styles.monthWeekDay}>4</Text>
            <Text style={styles.monthWeekDay}>5</Text>
            <Text style={styles.monthWeekDay}>6</Text>
            <Text style={styles.monthWeekDay}>7</Text>
          </View>
            <Text style={[styles.monthWeekDay, {marginTop: 0}]}></Text>

          <View>
            <View style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1
            }}>
              <Text style={[styles.monthDay, {marginTop: -38}]}> 1</Text>
              <Text style={styles.monthDay}> 7</Text>
              <Text style={styles.monthDay}>29</Text>
            </View>

            <View style={styles.heatTransform}>
              <View style={{ width: 190, height: 265 }}>
                <HeatMap
                  numberOfLines={7}
                  values={dataArr}
                  onBlockPress={this.click}
                  colors={colourIntervals}
                  blocksSize={33}
                />
              </View>
            </View>
          </View>
        </View>
      )

    } else if (rangeType === "week-average") {
      for (let i = 1; i <= 7; i++) {
        let filtered = allInstances.filter(function (instance) { return parseInt(moment(instance.date).day()) === i; });
        dataArr.push(filtered.length);
      }
      
      let colourIntervals = getColourIntervals(getAverageColour(colours), 4);

      return (
        <View style={{ paddingTop: 70 }}>
          <View style={styles.weekList}>
            <Text style={styles.weekDay}>Mon</Text>
            <Text style={styles.weekDay}>Tue</Text>
            <Text style={styles.weekDay}>Wed</Text>
            <Text style={styles.weekDay}>Thu</Text>
            <Text style={styles.weekDay}>Fri</Text>
            <Text style={styles.weekDay}>Sat</Text>
            <Text style={styles.weekDay}>Sun</Text>
          </View>
          <View style={styles.heatTransform}>
            <View style={{ width: 50, height: 312 }}>
              <HeatMap
                numberOfLines={7}
                values={dataArr}
                onBlockPress={this.click}
                colors={colourIntervals}
                blocksSize={40}
              />
            </View>
          </View>
        </View>
      )
    } else if (rangeType === "year-average") {
      for (let i = 1; i <= 12; i++) {
        let filtered = allInstances.filter(function (instance) { return parseInt(moment(instance.date).month())+1 === i; });
        dataArr.push(filtered.length);
      }
      
      let colourIntervals = getColourIntervals(getAverageColour(colours), 4);

      return (
        <View style={{ paddingTop: 80 }}>
          <View style={styles.yearList}>
            <Text style={styles.weekDay}>Jan</Text>
            <Text style={styles.weekDay}>Feb</Text>
            <Text style={styles.weekDay}>Mar</Text>
            <Text style={styles.weekDay}>Apr</Text>
            <Text style={styles.weekDay}>May</Text>
            <Text style={styles.weekDay}>Jun</Text>
            <Text style={styles.weekDay}>Jul</Text>
            <Text style={styles.weekDay}>Aug</Text>
            <Text style={styles.weekDay}>Sep</Text>
            <Text style={styles.weekDay}>Oct</Text>
            <Text style={styles.weekDay}>Nov</Text>
            <Text style={styles.weekDay}>Dec</Text>
          </View>
          <View style={styles.heatTransform}>
            <View style={{ width: 40, height: 340 }}>
              <HeatMap
                numberOfLines={12}
                values={dataArr}
                onBlockPress={this.click}
                colors={colourIntervals}
                blocksSize={24}
              />
            </View>
          </View>
        </View>
      )
    }
  }

  calculateBarWidths = (itemCount, maxVisible, maxScaled, lengthStart, maxBarPercentage, minBarPercentage) => {
    let lengthMultiple;
    let barPercentage;
    let r = itemCount/maxScaled;
    if (itemCount <= maxVisible) {
      lengthMultiple = lengthStart;
      barPercentage = maxBarPercentage - (r*minBarPercentage);
    } else if (itemCount >= maxScaled) {
      lengthMultiple = lengthStart+r;
      barPercentage = minBarPercentage;
    } else {
      lengthMultiple = lengthStart+r;
      barPercentage = maxBarPercentage - (r*minBarPercentage);
    }
    return { scaleMultiple: lengthMultiple, itemPercentage: barPercentage };
  }

  click = (item) => {
    console.log(`Value: ${item.value}`);
    console.log(`Index: ${item.index}`);
  };

  renderGraph = (type) => {
    if (type === "bar") {
      let selectedData = this.selectedBarDataByMonth(this.state.SelectedData);
      let widths = this.calculateBarWidths(selectedData.data && selectedData.data.length, 12, 31, 1, 0.8, 0.4);

      return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={widths.scaleMultiple !== 1} scrollEnabled={widths.scaleMultiple !== 1}>
          <StackedBarChart
            data={selectedData}
            width={(this.state.graphWidth * widths.scaleMultiple)-10}
            height={220}
            decimalPlaces={0}
            hideLegend={true}
            chartConfig={{
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              withVerticalLines: true,
              color: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
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
      let selectedData = this.selectedLineDataByMonth(this.state.SelectedData, this.props.period);

      let maxVisible = 10;
      let numOfItems = selectedData.datasets && selectedData.datasets[0] && selectedData.datasets[0].data.length;
      let lengthMultiple = numOfItems > maxVisible
        ? Math.round((numOfItems / maxVisible)*10)/10
        : 1;

      if (selectedData.datasets[0]) {
        return (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={lengthMultiple !== 1} scrollEnabled={lengthMultiple !== 1}>
            <LineChart
              data={selectedData}
              width={(this.state.graphWidth+30) * lengthMultiple}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "white",
                backgroundGradientTo: "white",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
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
      } else {
        return (
          <View></View>
        )
      }
    } else if (type === "heat") {
      let heatGraph = this.buildHeatChart(this.state.SelectedData, this.props.period);

      if (this.state.SelectedData.length) {
        return heatGraph;
      } else {
        return (
          <View></View>
        )
      }
    }
  }

  render() {
    return (
      <View style={{ width: "100%" }} onLayout={(event) => {this.setState({graphWidth: event.nativeEvent.layout.width});}}>
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
  },
});