import _ from 'lodash';
import React, {Component} from 'react';
import {Platform, Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";

const testIDs = require('../testIDs');

const today = moment().format("YYYY-MM-DD");
const themeColor = '#00AAAF';
const lightThemeColor = '#EBF9F9';

var Symptoms = [
  { id: 1, name: 'Headache', colour: '#ff00ff' },
  { id: 2, name: 'Nosebleed', colour: '#0000ff' },
  { id: 3, name: 'Lethargy', colour: '#ffaabb' },
  { id: 4, name: 'Wisdom', colour: '#ffff00' }
];

var SymptomInstances = [
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
  var dateDict = {};
  var dateArr = [];
  instances.forEach(function (instance, index) {
    var symptom = symptoms.find(symptom => symptom.id === instance.typeId);
    instance['symptom'] = symptom.name;
    var day = instance.date;
    if (!dateDict[day]) {
      dateDict[day] = [];
    }
    dateDict[day].push(instance);
  });

  if (!dateDict[today]) {
    dateDict[today] = [{}];
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

const convertedInstances = processInstances(SymptomInstances, Symptoms);
// console.log("converted instances are:");
// console.log(convertedInstances);

export default class ExpandableCalendarScreen extends Component {

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

    return (
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
    );
  };

  getMarkedDates = () => {
    const marked = {};
    convertedInstances.forEach(item => {
      // NOTE: only mark dates with data
      if (item.data && item.data.length > 0 && !_.isEmpty(item.data[0])) {
        marked[item.title] = {marked: true};
      }
    });
    return marked;
  };

  getTheme = () => {
    const disabledColor = 'grey';

    return {
      // arrows
      arrowColor: 'black',
      arrowStyle: {padding: 0},
      // month
      monthTextColor: 'black',
      textMonthFontSize: 16,
      textMonthFontFamily: 'HelveticaNeue',
      textMonthFontWeight: 'bold',
      // day names
      textSectionTitleColor: 'black',
      textDayHeaderFontSize: 12,
      textDayHeaderFontFamily: 'HelveticaNeue',
      textDayHeaderFontWeight: 'normal',
      // dates
      dayTextColor: themeColor,
      textDayFontSize: 18,
      textDayFontFamily: 'HelveticaNeue',
      textDayFontWeight: '500',
      textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
      // selected date
      selectedDayBackgroundColor: themeColor,
      selectedDayTextColor: 'white',
      // disabled date
      textDisabledColor: disabledColor,
      // dot (marked date)
      dotColor: themeColor,
      selectedDotColor: 'white',
      disabledDotColor: disabledColor,
      dotStyle: {marginTop: -2}
    };
  };

  render() {
    return (
      <CalendarProvider
        date={'2021-01-12'} // TODO: have this be today
        onDateChanged={this.onDateChanged}
        onMonthChange={this.onMonthChange}
        showTodayButton
        disabledOpacity={0.6}
        // theme={{
        //   todayButtonTextColor: themeColor
        // }}
        // todayBottomMargin={16}
      >
        {this.props.weekView ? (
          <WeekCalendar testID={testIDs.weekCalendar.CONTAINER} firstDay={1} markedDates={this.getMarkedDates()} />
        ) : (
          <ExpandableCalendar
            testID={testIDs.expandableCalendar.CONTAINER}
            // horizontal={false}
            // hideArrows
            // disablePan
            // hideKnob
            // initialPosition={ExpandableCalendar.positions.OPEN}
            // calendarStyle={styles.calendar}
            // headerStyle={styles.calendar} // for horizontal only
            // disableWeekScroll
            // theme={this.getTheme()}
            disableAllTouchEventsForDisabledDays
            firstDay={1}
            markedDates={this.getMarkedDates()} // {'2019-06-01': {marked: true}, '2019-06-02': {marked: true}, '2019-06-03': {marked: true}};
            // leftArrowImageSource={require('../img/previous.png')}
            // rightArrowImageSource={require('../img/next.png')}
          />
        )}
        <AgendaList
          sections={convertedInstances}
          extraData={this.state}
          renderItem={this.renderItem}
          // sectionStyle={styles.section}
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
    backgroundColor: 'white',
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
    height: 80,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    backgroundColor: '#eeeeee'
  },
  emptyItemText: {
    color: 'darkgrey',
    fontSize: 14
  }
});