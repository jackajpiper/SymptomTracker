import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Switch} from 'react-native';
import moment from "moment";
import AsyncManager from './AsyncManager';
import Toast from 'react-native-simple-toast';
import { ScrollView } from 'react-native-gesture-handler';

export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "Amy's",
      darkMode: false
    };
  }

  updateField = (field, value) => {
    let state = this.state;
    let origin = this.state.origin;
    this.setState({[field]: value}, () => {
      // this.setState({dirty: (
      //   this.state.name != this.state.origin.name ||
      //   this.state.darkMode != this.state.origin.darkMode
      // )})
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Customise name:</Text>
          <View style={{display: "flex", flexDirection: "row"}}>
            <TextInput
              style={[styles.nameInput]}
              onChangeText={text => this.updateField('name', text)}
              placeholder="Amy's"
              placeholderTextColor="#B4B4B9"
              underlineColorAndroid='cornflowerblue'
              value={this.state.name}
            />
            <View style={{display: "flex", justifyContent: "center"}}>
              <Text style={[styles.restOfName]}>Symptom Tracker</Text>
            </View>
          </View>
        </View>
          
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, {marginTop: 15}]}>Track severity?</Text>
          <Text style={[styles.fieldLabel, {marginBottom: 15}]}>(Show slider when creating a record)</Text>
          <Switch
            style={{alignSelf: "flex-start"}}
            trackColor={{ false: "#c6c6c6", true: "cornflowerblue" }}
            thumbColor={"#00ABEB"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(val) => {this.updateField("darkMode", val)}}
            value={this.state.darkMode}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: '100%',
    padding: 30
  },
  field: {
    paddingBottom: 30
  },
  fieldLabel: {
    color: 'grey',
    fontSize: 18
  },
  nameInput: {
    height: 60,
    fontSize: 20,
    marginRight: 10
  },
  restOfName: {
    fontSize: 20,
    alignSelf: "flex-start"
  }
});