import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, Switch} from 'react-native';
import {SliderHuePicker} from 'react-native-slider-color-picker';
import Toast from 'react-native-simple-toast';
import AsyncManager from './AsyncManager';
import ColourHelper from './ColourHelper';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function(props) {
  let theme = useTheme();
  return <EditTreatmentScreen {...props} theme={theme}/>
}

class EditTreatmentScreen extends Component {
  constructor(props) {
    super(props);

    this.theme = props.theme;
    this.isNew = !props.route.params.treatment.id;
    this.state = {
      isLoading: true,
      name: props.route.params.treatment.name,
      hue: props.route.params.treatment.hue,
      trackSlider: props.route.params.treatment.trackSlider,
      origin: props.route.params.treatment,
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
    if (!this.state.hue && this.state.hue !== 0) {
      return "Please select a colour";
    }
    return "";
  }

  onSubmit = async () => {
    var errors = this.validate();
    if (errors) {
      Toast.show(errors);
    } else {
      var treatment = this.state.origin;
      treatment.name = this.state.name;
      treatment.hue = this.state.hue;
      treatment.trackSlider = this.state.trackSlider;
      await this.updateTreatmentStorage(treatment);
      if (this.isNew) {
        this.props.navigation.goBack();
        Toast.show('Created');
      } else {
        Toast.show('Saved');
      }
    }
  }

  updateTreatmentStorage = async (treatment) => {
    await AsyncManager.setTreatment(treatment);
    this.setState({dirty: false});
  };

  onDelete = () => {
    Alert.alert(
      'Delete treatment?',
      'This will also delete ALL records of the treatment! Are you sure?',
      [
        { text: "Cancel", style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncManager.deleteTreatment(this.state.origin);
            this.props.navigation.goBack();
            Toast.show("Deleted");
          },
        },
      ]
    );
  }

  updateField = (field, value) => {
    this.setState({[field]: value}, () => {
      this.setState({dirty: (
        this.state.name != this.state.origin.name ||
        this.state.hue != this.state.origin.hue ||
        !!this.state.trackSlider != !!this.state.origin.trackSlider
      )})
    });
  }

  render() {
    const textColour = this.theme.dark ? "#ffffff" : "#000000";
    const fieldLabel = {
      color: this.theme.dark ? "#ffffff" : "grey",
      fontSize: 18
    }

    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={fieldLabel}>Name:</Text>
            <TextInput
              style={[styles.nameInput, {color: textColour}]}
              onChangeText={text => this.updateField('name', text)}
              placeholder="Treatment name"
              placeholderTextColor="#B4B4B9"
              underlineColorAndroid='cornflowerblue'
              value={this.state.name}
            />
          </View>
          
          <View style={styles.field}>
            <Text style={[fieldLabel, {marginBottom: 25}]}>Colour:</Text>
            <SliderHuePicker
                ref={view => {this.sliderHuePicker = view;}}
                oldColor={ColourHelper.getColourForMode(this.state.hue, false, true)}
                trackStyle={[{height: 12}]}
                thumbStyle={styles.thumb}
                useNativeDriver={true}
                onColorChange={(colour, end) => {end === 'end' ? this.updateField('hue', colour.h) : undefined}}
            />
          </View>
          
          <View style={styles.field}>
            <Text style={[fieldLabel, {marginTop: 15}]}>Track dosage?</Text>
            <Text style={[fieldLabel, {marginBottom: 15}]}>(Show slider when creating a record)</Text>
            <Switch
              style={{alignSelf: "flex-start"}}
              trackColor={{ false: "#c6c6c6", true: "cornflowerblue" }}
              thumbColor={"#00ABEB"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(val) => {this.updateField("trackSlider", val)}}
              value={this.state.trackSlider}
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
  }
});