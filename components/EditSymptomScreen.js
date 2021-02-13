import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, Button} from 'react-native';
import moment from "moment";

const today = moment().format("YYYY-MM-DD");

export default class SymptomsListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      Symptom: props.route.params.symptom
    };
  }

  updatedField = (value, key) => {
    this.state.Symptom[key] = value;
    console.log(this.state.Symptom);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            style={styles.nameInput}
            onChangeText={text => this.updatedField(text, 'name')}
            placeholder="Symptom name"
            underlineColorAndroid='cornflowerblue'
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    flex: 1,
    width: '100%',
    padding: 25
  },
  nameInput: {
    height: 60,
    fontSize: 24,
    padding: 10
  }
});