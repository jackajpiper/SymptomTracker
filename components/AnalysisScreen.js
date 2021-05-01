import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

export default class AnalysisScreen extends Component {
  
  render() {
    return (
      <View style={ styles.tab }>
        <Text>There's going to be charts and stuff here. For analysis purposes</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  }
});