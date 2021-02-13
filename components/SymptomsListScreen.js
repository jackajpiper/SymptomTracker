import _ from 'lodash';
import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View, Text, TouchableOpacity, FlatList} from 'react-native';
import moment from "moment";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LinearGradient} from 'expo-linear-gradient';

const today = moment().format("YYYY-MM-DD");

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

const testSymptoms = [
  { id: 1, name: 'Headache', colour: '#ff00ff' },
  { id: 2, name: 'Nosebleed', colour: '#0000ff' },
  { id: 3, name: 'Lethargy', colour: '#ffaabb' },
  { id: 4, name: 'Wisdom', colour: '#ffff00' },
  { id: 5, name: 'Nosebleed', colour: '#0000ff' },
  { id: 6, name: 'Lethargy', colour: '#ffaabb' },
  { id: 7, name: 'Wisdom', colour: '#ffff00' },
  { id: 8, name: 'Nosebleed', colour: '#0000ff' },
  { id: 9, name: 'Lethargy', colour: '#ffaabb' },
  { id: 10, name: 'Headache', colour: '#ff00ff' },
  { id: 11, name: 'Nosebleed', colour: '#0000ff' },
  { id: 12, name: 'Nosebleed', colour: '#0000ff' },
  { id: 13, name: 'Lethargy', colour: '#ffaabb' },
  { id: 14, name: 'Wisdom', colour: '#ffff00' },
  { id: 15, name: 'Nosebleed', colour: '#0000ff' },
  { id: 16, name: 'Lethargy', colour: '#ffaabb' },
  { id: 17, name: 'Wisdom', colour: '#ffff00' },
  { id: 18, name: 'Nosebleed', colour: '#0000ff' },
  { id: 19, name: 'Lethargy', colour: '#ffaabb' },
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
    await this.loadItems();
    this.setState({ 
      isLoading: false
    });
  }

  async loadItems() {
    return AsyncStorage.getItem('Symptoms').then(
      (value) => {
        var Symptoms = JSON.parse(value);
        this.setState({
          'Symptoms': Symptoms
        });
      }
    )
  }

  onSymptomPress = (symptom) => {
    this.props.navigation.navigate('EditSymptom', { symptom: symptom });
  }

  renderItem = ({item}) => {
    let colour = item.colour;
    let lighterColour = shadeColor(colour, 60);

    return (
      <LinearGradient 
        colors={['white', lighterColour]}
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
        <FlatList
          data={this.state.Symptoms}
          renderItem={this.renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )
    }
  }
}

const styles = StyleSheet.create({
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