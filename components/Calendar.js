import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import moment from "moment";
// https://github.com/wix/react-native-calendars
import { Calendar, CalendarList } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CalendarComponent extends React.Component {
    constructor(props) {
        super(props);
        console.log(moment());
        var today = moment().format("YYYY-MM-DD");
        this.state = { 
            markedDates: { [today]: { selected: true }},
            Symptoms: null,
            SymptomInstances: null
        };
    }

    // as soon as the component loads, get the marked dates from local storage
    componentDidMount = () => {
        AsyncStorage.getItem('markedDates').then(
            (value) => {
                var dates = JSON.parse(value);
                var today = moment().format("YYYY-MM-DD");
                if(dates) {
                    dates[today] = { selected: true };
                } else {
                    dates = { [today]: { selected: true } };
                }
                this.setState({ 'markedDates': dates })
            }
        )
        this.buildStartUpData();
    }

    buildStartUpData = async () => {
        var Symptoms = [
            { id: 1, name: 'Headache', colour: '#ff00ff' },
            { id: 2, name: 'Nosebleed', colour: '#0000ff' },
            { id: 3, name: 'Lethargy', colour: '#ffaabb' }
        ];
        var SymptomInstances = [
            { id: 1, typeId: 1, date: { type: 'day', date: '2021-01-06' }, startTime: '11:40', endTime: '15:05', severity: '30' },
            { id: 2, typeId: 2, date: { type: 'day', date: '2021-01-11' }, startTime: '19:00', endTime: '19:25', severity: '69' },
            { id: 3, typeId: 3, date: { type: 'day', date: '2021-01-18' }, startTime: '01:30', endTime: '07:00', severity: '45' },
            { id: 4, typeId: 1, date: { type: 'day', date: '2021-01-29' }, startTime: '12:40', endTime: '12:55', severity: '78' },
            { id: 5, typeId: 2, date: { type: 'day', date: '2021-01-04' }, startTime: '21:00', endTime: '22:25', severity: '12' },
            { id: 6, typeId: 2, date: { type: 'day', date: '2021-01-12' }, startTime: '14:30', endTime: '27:00', severity: '28' }
        ]

        var storageSymptoms = JSON.stringify(Symptoms);
        var storageSymptomInstances = JSON.stringify(SymptomInstances);
        try {
            await AsyncStorage.setItem('Symptoms', storageSymptoms);
            await AsyncStorage.setItem('SymptomInstances', storageSymptomInstances);
            console.log("Symptom data saved - hopefully!");
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
                        var today = moment().format("YYYY-MM-DD");
                        var markedDates = { [today]: { selected: true } };
                        SymptomInstances.forEach(function (instance, index) {
                            var symptom = Symptoms.find(symptom => symptom.id === instance.typeId);
                            var mark = { marked: true, dotColor: symptom.colour };

                            if(instance.date.type === 'day') {
                                markedDates[instance.date.date] = mark;
                            } else {
                                // handle date spans
                            }
                        });
                        var dates = JSON.parse(JSON.stringify(markedDates));
                        this.setState({ 'markedDates': dates });
                    }
                )
            }
        )
    }

    // returns a promise
    getMarkedDates = async () => {
        try {
            var value = await AsyncStorage.getItem('markedDates');
            if(value !== null) {
                return JSON.parse(value);
            }
        } catch(err) {
            alert(err);
        }
    }

    setMarkedDates = async (value) => {
        var storageValue = JSON.stringify(value);
        try {
            await AsyncStorage.setItem('markedDates', storageValue);
        } catch(err) {
            alert(err);
        }
    }

    onLongPress = date => {
        let markedDates = this.state.markedDates;
        // sets the selected date
        if (markedDates && markedDates[date]) {
            delete markedDates[date];
        } else {
            if(!markedDates) {
                markedDates = { [date]: {marked: true, dotColor: 'red', activeOpacity: 0} };
            } else {
                markedDates[date] = {marked: true, dotColor: 'red', activeOpacity: 0};
            }
        }
        // pushes the new selected/marked dates
        var dates = JSON.parse(JSON.stringify(markedDates));
        this.setState({ 'markedDates': dates });
        this.setMarkedDates(dates);
    }

    setSelectedDay = date => {
        console.log("hello selected day", date);
        let markedDates = JSON.parse(JSON.stringify(this.state.markedDates));
        // removes all the selected dates
        for (var key in markedDates) {
            var d = markedDates[key];
            if (d.selected) {           
                if(d.marked) {
                    d.selected = false;
                } else {
                    delete markedDates[key];
                }
            }
        }
        // sets the selected date
        if (markedDates[date]) {
            markedDates[date].selected = true;
        } else {
            markedDates[date] = { selected: true };
        }
        // pushes the new selected/marked dates
        let serviceDate = moment(date);
        serviceDate = serviceDate.format("DD.MM.YYYY");

        var newMarkedDates = JSON.parse(JSON.stringify(markedDates));
        this.setState({
            markedDates: newMarkedDates
        });
    };

    addDate = context => {
        // var markedDates = JSON.parse(JSON.stringify(this.state.markedDates));
        // var num = Math.floor(Math.random() * 31) + 1;
        // var newDate = "2021-01-"+ (num<10 ? "0"+num : num);
        // var newMarkedDates = JSON.parse(JSON.stringify(this.state.markedDates));
        // newMarkedDates[newDate] = {marked: true};
        // this.setState({ markedDates: newMarkedDates });
    }

    render() {
        return (
            <View>
                <Calendar
                    style={{ marginTop: 25 }}
                    theme={{
                        'stylesheet.calendar.main': {
                            week: {
                                marginTop: 7,
                                marginBottom: 7,
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                width: '100%'
                            }
                        }
                    }}
                    markedDates={this.state.markedDates}
                    onDayPress={day => {
                        this.setSelectedDay(day.dateString);
                    }}
                    onDayLongPress={day => {
                        this.onLongPress(day.dateString);
                    }}
                />
                <Button
                    onPress={this.populateSymptoms}
                    title="Add"
                    color="#841584"
                    accessibilityLabel="Add a random date"
                />
            </View>
        );
    }
}