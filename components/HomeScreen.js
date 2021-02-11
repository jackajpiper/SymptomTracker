import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import moment from "moment";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SymptomsListScreen from './SymptomsListScreen.js';
import EditSymptomScreen from './EditSymptomScreen.js';

const today = moment().format("YYYY-MM-DD");
const Stack = createStackNavigator();

class MainScreen extends React.Component {
  render() {
    return (
        <View style={ styles.main }>
          <Text style={ styles.titleText }>Amy's Symptom Tracker</Text>
          <View style={ styles.buttonList }>
            {/* the background of these buttons could be a gradient, or a bunch of rainbow colours, or both */}
            <TouchableOpacity style={ styles.mainButton }
            onPress={() => this.props.navigation.navigate('Symptoms')}>
              <View>
                <Text style={ styles.mainButtonText }>Manage Symptoms</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.mainButton }
            onPress={() => this.props.navigation.navigate('Ingestants')}>
              <View>
                <Text style={ styles.mainButtonText }>Manage Ingestants</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.mainButton }
            onPress={() => this.props.navigation.navigate('Diary')}>
              <View>
                <Text style={ styles.mainButtonText }>Diary</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={ styles.mainButton }>
              <View>
                <Text style={ styles.mainButtonText }>Settings</Text>
              </View>
            </TouchableOpacity>
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
        <Stack.Screen name="EditSymptom" component={EditSymptomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    )
  }
}

const styles = StyleSheet.create({
  titleText: {
    marginTop: 60,
    marginBottom: 10,
    fontSize: 18
  },
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  buttonList: {
    width: '100%',
    alignItems: 'center'
  },
  mainButton: {
    width: '90%',
    height: 50,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    margin: 30
  },
  mainButtonText: {
    textAlign: 'center'
  }
});