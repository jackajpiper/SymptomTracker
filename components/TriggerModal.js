import _ from 'lodash';
import React from 'react';
import {Alert, TextInput, ScrollView, StyleSheet, View, Text, TouchableOpacity, Keyboard} from 'react-native';
import moment from "moment";
import AsyncManager from './AsyncManager';
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-simple-toast';
import Slider from '@react-native-community/slider';
import ColourHelper from './ColourHelper';

export default class TriggerModal extends React.Component {

  constructor(props) {
    super(props);

    let data = this.props.data;
    let origin = {
      triggerId: data.typeId || undefined,
      date: data.date ? new Date(data.date) : new Date(),
      startTime: data.startTime ? moment(data.startTime, "HH:mm").toDate() : new Date(),
      endTime: data.endTime ? moment(data.endTime, "HH:mm").toDate() : new Date(),
      notes: data.notes || ""
    };

    this.id = data.id;
    this.isNew = !data.id;
    this.triggers = this.props.triggers;
    this.items = this.triggers.map(function(x) {
      return {
        label: x.name,
        value: x.id
      };
    });

    let trigger = this.triggers.find(x => x.id === origin.triggerId);
    this.colour = this.id
      ? ColourHelper.getColourForMode(trigger.hue, false, true)
      : "cornflowerblue";
    this.showSlider = this.id
      ? trigger.trackSlider
      : false;

    this.state = {
      triggerId: origin.triggerId,
      date: origin.date,
      startTime: origin.startTime,
      endTime: origin.endTime,
      notes: origin.notes,
      origin: JSON.parse(JSON.stringify(origin)),
      showDate: false,
      showStartTime: false,
      showEndTime: false,
      dirty: false,
      colour: this.colour,
      showSlider: this.showSlider
    };
  }

  updateField = (field, value) => {
    if (field === 'triggerId') {
      let trigger = this.triggers.find(trigger => trigger.id === value);
      let colour = value
        ? ColourHelper.getColourForMode(trigger.hue, false, true)
        : "cornflowerblue";
      this.setState({colour: colour, showSlider: trigger && trigger.trackSlider});
    }
    if (field === 'startTime') {
      if (moment(value, "HH:mm").isAfter(moment(this.state.endTime, "HH:mm"))) {
        this.setState({endTime: value});
      }
    }
    if (field === 'endTime') {
      if (moment(value, "HH:mm").isBefore(moment(this.state.startTime, "HH:mm"))) {
        this.setState({startTime: value});
      }
    }
    this.setState({[field]: value}, () => {
      this.setState({dirty: this.isDirty()});
    });
  }
  
  isDirty = () => {
    let origin = this.state.origin;
    let state = this.state;
    if (state.triggerId !== origin.triggerId
      || !moment(state.date).isSame(moment(origin.date))
      || !moment(state.startTime).isSame(moment(origin.startTime))
      || !moment(state.endTime).isSame(moment(origin.endTime))
      || state.notes !== origin.notes) {
        return true;
    }
    return false;
  }

  validate = () => {
    if (!this.state.triggerId) {
      return "Please select a trigger";
    }
    return "";
  }

  getData = () => {
    return {
      id: this.id,
      typeId: this.state.triggerId,
      date: moment(this.state.date).format("YYYY-MM-DD"),
      startTime: moment(this.state.startTime).format("HH:mm"),
      endTime: moment(this.state.endTime).format("HH:mm"),
      notes: this.state.notes
    }
  }

  onSubmit = async () => {
    var errors = this.validate();
    if (errors) {
      Toast.show(errors);
    } else {
      let data = this.getData();
      
      await AsyncManager.setTriggerInstance(data);

      this.props.triggerPoll("Calendar", "trigger");
      this.props.toggleModal("trigger", false);
      Toast.show("Saved!");
    }
  }

