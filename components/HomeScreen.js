import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import moment from "moment";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SymptomsListScreen from './SymptomsListScreen.js';
import EditSymptomScreen from './EditSymptomScreen.js';
import {LinearGradient} from 'expo-linear-gradient';

const today = moment().format("YYYY-MM-DD");
const Stack = createStackNavigator();

class MainScreen extends React.Component {

  renderMenuButton = (title, target, colour) => {
    return (
      <LinearGradient 
        colors={['white', colour]}
        style = { styles.mainButton }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity onPress={() => this.props.navigation.navigate(target)}>
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
            {this.renderMenuButton("Manage Ingestants", "Ingestants", "#FAEEC4")}
            {this.renderMenuButton("Diary", "Diary", "#C3D8D1")}
            {this.renderMenuButton("Settings", "Settings", "#F9E2E8")}
          </View>
        </View>
      );
  }
}

class IngestantsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{fontSize: 24}}>Ingestants Screen</Text>
      </View>
    );
  }
}

class DiaryScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{fontSize: 24}}>Diary Screen</Text>
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

  render() {
    return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={MainScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Symptoms" component={SymptomsListScreen} />
        <Stack.Screen name="Ingestants" component={IngestantsScreen} />
        <Stack.Screen name="Diary" component={DiaryScreen} />
        <Stack.Screen name="EditSymptom" component={EditSymptomScreen} options={({ route }) => ({ title: route.params.symptom.name })} />
      </Stack.Navigator>
    </NavigationContainer>
    )
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    paddingTop: 70,
    paddingBottom: 30
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  buttonList: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  mainButton: {
    width: '90%',
    height: 60,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    margin: 20
  },
  mainButtonText: {
    color: 'black',
    marginLeft: 16,
    fontSize: 16,
    textAlign: 'left'
  }
});