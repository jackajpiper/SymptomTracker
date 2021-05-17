import React from 'react'
import { View, ScrollView, Dimensions } from "react-native";
import { StackedBarChart, LineChart } from 'react-native-chart-kit'
import moment from "moment";
import AsyncManager from './AsyncManager';
import { max } from 'react-native-reanimated';

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

export default class StackedBarChartExample extends React.PureComponent {
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

  selectedLineDataByMonth = (selectedData) => {
    let typeLines = [];
    let typeList = [];
    let firstDate = moment("9999-12-31");
    let lastDate = moment("0001-01-01");
    selectedData.forEach((selected) => {
      let typeName = selected.split(' ')[0];
      let id = parseInt(selected.split(' ')[1]);
      let type = this.state[typeName+"s"].find((t) => t.id === id);
      typeList.push(type.name);
      let instances = this.state[typeName+"Instances"].filter((instance) => {return instance.typeId === id});
      
      instances.map((instance) => {
        instance.type = typeName;
        return instance;
      });

      let typeLine = {
        data: [],
        color: (opacity = 1) => shadeColour(type.colour, 40)
      };
      let dateDict = {};
      // constructs the dictionary of dates and respective counts for this type (e.g Headache)
      instances.forEach((instance) => {
        let date = moment(instance.date)
        let dateString = date.format("MMM YY");
        if (date.isBefore(firstDate)) {
          firstDate = date;
        } else if (date.isAfter(lastDate)) {
          lastDate = date;
        }
        
        !dateDict[dateString] && (dateDict[dateString] = 0);
        dateDict[dateString]++;
      });

      typeLine.data = dateDict;
      typeLines.push(typeLine);
    });
    
    let dates = [];
    let tempFirstDate = moment(firstDate);
    typeLines.forEach((type) => {
      // now we go from the first date to the last date, filling in
      let typeLineData = [];
      dates = [];
      while (lastDate > tempFirstDate || tempFirstDate.format('M') === lastDate.format('M')) {
        let dateString = tempFirstDate.format("MMM YY");
        dates.push(dateString);
        if (!type.data[dateString]) {
          typeLineData.push(0);
        } else {
          typeLineData.push(type.data[dateString]);
        }
        tempFirstDate.add(1,'month');
      }
      type.data = typeLineData;
      tempFirstDate = moment(firstDate);
    });

    return { datasets: typeLines, labels: dates };

  }

  renderGraph = (type) => {
    if (type === "bar") {
      let selectedData = this.selectedBarDataByMonth(this.state.SelectedData);


      let maxVisible = 10
      let numOfItems = selectedData.datasets && selectedData.datasets[0] && selectedData.datasets[0].data.length;
      let lengthMultiple = Math.round((numOfItems / maxVisible)*10)/10;


      let barPercentage = 1;
      if (selectedData.data.length > 9) {
        barPercentage = 0.7;
        lengthMultiple = 1.2;
      }
      if (selectedData.data.length > 27) {
        barPercentage = 0.4;
        lengthMultiple = 2;
      }

      return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={lengthMultiple !== 1} scrollEnabled={lengthMultiple !== 1}>
          <StackedBarChart
            data={selectedData}
            width={this.state.graphWidth * lengthMultiple}
            height={220}
            decimalPlaces={0}
            hideLegend={true}
            chartConfig={{
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              withVerticalLines: true,
              color: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(20, 20, 20, ${opacity})`,
              barPercentage: barPercentage,
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
      let selectedData = this.selectedLineDataByMonth(this.state.SelectedData);

      let maxVisible = 10;
      let numOfItems = selectedData.datasets && selectedData.datasets[0] && selectedData.datasets[0].data.length;
      let lengthMultiple = numOfItems > maxVisible
        ? Math.round((numOfItems / maxVisible)*10)/10
        : 1;

      if (selectedData.datasets.length) {
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
                // marginVertical: 8,
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
    }
  }

  render() {
    return (
      <View style={{ width: "100%", borderWidth: 1}} onLayout={(event) => {this.setState({graphWidth: event.nativeEvent.layout.width});}}>
        {this.renderGraph(this.props.type)}
      </View>
    )
  }
}