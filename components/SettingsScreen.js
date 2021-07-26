import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, Switch} from 'react-native';
import { useTheme } from '@react-navigation/native';
import AsyncManager from './AsyncManager';

export default function(props) {
  let theme = useTheme();

  return <SettingsScreen {...props} theme={theme}/>
}

class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.setIsDarkMode = props.setIsDarkMode;
    this.state = {
      name: props.appName || "Amy's",
      darkMode: props.theme.dark
    };
  }

  updateField = (field, value) => {
    if (field === "darkMode") {
      this.setIsDarkMode(value);
    }
    if (field === "name") {
      AsyncManager.setAppName(value);
    }
    this.setState({[field]: value});
  }

  render() {
    const textColour = this.state.darkMode ? "#ffffff" : "#000000";
    const fieldLabel = {
      color: this.state.darkMode ? "#ffffff" : "grey",
      fontSize: 18
    }

    return (
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={fieldLabel}>Customise name:</Text>
          <View style={{display: "flex", flexDirection: "row"}}>
            <TextInput
              style={[styles.nameInput, {color: textColour}]}
              onChangeText={text => this.updateField('name', text)}
              placeholder="Amy's"
              placeholderTextColor="#B4B4B9"
              underlineColorAndroid='cornflowerblue'
              value={this.state.name}
            />
            <View style={{display: "flex", justifyContent: "center"}}>
              <Text style={[styles.restOfName, {color: textColour}]}>Symptom Tracker</Text>
            </View>
          </View>
        </View>
          
        <View style={styles.field}>
          <Text style={[fieldLabel, {marginBottom: 15}]}>Dark Mode</Text>
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