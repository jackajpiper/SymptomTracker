import _ from 'lodash';
import React, {Component} from 'react';
import {Modal, ActivityIndicator, StatusBar, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import ColourHelper from './ColourHelper';
import { FloatingAction } from "react-native-floating-action";
import SymptomModal from './SymptomModal';
import TreatmentModal from './TreatmentModal';
import TriggerModal from './TriggerModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function(props) {
  let theme = useTheme();

  theme.calendarBackground = theme.dark ? '#000000' : '#ffffff';
  theme.backgroundColor = theme.dark ? '#000000' : '#ffffff';
  theme.dayTextColor = theme.dark ? '#ffffff' : '#2d4150';
  theme.monthTextColor = theme.dark ? '#ffffff' : '#2d4150';
  theme.selectedDayBackgroundColor = theme.dark ? '#0a465c' : "#00a0db";

  return <ExpandableCalendarScreen {...props} theme={theme}/>
}

const today = moment().format("YYYY-MM-DD");

// takes the symptoms, symptom instances, treatments and treatment instances straight from the datastore and converts them for use
function processInstances(symptomInstances, symptoms, treatmentInstances, treatments, triggerInstances, triggers, props) {
  let dateDict = {};
  let dateArr = [];
  symptoms.map((symptom) => {
    symptom.colour = ColourHelper.getColourForMode(symptom.hue, props.theme.dark);
  })
  symptomInstances.forEach(function (instance, index) {
    let symptom = symptoms.find(symptom => symptom.id === instance.typeId);
    instance.name = symptom.name;
    instance.colour = symptom.colour;
    instance.type = "symptom";
    instance.trackSlider = symptom.trackSlider;
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });
  treatments.map((treatment) => {
    treatment.colour = ColourHelper.getColourForMode(treatment.hue, props.theme.dark);
  })
  treatmentInstances.forEach(function (instance, index) {
    let treatment = treatments.find(treatment => treatment.id === instance.typeId);
    instance.name = treatment.name;
    instance.colour = treatment.colour;
    instance.type = "treatment";
    instance.trackSlider = treatment.trackSlider;
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });
  triggers.map((trigger) => {
    trigger.colour = ColourHelper.getColourForMode(trigger.hue, props.theme.dark);
  })
  triggerInstances.forEach(function (instance, index) {
    let trigger = triggers.find(trigger => trigger.id === instance.typeId);
    instance.name = trigger.name;
    instance.colour = trigger.colour;
    instance.type = "trigger";
    instance.trackSlider = trigger.trackSlider;
    let day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });

  function compareOnDay(a, b) {
    return b.startTime.localeCompare(a.startTime);
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
    if(inst1.title > inst2.title) return -1;
    else if(inst1.title < inst2.title) return 1;
    else return 0;
  }

  dateArr.sort(compareInstances);
  return dateArr;
}

class ExpandableCalendarScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;

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
      this.setState({ITEMS: processInstances(newSymptomInstances, newSymptoms, newTreatmentInstances, newTreatments, newTriggerInstances, newTriggers, this.props)});
    }
  }

  async componentDidMount() {
    let symptoms = await AsyncManager.getSymptoms();
    let symptomInstances = await AsyncManager.getSymptomInstances();
    let treatments = await AsyncManager.getTreatments();
    let treatmentInstances = await AsyncManager.getTreatmentInstances();
    let triggers = await AsyncManager.getTriggers();
    let triggerInstances = await AsyncManager.getTriggerInstances();

    this.setState({ITEMS: processInstances(symptomInstances, symptoms, treatmentInstances, treatments, triggerInstances, triggers, this.props)});

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

  componentDidUpdate(prevProps) {
    if (prevProps.theme.dark !== this.props.theme.dark) {
      this.setState({ITEMS: processInstances(
        this.state.SymptomInstances,
        this.state.Symptoms,
        this.state.TreatmentInstances,
        this.state.Treatments,
        this.state.TriggerInstances,
        this.state.Triggers,
        this.props
      )});
    }
    
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
      <View style={[styles.emptyItem, { backgroundColor: this.props.theme.dark ? "#333333" : "#f5f5f5" }]}>
        <Text style={styles.emptyItemText}>How are you feeling today?</Text>
      </View>
    );
  }

  renderItem = ({item}) => {
    if (!item.name) {
      return this.renderToday();
    }

    let colour = item.colour;
    let textColour = this.props.theme.colors.text;
    let lighterTextColour = this.props.theme.colors.text;

    if (item.type === "symptom") {
      return (
        <LinearGradient 
          colors={[this.props.theme.colors.card, colour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
  
          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="thermometer-outline" size={28} color="#b6b6b6" />
            <Text style={[styles.itemTitleText, {color: textColour}]}>{item.name}</Text>
            <View style={styles.itemButtonContainer}>
              <Text style={{color: textColour, marginTop: 10}}>
                {item.startTime + ' - ' + item.endTime}
              </Text>
              {item.trackSlider &&
              <Text style={[styles.itemSeverityText, {color: lighterTextColour}]}>
                {(item.severity || 50) + '%'}
              </Text>}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      );
    } else if (item.type === "treatment") {
      return (
        <LinearGradient 
          colors={[this.props.theme.colors.card, colour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>
  
          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="bandage-outline" size={28} color="#b6b6b6" />
            <Text style={[styles.itemTitleText, {color: textColour}]}>{item.name}</Text>
            <View style={styles.itemButtonContainer}>
              <Text style={{color: textColour, marginTop: 10}}>
                {item.startTime + ' - ' + item.endTime}
              </Text>
              {item.trackSlider &&
              <Text style={[styles.itemSeverityText, {color: lighterTextColour}]}>
                {(item.severity || 50) + '%'}
              </Text>}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      );
    } else if (item.type === "trigger") {
      return (
        <LinearGradient 
          colors={[this.props.theme.colors.card, colour]}
          style = { styles.container }
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}>

          <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
            <Ionicons style={{textAlign: "center", paddingTop: 4}} name="alert" size={28} color="#b6b6b6" />
            <Text style={[styles.itemTitleText, {color: textColour}]}>{item.name}</Text>
            <View style={styles.itemButtonContainer}>
              <Text style={{color: textColour, marginTop: 10}}>
                {item.startTime + ' - ' + item.endTime}
              </Text>
              {item.trackSlider &&
              <Text style={[styles.itemSeverityText, {color: lighterTextColour}]}>
                {(item.severity || 50) + '%'}
              </Text>}
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
    } else if (btn === "bt_add_trigger") {
      this.loadModal("trigger");
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
    const actionColour = this.props.theme.dark ? "#000000" : "#00a0db";
    const textColour = this.props.theme.dark ? "#ffffff" : "#000000";
    const textBackground = this.props.theme.dark ? "#000000" : "#ffffff";
    const actions = [
      {
        text: "Add Symptom",
        name: "bt_add_symptom",
        color: actionColour,
        textBackground: textBackground,
        textColor: textColour,
        position: 1
      },
      {
        text: "Add Treatment",
        name: "bt_add_treatment",
        color: actionColour,
        textBackground: textBackground,
        textColor: textColour,
        position: 2
      },
      {
        text: "Add Trigger",
        name: "bt_add_trigger",
        color: actionColour,
        textBackground: textBackground,
        textColor: textColour,
        position: 3
      }
    ];

    if(this.state.isLoading) {
      return (
        <View style={[styles.spinner]}>
        <ActivityIndicator size="large" color="cornflowerblue" />
        </View>
      )
    } else {
      return (
        <CalendarProvider
          key={this.props.theme.dark}
          theme={this.props.theme}
          date={today}
          showTodayButton
          disabledOpacity={0.6}
        >
          <SafeAreaView>
            <StatusBar
              barStyle={this.props.theme.dark ? "light-content" : "dark-content"}
              backgroundColor={this.props.theme.dark ? "#000000" : "#ffffff"} />
            <ExpandableCalendar
              theme={this.props.theme}
              disableAllTouchEventsForDisabledDays
              firstDay={1}
              markedDates={this.getMarkedDates()}
            />
          </SafeAreaView>
          <AgendaList
            key={this.props.theme.dark}
            theme={this.props.theme}
            sections={this.state.ITEMS}
            extraData={this.state}
            renderItem={this.renderItem}
            ref={this.agendaList}
          />
          <FloatingAction
            actions={actions}
            color={actionColour}
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
  item: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row',
    height: "100%"
  },
  itemSeverityText: {
    color: 'grey',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    textAlign: 'right'
  },
  itemTitleText: {
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
    borderBottomColor: 'lightgrey'
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