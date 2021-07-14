import _ from 'lodash';
import React from 'react';
import {ScrollView, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import moment from "moment";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Toast from 'react-native-simple-toast';
import DateTimePicker from '@react-native-community/datetimepicker';


const today = moment().format("YYYY-MM-DD");

const Tab = createMaterialTopTabNavigator();

export default class AnalysisTabs extends React.Component {

  constructor(props) {
    super(props);

    this.updateGraph = this.props.updateGraph;

    let origin = {
      GraphType: "",
      GraphPeriodRange: "",
      GraphPeriodType: "",
      SelectedData: [],
      ShowPeriodStart: false,
      ShowPeriodEnd: false,
      PeriodStart: new Date(),
      PeriodEnd: new Date(),
    };

    this.state = {
      GraphType: "",
      GraphPeriodRange: "",
      GraphPeriodType: "",
      SelectedData: [],
      ShowPeriodStart: false,
      ShowPeriodEnd: false,
      PeriodStart: new Date(),
      PeriodEnd: new Date(),
      Origin: origin,
      refreshEnabled: false
    };
  }

  async componentDidMount() {
    this._mounted = true;
  }

  enableRefresh = () => {
    !this.validate() && this.setState({refreshEnabled: true});
  }

  checkboxClicked = async (checked, id, type, name) => {
    let selectedData = this.state.SelectedData;

    let stringId = type+" "+id+" "+name;

    if (checked) {
      selectedData.push(stringId);
    } else {
      let index = selectedData.findIndex((val) => {
        return val===(stringId);
      });
      selectedData.splice(index, 1);
    }

    selectedData = selectedData.sort(function (data1, data2) {
      if (data1.split(' ')[2] > data2.split(' ')[2]) {
        return 1;
      } else {
        return -1;
      }
    })

    if (this._mounted = true) {
      this.updateData("SelectedData", selectedData);
    }
  };

  updateOrigin = () => {
    let origin = {
      GraphType: this.state.GraphType,
      GraphPeriodType: this.state.GraphPeriodType,
      GraphPeriodRange: this.state.GraphPeriodRange,
      SelectedData: JSON.parse(JSON.stringify(this.state.SelectedData)),
      PeriodStart: this.state.PeriodStart,
      PeriodEnd: this.state.PeriodEnd
    };
    this.setState({Origin: origin, refreshEnabled: false});
  }

  updateData = (key, value) => {
    this.setState({ [key]: value }, () => {
      let origin = this.state.Origin;

      if (origin.GraphType !== this.state.GraphType
        || origin.GraphPeriodType !== this.state.GraphPeriodType
        || JSON.stringify(origin.SelectedData) !== JSON.stringify(this.state.SelectedData)
        || origin.GraphPeriodRange !== this.state.GraphPeriodRange
        || origin.PeriodStart !== this.state.PeriodStart
        || origin.PeriodEnd !== this.state.PeriodEnd) {
        this.setState({refreshEnabled: true});
      } else {
        this.setState({refreshEnabled: false});
      }
    });
  }

  validate = () => {
    let message = "";

    if (!this.state.GraphType.length) {
      message = "Please select a graph type";
    } else if (!this.state.GraphPeriodRange.length) {
      message = "Please select a period range";
    } else if (!this.state.GraphPeriodType.length) {
      message = "Please select a period";
    } else if (this.state.GraphType === "heat" && this.state.GraphPeriodType.includes("all")) {
      message = "Heat graph can only show average data. Please change the period";
    }

    return message;
  }

  clickedRefresh = () => {
    let error = this.validate();
    if (error) {
      Toast.show(error);
      return;
    }
    let start = this.state.GraphPeriodRange === "between-dates"
      ? this.state.PeriodStart
      : null;
    let end = this.state.GraphPeriodRange === "between-dates"
      ? this.state.PeriodEnd
      : null;

    this.updateGraph(
      this.state.GraphType,
      this.state.GraphPeriodType,
      JSON.parse(JSON.stringify(this.state.SelectedData)),
      start,
      end
    );
    this.updateOrigin();
  }

  RenderCheckboxes = (type) => {
    return this.props[type.toLowerCase() + "s"].map((symptom, index) => (
      <View key={symptom.id} style={styles.checkbox}>
        <BouncyCheckbox
          size={25}
          fillColor={symptom.colour}
          unfillColor="lightgrey"
          text={symptom.name}
          iconStyle={{ borderColor: "#444444" }}
          textStyle={{ marginLeft: -10 }}
          onPress={(checked) => {this.checkboxClicked(checked, symptom.id, type, symptom.name)}}
        />
      </View>
    ));
  }

  RenderDataTab = () => {
    return (
      <View style={{display: "flex", flexDirection: "row", height: "100%", padding: 10, paddingTop: 0}}>
        <View style={{flex: 1}}>
          <Text style={styles.dataTitle}>Symptoms:</Text>
          <ScrollView>
            {this.RenderCheckboxes("Symptom")}
          </ScrollView>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.dataTitle}>Triggers:</Text>
          <ScrollView>
            {this.RenderCheckboxes("Trigger")}
          </ScrollView>
        </View>
        <View style={{flex: 1, display: "flex", flexDirection: "column"}}>
          <Text style={styles.dataTitle}>Treatments:</Text>
          <ScrollView style={{flex: 1}}>
            {this.RenderCheckboxes("Treatment")}
          </ScrollView>
          <View style={{height: 65}}></View>
        </View>
      </View>
    );
  }

  render() {
    const renderRadioButton = (value, stateName, text, colour) => {
      return (
        <View style={styles.checkbox}>
          <BouncyCheckbox
            size={25}
            fillColor={colour}
            unfillColor="lightgrey"
            isChecked={this.state[stateName] === value}
            disableBuiltInState
            text={text}
            iconStyle={{ borderColor: "#444444" }}
            textStyle={{ marginLeft: -10 }}
            onPress={(checked) => {this.updateData(stateName, value)}}
          />
        </View>
      );
    }

    const RenderGraphCheckboxes = () => {
      return (
        <View style={{marginLeft: 10}}>
          <Text style={styles.dataTitle}>Graph Type</Text>
          {renderRadioButton("bar", "GraphType", "Bar chart", "#E7D5E1")}
          {renderRadioButton("line", "GraphType", "Line chart", "#FAEEC4")}
          {renderRadioButton("heat", "GraphType", "Heat map", "#C3D8D1")}
        </View>
      );
    };

    const dateField = (name) => {
      let showName = "Show"+name;
      let enabled = this.state.GraphPeriodRange === "between-dates";
      return (
        <View style={{ marginTop: 10, paddingLeft: 20 }}>
          <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={()=> {this.setState({[showName]: true})}} disabled={!enabled}>
            <Text style={[styles.dateTime, {color: enabled ? 'black': 'grey', borderBottomColor: enabled ? 'cornflowerblue': 'grey' }]}>
              {moment(this.state[name]).format("DD/MM/YYYY")}
            </Text>
          </TouchableOpacity>
          {this.state[showName] && (
            <DateTimePicker
              value={this.state[name]}
              mode={"date"}
              display="default"
              onChange={(event, value) => {this.setState({[showName]: false}); value && this.updateData(name, value);}}
            />
          )}
        </View>
      )
    };

    const RenderPeriodCheckboxes = () => {
      return (
        <View style={{display: "flex", flexDirection: "row", paddingLeft: 10}}>
          <View style={{flex: 1}}>
            <Text style={styles.dataTitle}>Period & range:</Text>
            {renderRadioButton("all-data", "GraphPeriodRange", "All Data", "#E7D5E1")}
            {renderRadioButton("between-dates", "GraphPeriodRange", "Between:", "#FAEEC4")}
            {dateField("PeriodStart")}
            {dateField("PeriodEnd")}
          </View>
          <View style={{flex: 1, margin: 5}}>
            {renderRadioButton("week-all", "GraphPeriodType", "All Weeks", "#E7D5E1")}
            {renderRadioButton("week-average", "GraphPeriodType", "Average Week", "#FAEEC4")}
            {renderRadioButton("month-all", "GraphPeriodType", "All Months", "#C3D8D1")}
            {renderRadioButton("month-average", "GraphPeriodType", "Average Month", "#E7D5E1")}
            {renderRadioButton("year-all", "GraphPeriodType", "All Years", "#FAEEC4")}
            {renderRadioButton("year-average", "GraphPeriodType", "Average Year", "#C3D8D1")}
          </View>
        </View>
      );
    };

    return (
      <View style={{height: "100%", width: "100%"}}>
        <Tab.Navigator>
          <Tab.Screen name="Graph" children={() => <RenderGraphCheckboxes/>} />
          <Tab.Screen name="Period" children={() => <RenderPeriodCheckboxes/>} />
          <Tab.Screen name="Data" children={() => <this.RenderDataTab/>} />
        </Tab.Navigator>
        <View style={styles.floatyBoi}>
          <TouchableOpacity
            style={[styles.refreshButton,
              {backgroundColor: this.state.refreshEnabled ? "#00ABEB" : "white", borderColor: this.state.refreshEnabled ? "black" : "lightgrey"}]}
            onPress={this.clickedRefresh}
            disabled={!this.state.refreshEnabled}>
            <Text
              style={[styles.refreshText, {color: this.state.refreshEnabled ? "white" : "grey"}]}>
              Refresh data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "hidden"
  },
  checkbox: {
    marginTop: 8
  },
  dataTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold"
  },
  floatyBoi: {
    position: "absolute",
    bottom: 0,
    right: 0,
    height: 65,
    width: "33%",
    paddingBottom: 10,
    paddingRight: 10
  },
  refreshButton: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    margin: 10,
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 20,
    borderWidth: 2
  },
  refreshText: {
    textAlign: 'center',
    fontSize: 16
  },
  dateTime: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'cornflowerblue',
    color: 'black',
    paddingRight: 30
  }
});