import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, Switch} from 'react-native';
import {SliderHuePicker} from 'react-native-slider-color-picker';
import Toast from 'react-native-simple-toast';
import AsyncManager from './AsyncManager';
import ColourHelper from './ColourHelper';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

export default class TriggersListScreen extends Component {
  constructor(props) {
    super(props);

    this.isNew = !props.route.params.trigger.id;
    this.state = {
      isLoading: true,
      name: props.route.params.trigger.name,
      hue: props.route.params.trigger.hue,
      trackSlider: props.route.params.trigger.trackSlider,
      origin: props.route.params.trigger,
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
      var trigger = this.state.origin;
      trigger.name = this.state.name;
      trigger.hue = this.state.hue;
      trigger.trackSlider = this.state.trackSlider;
      await this.updateTriggerStorage(trigger);
      if (this.isNew) {
        this.props.navigation.goBack();
        Toast.show('Created');
      } else {
        Toast.show('Saved');
      }
    }
  }

  updateTriggerStorage = async (trigger) => {
    await AsyncManager.setTrigger(trigger);
    this.setState({dirty: false});
  };

  onDelete = () => {
    Alert.alert(
      'Delete trigger?',
      'This will also delete ALL records of the trigger! Are you sure?',
      [
        { text: "Cancel", style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncManager.deleteTrigger(this.state.origin);
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
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name:</Text>
            <TextInput
              style={styles.nameInput}
              onChangeText={text => this.updateField('name', text)}
              placeholder="Trigger name"
              placeholderTextColor="#B4B4B9"
              underlineColorAndroid='cornflowerblue'
              value={this.state.name}
            />
          </View>
          
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, {marginBottom: 25}]}>Colour:</Text>
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
            <Text style={[styles.fieldLabel, {marginTop: 15}]}>Track amount?</Text>
            <Text style={[styles.fieldLabel, {marginBottom: 15}]}>(Show slider when creating a record)</Text>
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