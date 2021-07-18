import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, FlatList} from 'react-native';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import ColourHelper from './ColourHelper';
import { FloatingAction } from "react-native-floating-action";

const today = moment().format("YYYY-MM-DD");

const actionColour = "#00a0db";
const actions = [
  {
    text: "New Symptom",
    name: "bt_add_symptom",
    color: actionColour,
    position: 1
  }
];

export default class SymptomsListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      Symptoms: []
    };
  }

  async componentDidMount() {
    setTimeout(async () => {
      let symptoms = await AsyncManager.getSymptoms();
      this.setState({ 
        isLoading: false,
        Symptoms: symptoms
      });
    }, 0);

    this.willFocusListener = this.props.navigation.addListener('focus', async () => {
      var pollResult = await AsyncManager.pollUpdates("SymptomsList", "symptoms");
      if(pollResult.Symptoms) {
        this.setState({Symptoms: pollResult.Symptoms});
      }
    });
  }

  componentWillUnmount = () => {
    if(this.willFocusListener && typeof this.willFocusListener.remove === "function") {
      this.willFocusListener.remove();
    };
  }

  onAddPress = (btn) => {
    if (btn === "bt_add_symptom") {
      let symptom = {
        id: 0,
        name: "",
        colour: ""
      }
      this.props.navigation.navigate('EditSymptom', { symptom: symptom });
    }
  }

  onSymptomPress = (symptom) => {
    this.props.navigation.navigate('EditSymptom', { symptom: symptom });
  }

  renderItem = ({item}) => {
    let colour = ColourHelper.getColourForMode(item.hue, false);
    return (
      <LinearGradient 
        colors={['white', colour]}
        style = { styles.container }
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity onPress={() => this.onSymptomPress(item)} style={styles.item}>
          <Text style={[styles.itemText]}>{item.name}</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  };

  render() {
    if(this.state.isLoading) {
      return (
        <View style={[styles.spinner]}>
          <ActivityIndicator size="large" color="cornflowerblue" />
        </View>
      )
    } else {
      return (
        <View style={styles.container}>
          <FlatList
            data={this.state.Symptoms}
            renderItem={this.renderItem}
            keyExtractor={item => item.id.toString()}
          />
          <FloatingAction
            actions={actions}
            color={"#00ABEB"}
            onPressItem={(btn) => this.onAddPress(btn)}
          />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%"
  },
  item: {
    height: 70,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row'
  },
  itemText: {
    color: 'black',
    marginLeft: 16,
    fontSize: 16,
    textAlign: 'left'
  },
  container: {
    flex: 1,
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});