import React, {Component} from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Agenda} from 'react-native-calendars';

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: {}
    };
  }
  
    

  render() {
    return (
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={'2021-01-01'}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        // markingType={'period'}
        // markedDates={{
        //    '2017-05-08': {textColor: '#43515c'},
        //    '2017-05-09': {textColor: '#43515c'},
        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
        //    '2017-05-21': {startingDay: true, color: 'blue'},
        //    '2017-05-22': {endingDay: true, color: 'gray'},
        //    '2017-05-24': {startingDay: true, color: 'gray'},
        //    '2017-05-25': {color: 'gray'},
        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
        // monthFormat={'yyyy'}
        // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
        // hideExtraDays={false}
      />
    );
  }

  loadItems(day) {
    setTimeout(() => {
        var instances = this.getSymptoms();
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = this.timeToString(time);
        if (!this.state.items[strTime]) {
            this.state.items[strTime] = [];
            if(instances[strTime]) {
                var symptom = this.Symptoms.find(symptom => symptom.id === instances[strTime].typeId);
                this.state.items[strTime] = [{
                    name: symptom.name + ' at ' + instances[strTime].startTime,
                    height: 50,
                    colour: symptom.colour
                }];
            } else {
                this.state.items[strTime] = [];
            }
        }
      }
      const newItems = {};
      Object.keys(this.state.items).forEach(key => {
        newItems[key] = this.state.items[key];
      });
      this.setState({
        items: newItems
      });
    }, 1000);
  }

  renderItem(item) {
    return (
      <TouchableOpacity
        style={[styles.item, {height: item.height, backgroundColor: item.colour}]}
        onPress={() => Alert.alert(item.name)}
      >
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }

  Symptoms = [
    { id: 1, name: 'Headache', colour: '#ff00ff' },
    { id: 2, name: 'Nosebleed', colour: '#0000ff' },
    { id: 3, name: 'Lethargy', colour: '#ffaabb' },
    { id: 4, name: 'Wisdom', colour: '#ffff00' }
];
    SymptomInstances = [
    { id: 1, typeId: 1, date: { type: 'day', date: '2021-01-06' }, startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 2, typeId: 2, date: { type: 'day', date: '2021-01-11' }, startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 3, typeId: 3, date: { type: 'day', date: '2021-01-18' }, startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 4, typeId: 4, date: { type: 'day', date: '2021-01-29' }, startTime: '12:40', endTime: '12:55', severity: '78' },
    { id: 5, typeId: 2, date: { type: 'day', date: '2021-01-04' }, startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 6, typeId: 2, date: { type: 'day', date: '2021-01-12' }, startTime: '14:30', endTime: '27:00', severity: '28' },
    { id: 1, typeId: 4, date: { type: 'day', date: '2021-01-02' }, startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 2, typeId: 3, date: { type: 'day', date: '2021-01-21' }, startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 3, typeId: 3, date: { type: 'day', date: '2021-01-26' }, startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 4, typeId: 1, date: { type: 'day', date: '2021-01-09' }, startTime: '12:40', endTime: '12:55', severity: '78' },
    { id: 5, typeId: 1, date: { type: 'day', date: '2021-01-19' }, startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 6, typeId: 3, date: { type: 'day', date: '2021-01-01' }, startTime: '14:30', endTime: '27:00', severity: '28' },
    { id: 1, typeId: 1, date: { type: 'day', date: '2021-02-06' }, startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 2, typeId: 2, date: { type: 'day', date: '2021-02-11' }, startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 3, typeId: 4, date: { type: 'day', date: '2021-02-18' }, startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 4, typeId: 1, date: { type: 'day', date: '2021-02-29' }, startTime: '12:40', endTime: '12:55', severity: '78' },
    { id: 5, typeId: 2, date: { type: 'day', date: '2021-02-04' }, startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 6, typeId: 4, date: { type: 'day', date: '2021-02-12' }, startTime: '14:30', endTime: '27:00', severity: '28' }
]

getSymptoms() {
    var instances = {};
    this.SymptomInstances.forEach(function (instance, index) {
        if(!instances) {
            instances = { [instance.date.date]: instance };
        } else {
            instances[instance.date.date] = instance;
        }
    });
    return instances;
}

}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
});