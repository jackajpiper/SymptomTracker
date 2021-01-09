import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import moment from "moment";
// https://github.com/wix/react-native-calendars
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CalendarComponent extends React.Component {
    constructor(props) {
        super(props);
        console.log(moment());
        var today = moment().format("YYYY-MM-DD");
        this.state = { 
            markedDates: { [today]: { selected: true }} 
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
        var markedDates = JSON.parse(JSON.stringify(this.state.markedDates));
        var num = Math.floor(Math.random() * 31) + 1;
        var newDate = "2021-01-"+ (num<10 ? "0"+num : num);
        var newMarkedDates = JSON.parse(JSON.stringify(this.state.markedDates));
        newMarkedDates[newDate] = {marked: true};
        this.setState({ markedDates: newMarkedDates });
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
                    onPress={this.addDate}
                    title="Add"
                    color="#841584"
                    accessibilityLabel="Add a random date"
                />
            </View>
        );
    }
}