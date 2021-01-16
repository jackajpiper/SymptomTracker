import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CalendarAgenda extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: {},
            Symptoms: [],
            SymptomInstances: []
        };
    }

    // as soon as the component loads, get the marked dates from local storage
    componentDidMount = () => {
        this.buildStartUpData().then(this.populateSymptoms);
        this.loadItems();
    }

    buildStartUpData = async () => {
        var Symptoms = [
            { id: 1, name: 'Headache', colour: '#ff00ff' },
            { id: 2, name: 'Nosebleed', colour: '#0000ff' },
            { id: 3, name: 'Lethargy', colour: '#ffaabb' },
            { id: 4, name: 'Wisdom', colour: '#ffff00' }
        ];
        var SymptomInstances = [
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

        var storageSymptoms = JSON.stringify(Symptoms);
        var storageSymptomInstances = JSON.stringify(SymptomInstances);
        try {
            await AsyncStorage.setItem('Symptoms', storageSymptoms);
            await AsyncStorage.setItem('SymptomInstances', storageSymptomInstances);
        } catch(err) {
            alert(err);
        }
    }

    populateSymptoms = () => {
        AsyncStorage.getItem('Symptoms').then(
            (value) => {
                var Symptoms = JSON.parse(value);
                AsyncStorage.getItem('SymptomInstances').then(
                    (value2) => {
                        var SymptomInstances = JSON.parse(value2);
                        
                        this.setState({
                            'Symptoms': Symptoms,
                            'SymptomInstances': SymptomInstances
                        });
                    }
                )
            }
        )
    }

    loadItems(day) {
        setTimeout(() => {
            // for (let i = -15; i < 85; i++) {
            //     const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            //     const strTime = this.timeToString(time);
            //     if (!this.state.items[strTime]) {
            //         this.state.items[strTime] = [];
            //         var numItems = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
            //         for (let j = 0; j < numItems; j++) {
            //             this.state.items[strTime].push({
            //                 name: 'Item for ' + strTime,
            //                 height: 50
            //             });
            //         }
            //     }
            // }

            console.log("loading month for day " + (day && day.dateString));

            var items = this.state.items;
            var symptoms = this.state.Symptoms;
            var symptomInstances = this.state.SymptomInstances;

            symptomInstances.forEach(function (instance, index) {
                var symptom = symptoms.find(symptom => symptom.id === instance.typeId);
                var item = { marked: true, dotColor: symptom.colour };
                item = {
                    name: symptom.name + ' at ' + instance.startTime,
                    height: 50,
                    colour: symptom.colour
                };

                if(instance.date.type === 'day') {
                    var day = instance.date.date;
                    if (!items[day]) {
                        items[day] = [];
                    }
                    items[day].push(item);
                } else {
                    // handle date spans
                }
            });

            const newItems = {};
            Object.keys(items).forEach(key => {newItems[key] = items[key];});
            this.setState({
                items: newItems
            });
        }, 1000);
        // console.log(`Load Items for ${day.year}-${day.month}`);
    }

    renderItem(item) {
        return (
            <View style={{height: 40}}>
                <View style={[styles.item, {height: item.height, backgroundColor: item.colour}]}><Text>{item.name}</Text></View>
            </View>
        );
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}><Text>This is empty date!</Text></View>
        );
    }

    rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
    }

    timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    render() {
        return (
            <Agenda
                items={this.state.items}
                selected={new Date()}
                loadItemsForMonth={this.loadItems.bind(this)}
                renderItem={this.renderItem.bind(this)}
                renderEmptyDate={this.renderEmptyDate.bind(this)}
                rowHasChanged={this.rowHasChanged.bind(this)}
            />
        );
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'red',
        flex: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
        marginTop: 5,
    },
    emptyDate: {
        backgroundColor: 'green',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 5,
        height:20,
    }
});