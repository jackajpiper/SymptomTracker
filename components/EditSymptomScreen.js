import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import moment from "moment";

const today = moment().format("YYYY-MM-DD");

export default class SymptomsListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{fontSize: 24}}>Edit Symptom</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
});