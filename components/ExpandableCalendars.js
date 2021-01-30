import _ from 'lodash';
import React, {Component} from 'react';
import {SectionList, Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';

const testIDs = require('../testIDs');

const today = moment().format("YYYY-MM-DD");
const themeColor = '#00AAAF';
const lightThemeColor = '#EBF9F9';

const Symptoms = [
  { id: 1, name: 'Headache', colour: '#ff00ff' },
  { id: 2, name: 'Nosebleed', colour: '#0000ff' },
  { id: 3, name: 'Lethargy', colour: '#ffaabb' },
  { id: 4, name: 'Wisdom', colour: '#ffff00' }
];

const SymptomInstances = [
  { id: 1, typeId: 1, date: '2021-01-06', startTime: '11:40', endTime: '15:05', severity: '30' },
  { id: 2, typeId: 2, date: '2021-01-11', startTime: '19:00', endTime: '19:25', severity: '69' },
  { id: 3, typeId: 3, date: '2021-01-18', startTime: '01:30', endTime: '07:00', severity: '45' },
  { id: 4, typeId: 4, date: '2021-01-29', startTime: '12:40', endTime: '12:55', severity: '78' },
  { id: 5, typeId: 2, date: '2021-01-04', startTime: '21:00', endTime: '22:25', severity: '12' },
  { id: 6, typeId: 2, date: '2021-01-12', startTime: '14:30', endTime: '21:00', severity: '28' },
  { id: 1, typeId: 4, date: '2021-01-02', startTime: '11:40', endTime: '15:05', severity: '30' },
  { id: 2, typeId: 3, date: '2021-01-21', startTime: '19:00', endTime: '19:25', severity: '69' },
  { id: 3, typeId: 3, date: '2021-01-26', startTime: '01:30', endTime: '07:00', severity: '45' },
  { id: 4, typeId: 1, date: '2021-01-09', startTime: '12:40', endTime: '12:55', severity: '78' },
  { id: 5, typeId: 1, date: '2021-01-19', startTime: '21:00', endTime: '22:25', severity: '12' },
  { id: 6, typeId: 3, date: '2021-01-01', startTime: '14:30', endTime: '23:00', severity: '28' },
  { id: 1, typeId: 1, date: '2021-02-06', startTime: '11:40', endTime: '15:05', severity: '30' },
  { id: 2, typeId: 2, date: '2021-02-11', startTime: '19:00', endTime: '19:25', severity: '69' },
  { id: 3, typeId: 4, date: '2021-02-18', startTime: '01:30', endTime: '07:00', severity: '45' },
  { id: 4, typeId: 1, date: '2021-02-29', startTime: '12:40', endTime: '12:55', severity: '78' },
  { id: 5, typeId: 2, date: '2021-02-04', startTime: '21:00', endTime: '22:25', severity: '12' },
  { id: 6, typeId: 4, date: '2021-02-12', startTime: '14:30', endTime: '22:00', severity: '28' }
]

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

  if (!dateDict[today]) {
    dateDict[today] = [{}];
  } else {
    dateDict[today].push({});
  }

  Object.keys(dateDict).forEach(function(date) {
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

  //    ff 00 00
  // => aa 44 44

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


const ITEMS = processInstances(SymptomInstances, Symptoms);

export default class ExpandableCalendarScreen extends Component {

  constructor(props) {
    super(props);
    this.agendaList = React.createRef();
  }

  buttonPressed() {
    Alert.alert('show more');
  }

  itemPressed(id) {
    Alert.alert(id);
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
    let darkerColour = shadeColor(colour,-60);

    return (
      <LinearGradient 
        colors={['white', lighterColour]}
        style = { styles.container }
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity onPress={() => this.itemPressed(item.symptom)} style={styles.item} testID={testIDs.agenda.ITEM}>
          <View>
            <Text style={styles.itemHourText}>{item.startTime + ' - ' + item.endTime}</Text>
            <Text style={styles.itemDurationText}>{item.severity + '%'}</Text>
          </View>
          <Text style={styles.itemTitleText}>{item.symptom}</Text>
          <View style={styles.itemButtonContainer}>
            <Button color={'grey'} title={'Info'} onPress={this.buttonPressed} />
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

  render() {
    return (
      <CalendarProvider
        date={today}
        showTodayButton
        disabledOpacity={0.6}
      >
        {this.props.weekView ? (
          <WeekCalendar testID={testIDs.weekCalendar.CONTAINER} firstDay={1} markedDates={this.getMarkedDates()} />
        ) : (
          <ExpandableCalendar
            testID={testIDs.expandableCalendar.CONTAINER}
            disableAllTouchEventsForDisabledDays
            firstDay={1}
            markedDates={this.getMarkedDates()}
          />
        )}
        <AgendaList
          sections={ITEMS}
          extraData={this.state}
          renderItem={this.renderItem}
          ref={this.agendaList}
        />
      </CalendarProvider>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row'
  },
  itemHourText: {
    color: 'black'
  },
  itemDurationText: {
    color: 'grey',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  itemTitleText: {
    color: 'black',
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 16
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  emptyItem: {
    paddingLeft: 20,
    height: 60,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    backgroundColor: '#eeeeee'
  },
  emptyItemText: {
    color: 'darkgrey',
    fontSize: 14
  },
  container: {
    flex: 1,
  }
});