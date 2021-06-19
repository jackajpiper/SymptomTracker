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
  }

  renderGraph = (type, period, selectedData) => {
    if (!this.state.Symptoms.length) {
      return (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="cornflowerblue" />
        </View>
      );
    } else {
      return <ChartsComponent type={type} period={period} selectedData={selectedData} state={{...this.state}} navigation={{...this.props.navigation}}/>
    }
  }

  updateGraph = (graphType, period, selectedData) => {
    this.setState({ GraphType: graphType, GraphPeriodType: period, SelectedData: selectedData });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top}>
          {this.renderGraph(this.state.GraphType, this.state.GraphPeriodType, this.state.SelectedData)}
        </View>
        <View style={styles.bottom}>
          <AnalysisTabs updateGraph={this.updateGraph} symptoms={this.state.Symptoms}/>
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