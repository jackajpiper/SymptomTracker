import _ from 'lodash';
import React from 'react';
import {Alert, TextInput, ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-simple-toast';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


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

    this.state = {
      Symptoms: this.props.symptoms || [],
      SymptomInstances: this.props.symptomInstances || [],
      GraphType: "",
      GraphPeriodType: "",
      SelectedData: []
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
      this.updateGraphData("SelectedData", selectedData);
    }
  };

  updateGraphData = (key, value) => {
    this.setState({ [key]: value }, () => {
      console.log("erojgnborehorjhbpn", this.state.GraphType, this.state.GraphPeriodType, this.state.SelectedData);
      this.updateGraph(this.state.GraphType, this.state.GraphPeriodType, this.state.SelectedData);
    });
  }

  RenderSymptomCheckboxes = () => {
    return this.props.symptoms.map((symptom, index) => (
      <View key={symptom.id} style={styles.checkbox}>
        <BouncyCheckbox
          size={25}
          fillColor={shadeColor(symptom.colour, 40)}
          unfillColor="lightgrey"
          text={symptom.name}
          iconStyle={{ borderColor: "#444444" }}
          textStyle={{ marginLeft: -10 }}
          onPress={(checked) => {this.checkboxClicked(checked, symptom.id, "Symptom", symptom.name)}}
        />
      </View>
    ));
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
            onPress={(checked) => {this.updateGraphData(stateName, value)}}
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
      <Tab.Navigator>
        <Tab.Screen name="Graph" children={() => <RenderGraphCheckboxes/>} />
        <Tab.Screen name="Period" children={() => <RenderPeriodCheckboxes/>} />
        <Tab.Screen name="Data" children={() => <this.RenderSymptomCheckboxes/>} />
      </Tab.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "hidden"
  }
});