  onDelete = () => {
    Alert.alert(
      'Delete?',
      'This will delete this trigger record.',
      [
        { text: "Cancel", style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncManager.deleteTriggerInstance(this.id);
            this.props.triggerPoll();
            this.props.toggleModal("trigger", false);
            Toast.show("Deleted");
          },
        },
      ]
    );
  }

  formatDateTime = (date, type) => {
    let momentDate = moment(date);
    if (type === "date") {
      let dateString = momentDate.format("DD/MM/YYYY (dddd)");
      return dateString;
    } else if (type === "time") {
      return momentDate.format("HH:mm");
    }
  }

  render() {
    let underlineColour = this.state.colour;
    let pickerStyles = StyleSheet.create({
      inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
      },
      inputAndroid: {
        height: 50,
        fontSize: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: underlineColour,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
      },
      placeholder: {
        color: '#B4B4B9'
      }
    });
    let dynamicStyles = {
        dateTime: {
        fontSize: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: underlineColour,
        color: 'black',
        paddingRight: 30
      }
    }

    let buttons;
    let size = 40;
    if (this.isNew) {
      buttons = 
        <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
          <TouchableOpacity style={{borderWidth: 2, padding: 5, borderRadius: 4, borderColor: "#009ad4"}} onPress={() => {this.onSubmit(); Keyboard.dismiss()}}>
            <FontAwesome name="save" size={size} color="#009ad4" />
          </TouchableOpacity>
        </View>
    } else {
      buttons =
        <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
          <TouchableOpacity style={{borderWidth: 2, padding: 5, borderRadius: 4, borderColor: "red", marginRight: 40}} onPress={this.onDelete}>
            <AntDesign name="delete" size={size} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={{borderWidth: 2, padding: 5, borderRadius: 4, borderColor: "#009ad4"}} onPress={() => {this.onSubmit(); Keyboard.dismiss()}}>
            <FontAwesome name="save" size={size} color="#009ad4" />
          </TouchableOpacity>
        </View>
    }

    return (
      <View style={formStyles.container}>
        <View style={formStyles.form}>
          <TouchableOpacity style={formStyles.closeBtn} onPress={() => { this.props.toggleModal("trigger", false) }} >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <ScrollView style={formStyles.fields}>
            <View style={formStyles.field}>
              <Text style={formStyles.fieldLabel}>Trigger:</Text>
              <RNPickerSelect
                onValueChange={value => {this.updateField("triggerId", value)}}
                value={this.state.triggerId}
                style={pickerStyles}
                useNativeAndroidPickerStyle={false}
                placeholder={{ label: "Select a trigger..." }}
                Icon={() => {
                  return <Ionicons name="chevron-down" size={24} color="black" style={{paddingTop: 10}}/>;
                }}
                items={this.items}
              />
            </View>
            <View style={formStyles.field}>
              <Text style={formStyles.fieldLabel}>Date:</Text>
              <TouchableOpacity style={formStyles.basicInput} onPress={()=> {this.setState({showDate: true})}}>
                <Text style={dynamicStyles.dateTime}>
                  {this.formatDateTime(this.state.date, "date")}
                </Text>
              </TouchableOpacity>
              {this.state.showDate && (
                <DateTimePicker
                  value={this.state.date}
                  mode={"date"}
                  is24Hour={true}
                  display="default"
                  onChange={(event, value) => {this.setState({showDate: false}); value && this.updateField("date", value)}}
                />
              )}
            </View>
            <View style={formStyles.rowField}>
              <View style={formStyles.columnView}>
                <Text style={formStyles.fieldLabel}>Start Time:</Text>
                <TouchableOpacity style={formStyles.basicInput} onPress={()=> {this.setState({showStartTime: true})}}>
                  <Text style={dynamicStyles.dateTime}>
                    {this.formatDateTime(this.state.startTime, "time")}
                  </Text>
                </TouchableOpacity>
                {this.state.showStartTime && (
                  <DateTimePicker
                    value={this.state.startTime}
                    mode={"time"}
                    is24Hour={true}
                    display="default"
                    onChange={(event, value) => {this.setState({showStartTime: false}); value && this.updateField("startTime", value)}}
                  />
                )}
              </View>
              <View style={formStyles.columnView}>
                <Text style={formStyles.fieldLabel}>End Time:</Text>
                <TouchableOpacity style={formStyles.basicInput} onPress={()=> {this.setState({showEndTime: true})}}>
                  <Text style={dynamicStyles.dateTime}>
                    {this.formatDateTime(this.state.endTime, "time")}
                  </Text>
                </TouchableOpacity>
                {this.state.showEndTime && (
                  <DateTimePicker
                    value={this.state.endTime}
                    mode={"time"}
                    is24Hour={true}
                    display="default"
                    onChange={(event, value) => {this.setState({showEndTime: false}); value && this.updateField("endTime", value)}}
                  />
                )}
              </View>
            </View>
            {this.state.showSlider && <View style={[formStyles.field, formStyles.sliderField]}>
              <Text style={formStyles.fieldLabel}>{"Amount  ("+(this.state.severity || 50)+")"}</Text>
              <View style={{ marginLeft: -20, marginRight: -20, paddingTop: 10 }}>
                <Slider
                  value={this.state.severity || 50}
                  step={1}
                  minimumValue={1}
                  maximumValue={100}
                  minimumTrackTintColor={underlineColour}
                  maximumTrackTintColor="#000000"
                  onValueChange={(value) => this.updateField("severity", value)}
                />
              </View>
            </View>}
            <View style={[formStyles.field, {paddingBottom: 10}]}>
              <Text style={formStyles.fieldLabel}>Notes:</Text>
              <TextInput
                style={formStyles.basicInput}
                onChangeText={text => this.updateField('notes', text)}
                placeholder="Notes"
                placeholderTextColor="#B4B4B9"
                underlineColorAndroid={underlineColour}
                value={this.state.notes}
              />
            </View>
          </ScrollView>
          {buttons}
        </View>
      </View>
      );
  }
}

const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: "hidden"
  },
  form: {
    flex: 1,
    width: '90%',
    padding: 25,
    paddingTop: 22,
    paddingBottom: 22,
    height: "100%",
    margin: 38,
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderRadius: 20
  },
  fields: {
    flex: 1
  },
  field: {
    paddingBottom: 18
  },
  fieldLabel: {
    color: 'grey',
    fontSize: 18
  },
  basicInput: {
    height: 50,
    fontSize: 20
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 40,
    height: 40,
    alignItems: "center"
  },
  dropdown: {
    fontSize: 16,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  rowField: {
    paddingBottom: 20,
    display: "flex",
    flexDirection: "row"
  },
  columnView: {
    flex: 1,
    marginRight: 10
  },
  sliderField: {
    flex: 1,
    justifyContent: 'center'
  },
  slider: {
    width: "100%"
  }
});