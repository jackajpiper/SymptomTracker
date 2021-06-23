import _ from 'lodash';
import React from 'react';
import {ScrollView, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import moment from "moment";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Toast from 'react-native-simple-toast';


const today = moment().format("YYYY-MM-DD");

const Tab = createMaterialTopTabNavigator();

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

export default class AnalysisTabs extends React.Component {

  constructor(props) {
    super(props);

    this.updateGraph = this.props.updateGraph;

    let origin = { GraphType: "", GraphPeriodType: "", SelectedData: [] };

    this.state = {
      GraphType: "",
      GraphPeriodType: "",
      SelectedData: [],
      Origin: origin,
      refreshEnabled: false
    };
  }

  async componentDidMount() {
    this._mounted = true;
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
    let origin = {};
    origin.GraphType = this.state.GraphType;
    origin.GraphPeriodType = this.state.GraphPeriodType;
    origin.SelectedData = JSON.parse(JSON.stringify(this.state.SelectedData));
    this.setState({Origin: origin, refreshEnabled: false});
  }

  updateData = (key, value) => {
    this.setState({ [key]: value }, () => {
      let origin = this.state.Origin;

      if (origin.GraphType !== this.state.GraphType
        || origin.GraphPeriodType !== this.state.GraphPeriodType
        || JSON.stringify(origin.SelectedData) !== JSON.stringify(this.state.SelectedData)) {
        this.setState({refreshEnabled: true});
      } else {
        this.setState({refreshEnabled: false});
      }
    });
  }

  clickedRefresh = () => {
    if (this.state.GraphType.length && this.state.GraphPeriodType.length) {
      this.updateGraph(this.state.GraphType, this.state.GraphPeriodType, JSON.parse(JSON.stringify(this.state.SelectedData)));
      this.updateOrigin();
    } else {
      if (!this.state.GraphType.length) {
        Toast.show("Please select a graph type");
      } else if (!this.state.GraphPeriodType.length) {
        Toast.show("Please select a period");
      }
    }
  }

  RenderCheckboxes = (type) => {
    return this.props[type.toLowerCase() + "s"].map((symptom, index) => (
      <View key={symptom.id} style={styles.checkbox}>
        <BouncyCheckbox
          size={25}
          fillColor={shadeColor(symptom.colour, 40)}
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
      <View style={{display: "flex", flexDirection: "row", height: "100%"}}>
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
        <View style={{marginLeft: 30}}>
          {renderRadioButton("bar", "GraphType", "Bar chart", "#E7D5E1")}
          {renderRadioButton("line", "GraphType", "Line chart", "#FAEEC4")}
          {renderRadioButton("heat", "GraphType", "Heat map", "#C3D8D1")}
        </View>
      );
    };

    const RenderPeriodCheckboxes = () => {
      return (
        <View style={{marginLeft: 30}}>
          {renderRadioButton("week-average", "GraphPeriodType", "Week", "#E7D5E1")}
          {renderRadioButton("month-average", "GraphPeriodType", "Month", "#FAEEC4")}
          {renderRadioButton("year-average", "GraphPeriodType", "Year", "#C3D8D1")}
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
    textAlign: "center",
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
  }
});