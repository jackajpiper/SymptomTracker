import _ from 'lodash';
import React, {Component} from 'react';
import {Alert, ScrollView, StyleSheet, View, KeyboardAvoidingView, Keyboard, TextInput, TouchableOpacity} from 'react-native';
import moment from "moment";
import Toast from 'react-native-simple-toast';
import AsyncManager from './AsyncManager';
import { FontAwesome, AntDesign, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const today = moment().format("YYYY-MM-DD");

export default class EditDiaryScreen extends Component {
  constructor(props) {
    super(props);

    let origin = JSON.parse(JSON.stringify(props.route.params.diary));
    origin.date = origin.date ? new Date(origin.date) : new Date();

    this.state = {
      isLoading: true,
      title: origin.title,
      text: origin.text,
      date: origin.date,
      origin: JSON.parse(JSON.stringify(origin)),
      keyboardShown: false,
      isNew: !props.route.params.diary.id,
      showDate: false
    };

    this.props.navigation.addListener('beforeRemove', (e) => {
      if (this.state.title != this.state.origin.title || this.state.text != this.state.origin.text) {
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
          <TouchableOpacity style={{paddingRight: 25}} onPress={() => {this.onDelete()}}>
            <AntDesign name="delete" size={28} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={{paddingRight: 25}} onPress={() => {this.onSubmit(); Keyboard.dismiss()}}>
            <FontAwesome name="save" size={28} color="#009ad4" />
          </TouchableOpacity>
        </View>
    this.props.navigation.setOptions({
      headerRight: () => header,
      title: moment(this.state.date).format("dddd, MMM D")
    });
  }

  updateDate = async (date) => {
    let diary = await AsyncManager.getDiaryForDate(date);
    !diary && (diary = {});

    if (this.state.title != this.state.origin.title || this.state.text != this.state.origin.text) {
      Alert.alert(
        'Discard changes?',
        'Moving to another diary entry will discard your changes.',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              this.setState({origin: diary, title: diary.title, text: diary.text, date: new Date(date), isNew: !diary.id}, () => {
                this.updateHeader();
              });
              this.props.navigation.setOptions({ title: moment(this.state.date).format("dddd, MMM D") });
            },
          },
        ]
      );
    } else {
      this.setState({origin: diary, title: diary.title, text: diary.text, date: new Date(date), isNew: !diary.id}, () => {
        this.updateHeader();
      });
      this.props.navigation.setOptions({ title: moment(this.state.date).format("dddd, MMM D") });
    }
  }

  validate = () => {
    if (!this.state.text) {
      return "Please enter some text for this diary entry";
    }
    return "";
  }

  onSubmit = async () => {
    var errors = this.validate();
    if (errors) {
      Toast.show(errors);
    } else {
      var diary = this.state.origin;
      diary.title = this.state.title;
      diary.text = this.state.text;
      diary.date = moment(this.state.date).format("YYYY-MM-DD");
      await this.updateDiaryStorage(diary);
      if (this.state.isNew) {
        this.props.navigation.goBack();
        Toast.show('Created');
      } else {
        this.setState({origin: diary});
        Toast.show('Saved');
      }
    }
  }

  updateDiaryStorage = async (diary) => {
    await AsyncManager.setDiary(diary);
    this.setState({dirty: false});
  };

  onDelete = () => {
    Alert.alert(
      'Delete diary entry?',
      'This will delete this diary entry. Are you sure?',
      [
        { text: "Cancel", style: 'cancel', onPress: () => {} },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncManager.deleteDiary(this.state.origin);
            this.props.navigation.goBack();
            Toast.show("Deleted");
          },
        },
      ]
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={[styles.section, styles.title]}>
            <View style={{flex: 1, flexDirection: "row"}}>
              <TextInput
                ref={this.titleText}
                style={{fontWeight: "600", fontSize: 18, flex: 1}}
                placeholder="Title..."
                onChangeText={(text) => this.setState({title:text})}
                value={this.state.title}/>
              <TouchableOpacity style={{marginRight: -10, paddingTop: 0, justifyContent: "center"}} onPress={()=> {this.setState({showDate: true})}}>
                <FontAwesome name="calendar" size={28} color="#009ad4" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.section, styles.text]}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView>
                  <TextInput style={[styles.text]}
                    onFocus={() => {this.setState({titleShown: false})}}
                    underlineColorAndroid="transparent"
                    placeholder="How are you feeling today?"
                    onChangeText={(text) => this.setState({text:text})}
                    value={this.state.text}
                    multiline={true}/>
                  </ScrollView>
              </KeyboardAvoidingView>
          </View>
        </View>
        {this.state.showDate && (
          <DateTimePicker
            value={this.state.date}
            mode={"date"}
            is24Hour={true}
            display="default"
            onChange={(event, value) => {this.setState({showDate: false}); this.updateDate(moment(value).format("YYYY-MM-DD"))}}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 1,
    backgroundColor: "white"
  },
  section: {
    padding: 15,
  },
  title: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#00ABEB"
  },
  text: {
    fontSize: 18,
    flex: 20,
    height: "100%",
    textAlignVertical: "top"
  },
  deleteContainer: {
    position: 'absolute',
    bottom:0,
    right: 0,
    width: 30,
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    borderRadius:10,
    alignSelf: "flex-end",
    width: "18%",
    backgroundColor: "#e62200",
    display: "flex",
    justifyContent: "center"
  }
});