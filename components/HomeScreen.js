import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import moment from "moment";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SymptomsListScreen from './SymptomsListScreen.js';
import TreatmentsListScreen from './TreatmentsListScreen.js';
import TriggersListScreen from './TriggersListScreen.js';
import EditTriggerScreen from './EditTriggerScreen.js';
import EditTreatmentScreen from './EditTreatmentScreen.js';
import EditSymptomScreen from './EditSymptomScreen.js';
import DiaryScreen from './DiaryScreen.js';
import {LinearGradient} from 'expo-linear-gradient';

const today = moment().format("YYYY-MM-DD");
const Stack = createStackNavigator();

class MainScreen extends React.Component {

  renderMenuButton = (title, target, colour) => {
    return (
      <LinearGradient 
        colors={['white', colour]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton} onPress={() => this.props.navigation.navigate(target)}>
          <Text style={[styles.mainButtonText]}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  render() {
    return (
        <View style={ styles.main }>
          <Text style={ styles.titleText }>Amy's Symptom Tracker</Text>
          <View style={ styles.buttonList }>
            {this.renderMenuButton("Manage Symptoms", "Symptoms", "#E7D5E1")}
            {this.renderMenuButton("Manage Triggers", "Triggers", "#FAEEC4")}
            {this.renderMenuButton("Manage Treatments", "Treatments", "#C3D8D1")}
            {this.renderMenuButton("Diary", "Diary", "#F9D5C7")}
            {this.renderMenuButton("Settings", "Settings", "#F9E2E8")}
          </View>
        </View>
      );
  }
}

class SettingsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{fontSize: 24}}>Settings Screen</Text>
      </View>
    );
  }
}

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  editTitle = (route, obj) => {
    if (route.params[obj].name) {
      return "Edit " + route.params[obj].name;
    } else {
      return "Create New " + (obj.charAt(0).toUpperCase() + obj.slice(1));
    }
  }

  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={MainScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Symptoms" component={SymptomsListScreen} />
        <Stack.Screen name="Treatments" component={TreatmentsListScreen} />
        <Stack.Screen name="Triggers" component={TriggersListScreen} />
        <Stack.Screen name="Diary" component={DiaryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditSymptom" component={EditSymptomScreen} options={({ route }) => ({ title: this.editTitle(route, "symptom") })} />
        <Stack.Screen name="EditTreatment" component={EditTreatmentScreen} options={({ route }) => ({ title: this.editTitle(route, "treatment") })} />
        <Stack.Screen name="EditTrigger" component={EditTriggerScreen} options={({ route }) => ({ title: this.editTitle(route, "trigger") })} />
      </Stack.Navigator>
    )
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20
  },
  buttonList: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 20
  },
  buttonContainer: {
    width: '90%',
    height: 65,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    margin: 20,
    borderRadius:10
  },
  mainButtonText: {
    color: 'black',
    marginLeft: 16,
    fontSize: 16,
    textAlign: 'left'
  },
  mainButton: {
    height: "100%",
    flexDirection: 'row',
    alignItems: 'center',
  }
});