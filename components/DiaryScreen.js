import _ from 'lodash';
import React, {Component} from 'react';
import {Modal, ActivityIndicator, Alert, StyleSheet, View, Text, TouchableOpacity, Button} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import { FloatingAction } from "react-native-floating-action";
import { Ionicons, AntDesign } from '@expo/vector-icons';


const today = moment().format("YYYY-MM-DD");

const actionColour = "#00a0db";
const actions = [
  {
    text: "Add Entry",
    name: "bt_add_entry",
    color: actionColour,
    position: 1
  }
];

function processDiaries(diaries) {
  let dateDict = {};
  let dateArr = [];
  diaries.forEach(function (diary, index) {
    !(diary.title && diary.title.length) && (diary.title = diary.text);
    dateDict[diary.date] = [diary];
    dateArr.push({ title: diary.date, data: [diary] });
  });
  
  var todayObj = {text: ""};
  if (!dateDict[today]) {
    dateArr.push({ title: today, data: [todayObj] });
  }

  function compareInstances(diary1, diary2) {
    if(diary1.title > diary2.title) return 1;
    else if(diary1.title < diary2.title) return -1;
    else return 0;
  }

  dateArr.sort(compareInstances);
  return dateArr;
}

export default class DiaryScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      Diaries: {}
    };
  }

  pollUpdates = async () => {
    let result = await AsyncManager.pollUpdates("diary", "diaries");

    if (result.Diaries) {
      this.setState({Diaries: processDiaries(result.Diaries)});
    }
  }

  async componentDidMount() {
    setTimeout(async () => {
      let diaries = await AsyncManager.getDiaries();

      this.setState({ 
        isLoading: false,
        Diaries: processDiaries(diaries)
      });
    }, 0);


    if (this.props.navigation.dangerouslyGetParent()) {
      this.willFocusListener = this.props.navigation
        .dangerouslyGetParent()
        .addListener('focus', (e) => {
          if (this.props.navigation.isFocused()) {
            this.pollUpdates();
          }
        });
    }
  }

  componentWillUnmount = () => {
    if(this.willFocusListener && typeof this.willFocusListener.remove === "function") {
      this.willFocusListener.remove();
    };
  }

  itemPressed(diary) {
    console.log("item pressed");
  }

  renderToday() {
    return (
      <View style = { [{backgroundColor: '#f5f5f5'}, styles.container] }>
        <TouchableOpacity style={styles.item}>
          <Ionicons style={{textAlign: "center", paddingTop: 4}} name="reader-outline" size={28} color="darkgrey" />
          <Text style={styles.emptyItemText}>How are you feeling today?</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderItem = ({item}) => {
    if (!item.text.length) {
      return this.renderToday();
    }

    return (
      <LinearGradient 
        colors={['white', 'white']}
        style = { styles.container }
        start={{ x: 0.7, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity onPress={() => this.itemPressed(item)} style={styles.item}>
          <Ionicons style={{textAlign: "center", paddingTop: 4}} name="reader-outline" size={28} color="#009ad4" />
          <Text numberOfLines={1} style={styles.itemTitleText}>{item.text}</Text>
          <View style={styles.itemButtonContainer}>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  getMarkedDates = () => {
    const marked = {};
    this.state.Diaries.forEach(item => {
      // NOTE: only mark dates with data
      if (item.data && item.data.length > 0 && !_.isEmpty(item.data[0])) {
        marked[item.title] = {marked: true};
      }
    });
    return marked;
  };

  floatingActions = (btn) => {
    console.log(btn);
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
          <ExpandableCalendar
            disableAllTouchEventsForDisabledDays
            firstDay={1}
            markedDates={this.getMarkedDates()}
            style = {styles.expandableCalendar}
          />
          <AgendaList
            sections={this.state.Diaries}
            extraData={this.state}
            renderItem={this.renderItem}
            ref={this.agendaList}
          />
          <FloatingAction
            actions={actions}
            color={"#00ABEB"}
            onPressItem={name => { this.floatingActions(name)}}
          />
        </CalendarProvider>
      );
    }
  }
}

const styles = StyleSheet.create({
  expandableCalendar: {
    paddingTop: 0
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
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
    fontSize: 16,
    marginTop: 8,
    width: "70%"
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  emptyItemText: {
    color: 'darkgrey',
    fontSize: 16,
    alignSelf: "flex-start",
    flex: 1,
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
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