import _ from 'lodash';
import React, {Component} from 'react';
import {Modal, ActivityIndicator, Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import { FloatingAction } from "react-native-floating-action";
import SymptomModal from './SymptomModal';
import TreatmentModal from './TreatmentModal';
import TriggerModal from './TriggerModal';
import { Ionicons } from '@expo/vector-icons';


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
    text: "Add Treatment",
    name: "bt_add_treatment",
    color: actionColour,
    position: 2
  },
  {
    text: "Add Trigger",
    name: "bt_add_trigger",
    color: actionColour,
    position: 3
  }
];

// takes the symptoms, symptom instances, treatments and treatment instances straight from the datastore and converts them for use
function processInstances(symptomInstances, symptoms, treatmentInstances, treatments, triggerInstances, triggers) {
  let dateDict = {};
  let dateArr = [];
  symptomInstances.forEach(function (instance, index) {
    let symptom = symptoms.find(symptom => symptom.id === instance.typeId);
    instance.name = symptom.name;
    instance.colour = symptom.colour;
    instance.type = "symptom";
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });
  treatmentInstances.forEach(function (instance, index) {
    let treatment = treatments.find(treatment => treatment.id === instance.typeId);
    instance.name = treatment.name;
    instance.colour = treatment.colour;
    instance.type = "treatment";
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });
  triggerInstances.forEach(function (instance, index) {
    let trigger = triggers.find(trigger => trigger.id === instance.typeId);
    instance.name = trigger.name;
    instance.colour = trigger.colour;
    instance.type = "trigger";
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

export default class ExpandableCalendarScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      Symptoms: [],
      SymptomInstances: [],
      Treatments: [],
      TreatmentInstances: [],
      Triggers: [],
      TriggerInstances: [],
      ITEMS: [],
      isLoading: true,
      showSyptomModal: false,
      showTreatmentModal: false,
      showTriggerModal: false,
      symptomModalData: null
    };
  }

  pollUpdates = async () => {
    let symptomResult = await AsyncManager.pollUpdates("Calendar", "symptoms");
    let treatmentResult = await AsyncManager.pollUpdates("Calendar", "treatments");
    let triggerResult = await AsyncManager.pollUpdates("Calendar", "triggers");
    console.log(triggerResult.Triggers);

    let oneChanged = false;
    let newSymptoms = symptomResult.Symptoms;
    let newSymptomInstances = symptomResult.Instances;
    let newTreatments = treatmentResult.Treatments;
    let newTreatmentInstances = treatmentResult.Instances;
    let newTriggers = triggerResult.Triggers;
    let newTriggerInstances = triggerResult.Instances;

    if (newSymptoms) {
      this.setState({Symptoms: newSymptoms});
      oneChanged = true;
    } else {
      newSymptoms = this.state.Symptoms;
    }
    if (newSymptomInstances) {
      this.setState({SymptomInstances: newSymptomInstances});
      oneChanged = true;
    } else {
      newSymptomInstances = this.state.SymptomInstances;
    }
    if (newTreatments) {
      this.setState({Treatments: newTreatments});
      oneChanged = true;
    } else {
      newTreatments = this.state.Treatments;
    }
    if (newTreatmentInstances) {
      this.setState({TreatmentInstances: newTreatmentInstances});
      oneChanged = true;
    } else {
      newTreatmentInstances = this.state.TreatmentInstances;
    }
    if (newTriggers) {
      this.setState({Triggers: newTriggers});
      oneChanged = true;
    } else {
      newTriggers = this.state.Triggers;
    }
    if(newTriggerInstances) {
      this.setState({TriggerInstances: newTriggerInstances});
      oneChanged = true;
    } else {
      newTriggerInstances = this.state.TriggerInstances;
    }

    if (oneChanged) {
      this.setState({ITEMS: processInstances(newSymptomInstances, newSymptoms, newTreatmentInstances, newTreatments, newTriggerInstances, newTriggers)});
    }
  }

  async componentDidMount() {
    let symptoms = await AsyncManager.getSymptoms();
    let symptomInstances = await AsyncManager.getSymptomInstances();
    let treatments = await AsyncManager.getTreatments();
    let treatmentInstances = await AsyncManager.getTreatmentInstances();
    let triggers = await AsyncManager.getTriggers();
    let triggerInstances = await AsyncManager.getTriggerInstances();

    this.setState({ITEMS: processInstances(symptomInstances, symptoms, treatmentInstances, treatments, triggerInstances, triggers)});

    this.setState({ 
      isLoading: false,
      Symptoms: symptoms,
      SymptomInstances: symptomInstances,
      Treatments: treatments,
      TreatmentInstances: treatmentInstances,
      Triggers: triggers,
      TriggerInstances: triggerInstances
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

  itemPressed(instance) {
    this.loadModal(instance.type, instance);
  }

  renderToday() {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>How are you feeling today?</Text>
      </View>
    );
  }

  renderItem = ({item}) => {
    if (!item.name) {
      return this.renderToday();
    }

    let colour = item.colour;
    let lighterColour = shadeColor(colour, 60);
    let textColour = getContrastYIQ(lighterColour);
    let lighterTextColour = textColour === 'black' ? 'grey' : 'silver';

    if (item.type === "symptom") {
      return (
        <LinearGradient 
          colors={['white', lighterColour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
  
          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="thermometer-outline" size={28} color="#b6b6b6" />
            <Text style={styles.itemTitleText}>{item.name}</Text>
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
    } else if (item.type === "treatment") {
      return (
        <LinearGradient 
          colors={['white', lighterColour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
  
          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="bandage-outline" size={28} color="#b6b6b6" />
            <Text style={styles.itemTitleText}>{item.name}</Text>
            <View style={styles.itemButtonContainer}>
              <Text style={[styles.itemTimeText, {color: textColour, marginTop: 10}]}>
                {item.startTime + ' - ' + item.endTime}
              </Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      );
    } else if (item.type === "trigger") {
      return (
        <LinearGradient 
          colors={['white', lighterColour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>

          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="alert" size={28} color="#b6b6b6" />
            <Text style={styles.itemTitleText}>{item.name}</Text>
            <View style={styles.itemButtonContainer}>
              <Text style={[styles.itemTimeText, {color: textColour, marginTop: 10}]}>
                {item.startTime + ' - ' + item.endTime}
              </Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
  };

  getMarkedDates = () => {
    const marked = {};
    this.state.ITEMS.forEach(item => {
      // NOTE: only mark dates with data
      if (item.data && item.data.length > 0 && !_.isEmpty(item.data[0])) {
        marked[item.title] = {marked: true};
      }
    });
    return marked;
  };

  floatingActions = (btn) => {
    if (btn === "bt_add_symptom") {
      this.loadModal("symptom");
    } else if (btn === "bt_add_treatment") {
      this.loadModal("treatment");
    }
  }

  loadModal = (type, data) => {
    if (type === "symptom") {
      this.setState({symptomModalData: data ? data : {}, showSyptomModal: true });
    } else if (type === "treatment") {
      this.setState({treatmentModalData: data ? data : {}, showTreatmentModal: true });
    } else if (type === "trigger") {
      this.setState({triggerModalData: data ? data : {}, showTriggerModal: true });
    }
  }
  
  toggleModal = (type, visible) => {
    if (type === "symptom") {
      this.setState({ showSyptomModal: visible });
    } else if (type === "treatment") {
      this.setState({ showTreatmentModal: visible });
    } else if (type === "trigger") {
      this.setState({ showTriggerModal: visible });
    }
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
            sections={this.state.ITEMS}
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
              onRequestClose = {() => { this.toggleModal("symptom", false) }}
              transparent={true} >
              <SymptomModal toggleModal={this.toggleModal} triggerPoll={this.pollUpdates} symptoms={this.state.Symptoms} data={this.state.symptomModalData} />
          </Modal>
          <Modal animationType = {"slide"}
              visible = {this.state.showTreatmentModal}
              onRequestClose = {() => { this.toggleModal("treatment", false) }}
              transparent={true} >
              <TreatmentModal toggleModal={this.toggleModal} triggerPoll={this.pollUpdates} treatments={this.state.Treatments} data={this.state.treatmentModalData} />
          </Modal>
          <Modal animationType = {"slide"}
              visible = {this.state.showTriggerModal}
              onRequestClose = {() => { this.toggleModal("trigger", false) }}
              transparent={true} >
              <TriggerModal toggleModal={this.toggleModal} triggerPoll={this.pollUpdates} triggers={this.state.Triggers} data={this.state.triggerModalData} />
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
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row',
    height: "100%"
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
    alignItems: 'center',
    height: 80
  },
  spinner: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }
});