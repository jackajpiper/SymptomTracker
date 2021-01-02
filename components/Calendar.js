import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';
import moment from "moment";
// https://github.com/wix/react-native-calendars
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class CalendarComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            markedDates: {
                '2021-01-21': {marked: true},
                '2021-01-22': {marked: true, dotColor: 'red', activeOpacity: 0}
            } 
        };
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