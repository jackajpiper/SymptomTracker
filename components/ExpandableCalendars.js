import _ from 'lodash';
import React, {Component} from 'react';
import {Modal, ActivityIndicator, Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import { FloatingAction } from "react-native-floating-action";
import SymptomModal from './SymptomModal';


const today = moment().format("YYYY-MM-DD");

const actionColour = "#00a0db";
const actions = [
  {
    text: "Add Symptom",
    name: "bt_add_symptom",
    color: actionColour,
    position: 1
  },
  {
    text: "Add Ingestant",
    name: "bt_add_ingestant",
    color: actionColour,
    position: 2
  }
];

// takes the symptoms and symptom instances straight from the datastore and converts them for use
function processInstances(instances, symptoms) {
  let dateDict = {};
  let dateArr = [];
  instances.forEach(function (instance, index) {
    let symptom = symptoms.find(symptom => symptom.id === instance.typeId);
    instance['symptom'] = symptom.name;
    instance['colour'] = symptom.colour;
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });

  function compareOnDay(a, b) {
    return a.startTime.localeCompare(b.startTime);
  }
  
  var todayObj = {startTime: "23:59"};
  if (!dateDict[today]) {
    dateDict[today] = [todayObj];
  } else {
    dateDict[today].push(todayObj);
  }

  Object.keys(dateDict).forEach(function(date) {
    dateDict[date] = dateDict[date].sort(compareOnDay);
    dateArr.push({ title: date, data: dateDict[date] });
  });

  function compareInstances(inst1, inst2) {
    if(inst1.title > inst2.title) return 1;
    else if(inst1.title < inst2.title) return -1;
    else return 0;
  }

  dateArr.sort(compareInstances);
  return dateArr;
}

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

function getContrastYIQ(hexcolor){
  hexcolor = hexcolor.replace("#", "");
  var r = parseInt(hexcolor.substr(0,2),16);
  var g = parseInt(hexcolor.substr(2,2),16);
  var b = parseInt(hexcolor.substr(4,2),16);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

var ITEMS = [];

export default class ExpandableCalendarScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      Symptoms: [],
      SymptomInstances: [],
      isLoading: true,
      showSyptomModal: false,
      symptomModalData: null
    };
  }

  pollUpdates = async () => {
    var pollResult = await AsyncManager.pollUpdates("Calendar");

    if(pollResult.Symptoms.length || pollResult.Instances.length) {
      if(pollResult.Symptoms.length !== 0) {
        this.setState({Symptoms: pollResult.Symptoms});
      }
      if(pollResult.Instances.length !== 0) {
        this.setState({SymptomInstances: pollResult.Instances});
      }
      if(pollResult.Symptoms.length && pollResult.Instances.length) {
        ITEMS = processInstances(pollResult.Instances, pollResult.Symptoms);
      } else if(pollResult.Symptoms.length) {
        ITEMS = processInstances(this.state.SymptomInstances, pollResult.Symptoms);
      } else if(pollResult.Instances.length) {
        ITEMS = processInstances(pollResult.Instances, this.state.Symptoms);
      }
      
      setInterval(() => {
        this.setState({
          isLoading: false
        });
      }, 1000);
      this.forceUpdate();
    }
  }

  async componentDidMount() {
    let symptoms = await AsyncManager.getSymptoms();
    let instances = await AsyncManager.getInstances();
    ITEMS = processInstances(instances, symptoms);
    this.setState({ 
      isLoading: false,
      Symptoms: symptoms,
      SymptomInstances: instances
    });

    this.willFocusListener = this.props.navigation.addListener('focus', async () => {
      await this.pollUpdates();
    });
  }

  componentWillUnmount = () => {
    if(this.willFocusListener && typeof this.willFocusListener.remove === "function") {
      this.willFocusListener.remove();
    };
  }

  buttonPressed() {
    Alert.alert('show more');
  }

  itemPressed(instance) {
    this.loadModal(instance);
  }

  renderToday() {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>How are you feeling today?</Text>
      </View>
    );
  }

  renderItem = ({item}) => {
    if (!item.symptom) {
      return this.renderToday();
    }

    let colour = item.colour;
    let lighterColour = shadeColor(colour, 60);
    let textColour = getContrastYIQ(lighterColour);
    let lighterTextColour = textColour === 'black' ? 'grey' : 'silver';

    return (
      <LinearGradient 
        colors={['white', lighterColour]}
        style = { styles.container }
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
          <Text style={styles.itemTitleText}>{item.symptom}</Text>
          <View style={styles.itemButtonContainer}>
            <Text style={[styles.itemTimeText, {color: textColour}]}>
              {item.startTime + ' - ' + item.endTime}
            </Text>
            <Text style={[styles.itemSeverityText, {color: lighterTextColour}]}>
              {item.severity + '%'}
            </Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
      
    );
  };

  getMarkedDates = () => {
    const marked = {};
    ITEMS.forEach(item => {
      // NOTE: only mark dates with data
      if (item.data && item.data.length > 0 && !_.isEmpty(item.data[0])) {
        marked[item.title] = {marked: true};
      }
    });
    return marked;
  };

  floatingActions = (btn) => {
    if (btn === "bt_add_symptom") {
      let symptom = {
        id: 0,
        name: "",
        colour: ""
      }
      this.loadModal();
    }
  }

  loadModal = (data) => {
    this.setState({symptomModalData: data ? data : {}, showSyptomModal: true });
  }
  
  toggleSymptomModal = (visible) => {
    this.setState({ showSyptomModal: visible });
  }

  render() {
    if(this.state.isLoading) {
      return (
        <View style={[styles.spinner]}>
        <ActivityIndicator size="large" color="cornflowerblue" />
        </View>
      )
    } else {
      return (
        <CalendarProvider
          date={today}
          showTodayButton
          disabledOpacity={0.6}
        >
          {this.props.weekView ? (
            <WeekCalendar firstDay={1} markedDates={this.getMarkedDates()} />
          ) : (
            <ExpandableCalendar
              disableAllTouchEventsForDisabledDays
              firstDay={1}
              markedDates={this.getMarkedDates()}
              style = {styles.expandableCalendar}
            />
          )}
          <AgendaList
            sections={ITEMS}
            extraData={this.state}
            renderItem={this.renderItem}
            ref={this.agendaList}
          />
          <FloatingAction
            actions={actions}
            color={"#00ABEB"}
            onPressItem={name => { this.floatingActions(name)}}
          />
          <Modal animationType = {"slide"}
              visible = {this.state.showSyptomModal}
              onRequestClose = {() => { this.toggleSymptomModal(false) }}
              transparent={true} >
              <SymptomModal toggleModal={this.toggleSymptomModal} triggerPoll={this.pollUpdates} symptoms={this.state.Symptoms} data={this.state.symptomModalData} />
          </Modal>
        </CalendarProvider>
      );
    }
  }
}

const styles = StyleSheet.create({
  expandableCalendar: {
    paddingTop: 15
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row'
  },
  itemTimeText: {
    color: 'black'
  },
  itemSeverityText: {
    color: 'grey',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    textAlign: 'right'
  },
  itemTitleText: {
    color: 'black',
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  emptyItem: {
    paddingLeft: 36,
    height: 85,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    backgroundColor: '#eeeeee'
  },
  emptyItemText: {
    color: 'darkgrey',
    fontSize: 16
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});