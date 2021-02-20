import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TextInput, Button, TouchableOpacity} from 'react-native';
import moment from "moment";
import {SliderHuePicker} from 'react-native-slider-color-picker';
import {LinearGradient} from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

const today = moment().format("YYYY-MM-DD");

function HSLToHex(h,s,l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0, 
      b = 0; 

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
};

export default class SymptomsListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      name: props.route.params.symptom.name,
      colour: props.route.params.symptom.colour,
      origin: props.route.params.symptom,
      dirty: false
    };

    this.props.navigation.addListener('beforeRemove', (e) => {
      if (this.state.dirty) {
        e.preventDefault();
  
        Alert.alert(
          'Discard changes?',
          'You have unsaved changes.',
          [
            { text: "Don't leave", style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                this.props.navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });
  }

  onSubmit = () => {
    var symptom = this.state.origin;
    symptom.name = this.state.name;
    symptom.colour = this.state.colour;
    this.updateSymptomStorage(symptom);
  }

  updateSymptomStorage = async (symptom) => {
    let symptoms = [];
    try {
      let storedSymptoms = await AsyncStorage.getItem('Symptoms');
      if (storedSymptoms !== null) {
        symptoms = JSON.parse(storedSymptoms);
      }

      let symptomExists = false;
      for(let i=0; i<symptoms.length; i++) {
        if(symptoms[i].id === symptom.id) {
          symptomExists = true;
          symptoms[i] = symptom;
        }
      }
      if(!symptomExists) {
        symptoms.push(symptom);
      }

      function compareSymptoms(s1, s2) {
        if(s1.name > s2.name) return 1;
        else if(s1.name < s2.name) return -1;
        else return 0;
      }
      symptoms.sort(compareSymptoms);

      await AsyncStorage.setItem('Symptoms', JSON.stringify(symptoms));
      this.setState({dirty: false});
      Toast.show('Saved!');
    } catch (error) {
      console.log(error);
    }
  };

  updateField = (field, value) => {
    let state = this.state;
    let origin = this.state.origin;
    this.setState({[field]: value}, () => {
      this.setState({dirty: (this.state.name != this.state.origin.name || this.state.colour != this.state.origin.colour)})
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name:</Text>
            <TextInput
              style={styles.nameInput}
              onChangeText={text => this.updateField('name', text)}
              placeholder="Symptom name"
              underlineColorAndroid='cornflowerblue'
              value={this.state.name}
            />
          </View>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, {marginBottom: 25}]}>Colour:</Text>
            <SliderHuePicker
                ref={view => {this.sliderHuePicker = view;}}
                oldColor={this.state.colour}
                trackStyle={[{height: 12}]}
                thumbStyle={styles.thumb}
                useNativeDriver={true}
                onColorChange={(colour, end) => {end === 'end' ? this.updateField('colour', HSLToHex(colour.h, 30, 60)) : undefined}}
            />
          </View>

          <LinearGradient 
            colors={['white', this.state.dirty ? this.state.colour : 'grey']}
            style={styles.buttonContainer}
            start={{ x: 0.4, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}>

            <TouchableOpacity style={styles.mainButton} onPress={this.onSubmit} disabled={!this.state.dirty}>
              <Text style={[styles.mainButtonText, {color: this.state.dirty ? 'black' : 'grey'}]}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    padding: 25,
    paddingTop: 35
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
    fontSize: 20
  },
  thumb: {
      width: 20,
      height: 20,
      borderColor: 'white',
      borderWidth: 1,
      borderRadius: 10,
      shadowColor: 'black',
      shadowOffset: {
          width: 0,
          height: 2
      },
      shadowRadius: 2,
      shadowOpacity: 0.35,
  },
  buttonContainer: {
    position: 'absolute',
    bottom:20,
    right: 20,
    width: '60%',
    height: 65,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius:10,
    alignSelf: "flex-end",
  },
  mainButtonText: {
    color: 'black',
    marginLeft: 16,
    fontSize: 16,
    textAlign: 'left',
  },
  mainButton: {
    height: "100%",
    flexDirection: 'row',
    alignItems: 'center',
  }
});