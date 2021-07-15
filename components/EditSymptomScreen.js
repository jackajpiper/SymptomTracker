import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard} from 'react-native';
import {SliderHuePicker} from 'react-native-slider-color-picker';
import Toast from 'react-native-simple-toast';
import AsyncManager from './AsyncManager';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

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

    this.isNew = !props.route.params.symptom.id;
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

  componentDidMount = () => {
    this.updateHeader();
  }

  updateHeader = () => {
    let header = !this.state.origin.id
      ? <View style={{flex: 1, flexDirection: "row", paddingTop: 15}}>
          <TouchableOpacity style={{paddingRight: 25}} onPress={() => {this.onSubmit(); Keyboard.dismiss()}}>
            <FontAwesome name="save" size={28} color="#009ad4" />
          </TouchableOpacity>
        </View>
      : <View style={{flex: 1, flexDirection: "row", paddingTop: 15}}>
          <TouchableOpacity style={{paddingRight: 25}} onPress={this.onDelete}>
            <AntDesign name="delete" size={28} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={{paddingRight: 25}} onPress={() => {this.onSubmit(); Keyboard.dismiss()}}>
            <FontAwesome name="save" size={28} color="#009ad4" />
          </TouchableOpacity>
        </View>
    this.props.navigation.setOptions({
      headerRight: () => header
    });
  }

  validate = () => {
    if (!this.state.name) {
      return "Please select a name";
    }
    if (!this.state.colour) {
      return "Please select a colour";
    }
    return "";
  }

  onSubmit = async () => {
    var errors = this.validate();
    if (errors) {
      Toast.show(errors);
    } else {
      var symptom = this.state.origin;
      symptom.name = this.state.name;
      symptom.colour = this.state.colour;
      await this.updateSymptomStorage(symptom);
      if (this.isNew) {
        this.props.navigation.goBack();
        Toast.show('Created');
      } else {
        Toast.show('Saved');
      }
    }
  }

  updateSymptomStorage = async (symptom) => {
    await AsyncManager.setSymptom(symptom);
    this.setState({dirty: false});
  };

  onDelete = () => {
    Alert.alert(
      'Delete symptom?',
      'This will also delete ALL records of the symptom! Are you sure?',
      [
        { text: "Cancel", style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncManager.deleteSymptom(this.state.origin);
            this.props.navigation.goBack();
            Toast.show("Deleted");
          },
        },
      ]
    );
  }

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
              placeholderTextColor="#B4B4B9"
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
                onColorChange={(colour, end) => {end === 'end' ? this.updateField('colour', HSLToHex(colour.h, 100, 85)) : undefined}}
            />
          </View>
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