import React, {Component} from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar } from "react-native";
import AsyncManager from './AsyncManager';
import ChartsComponent from './ChartsComponent';
import AnalysisTabs from './AnalysisTabs';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    let bgColour = this.props.theme.dark ? "#000000" : "#ffffff";
    if (!this.state.Symptoms.length) {
      return (
        <View style={[styles.spinner, {backgroundColor: bgColour}]}>
          <ActivityIndicator animating={this.state.isLoading} size="large" color="cornflowerblue" />
        </View>
      );
    } else {
      return <ChartsComponent
        ref={chart => {this.chart = chart}}
        theme = {this.props.theme}
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
    let bgColour = this.props.theme.dark ? "#000000" : "#ffffff";
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColour }]}>
        <StatusBar
          barStyle={this.props.theme.dark ? "light-content" : "dark-content"}
          backgroundColor={bgColour} />
        <View style={styles.top}>
          {this.renderGraph(this.state.GraphType, this.state.GraphPeriodType, this.state.SelectedData, this.state.PeriodStart, this.state.PeriodEnd)}
        </View>
        <View style={styles.bottom}>
          <AnalysisTabs
            ref={tabs => {this.tabs = tabs}}
            theme = {this.props.theme}
            updateGraph={this.updateGraph}
            symptoms={this.state.Symptoms}
            triggers={this.state.Triggers}
            treatments={this.state.Treatments}/>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  top: {
    flex: 12,
    width: "100%",
    flexDirection: "row",
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
    flex: 17,
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