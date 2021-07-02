import React, {Component} from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, ActivityIndicator } from "react-native";
import AsyncManager from './AsyncManager';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import ChartsComponent from './ChartsComponent';
import AnalysisTabs from './AnalysisTabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

function shadeColor(color, percent) {

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

const Tab = createMaterialTopTabNavigator();

export default class AnalysisScreen extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      isLoading: true,
      Symptoms: [],
      SymptomInstances: [],
      Triggers: [],
      TriggerInstances: [],
      Treatments: [],
      TreatmentInstances: [],
      GraphType: "",
      PeriodStart: new Date(),
      PeriodEnd: new Date(),
      GraphPeriodType: "",
      SelectedData: [],
    };
  }

  async componentDidMount() {
    setTimeout(async () => {
      let symptoms = await AsyncManager.getSymptoms();
      let symptomInstances = await AsyncManager.getSymptomInstances();
      let triggers = await AsyncManager.getTriggers();
      let triggerInstances = await AsyncManager.getTriggerInstances();
      let treatments = await AsyncManager.getTreatments();
      let treatmentInstances = await AsyncManager.getTreatmentInstances();

      this.setState({ 
        isLoading: false,
        Symptoms: symptoms,
        SymptomInstances: symptomInstances,
        Triggers: triggers,
        TriggerInstances: triggerInstances,
        Treatments: treatments,
        TreatmentInstances: treatmentInstances
      });
    }, 0);

    this.willFocusListener = this.props.navigation.addListener('focus', async () => {
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

  pollUpdates = async () => {
    let symptomResult = await AsyncManager.pollUpdates("Analysis", "symptoms");
    let treatmentResult = await AsyncManager.pollUpdates("Analysis", "treatments");
    let triggerResult = await AsyncManager.pollUpdates("Analysis", "triggers");

    let oneChanged = false;
    let newSymptoms = symptomResult.Symptoms;
    let newTreatments = treatmentResult.Treatments;
    let newTriggers = triggerResult.Triggers;
    let newSymptomInstances = symptomResult.Instances;
    let newTreatmentInstances = treatmentResult.Instances;
    let newTriggerInstances = triggerResult.Instances;

    if (newSymptoms) {
      this.setState({Symptoms: newSymptoms});
      oneChanged = true;
    } else {
      newSymptoms = this.state.Symptoms;
    }
    if (newTreatments) {
      this.setState({Treatments: newTreatments});
      oneChanged = true;
    } else {
      newTreatments = this.state.Treatments;
    }
    if (newTriggers) {
      this.setState({Triggers: newTriggers});
      oneChanged = true;
    } else {
      newTriggers = this.state.Triggers;
    }
    if (newSymptomInstances) {
      this.setState({SymptomInstances: newSymptomInstances});
      oneChanged = true;
    } else {
      newSymptomInstances = this.state.SymptomInstances;
    }
    if (newTreatmentInstances) {
      this.setState({TreatmentInstances: newTreatmentInstances});
      oneChanged = true;
    } else {
      newTreatmentInstances = this.state.TreatmentInstances;
    }
    if (newTriggerInstances) {
      this.setState({TriggerInstances: newTriggerInstances});
      oneChanged = true;
    } else {
      newTriggerInstances = this.state.TriggerInstances;
    }

    if (oneChanged) {
      // if the system gets instant-refreshed, this stops working
      // need to hard refresh to reset it
      this.tabs.enableRefresh();
    }
  }

  renderGraph = (type, period, selectedData, start, end) => {
    if (!this.state.Symptoms.length) {
      return (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="cornflowerblue" />
        </View>
      );
    } else {
      return <ChartsComponent
        ref={chart => {this.chart = chart}}
        Symptoms={this.state.Symptoms}
        Triggers={this.state.Triggers}
        Treatments={this.state.Treatments}
        SymptomInstances={this.state.SymptomInstances}
        TriggerInstances={this.state.TriggerInstances}
        TreatmentInstances={this.state.TreatmentInstances}
        type={type}
        period={period}
        selectedData={selectedData}
        start={start}
        end={end}
        state={{...this.state}}
        navigation={{...this.props.navigation}}/>
    }
  }

  updateGraph = async (graphType, period, selectedData, start, end) => {
    this.setState({ GraphType: graphType, GraphPeriodType: period, SelectedData: selectedData, PeriodStart: start, PeriodEnd: end }); // not fully sure why we need this
    this.chart.updateData();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top}>
          {this.renderGraph(this.state.GraphType, this.state.GraphPeriodType, this.state.SelectedData, this.state.PeriodStart, this.state.PeriodEnd)}
        </View>
        <View style={styles.bottom}>
          <AnalysisTabs
            ref={tabs => {this.tabs = tabs}}
            updateGraph={this.updateGraph}
            symptoms={this.state.Symptoms}
            triggers={this.state.Triggers}
            treatments={this.state.Treatments}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white"
  },
  top: {
    flex: 3,
    width: "100%",
    flexDirection: "row",
    marginTop: 25,
    borderBottomWidth: 1
  },
  graph: {
    flex: 1
  },
  symptomCheckboxes: {
    width: 100,
    paddingTop: 20,
    overflow: "hidden",
    flexDirection: "column",
    borderWidth: 1
  },
  checkbox: {
    marginTop: 12
  },
  bottom: {
    flex: 4,
    width: "100%"
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});