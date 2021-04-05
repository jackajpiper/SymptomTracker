import _ from 'lodash';
import React, {Component} from 'react';
import {StyleSheet, ActivityIndicator, View, Text, SectionList} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import moment from "moment";
import {LinearGradient} from 'expo-linear-gradient';
import AsyncManager from './AsyncManager';
import { FloatingAction } from "react-native-floating-action";
import SymptomModal from './SymptomModal';
import TreatmentModal from './TreatmentModal';
import { Ionicons } from '@expo/vector-icons';

export default class DiaryScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ITEMS: [],
      isLoading: true
    };
  }

  pollUpdates = async () => {
    let diaries = await AsyncManager.pollUpdates("Diary", "diaries");

    console.log("polling updates for diaries: "+(diaries && diaries.length));
    if (diaries) {
      this.setState({ITEMS: diaries});
    }
  }

  async componentDidMount() {
    let items = [
      { title: "2021-03-12", data: ["I had big shit in my trousers"] },
      { title: "2021-03-13", data: ["I had big shit in my trousers again"] },
      { title: "2021-03-15", data: ["I keep getting these absurdly huge shits inside my trousers"] },
      { title: "2021-03-16", data: ["It happened again."] },
      { title: "2021-03-19", data: ["I don't understand how it keeps happening. It's like a bomb went off down there."] },
      { title: "2021-03-21", data: ["If only I could figure out... Why I keep finding insane poo volumes in my downstairs clothing"] },
      { title: "2021-03-22", data: ["Idon'twanttokeepshittingmyself"] },
      { title: "2021-03-23", data: ["It was warm today."] }
    ];


    console.log("setting initial item state: "+items.length);
    this.setState({ITEMS: items});

    this.setState({ 
      isLoading: false
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

  renderItem = ({item}) => {
    return (
      <View style = { styles.container }>
        <TextInput multiline style={[styles.textInput, {color: 'red'}]}>
          {item}
        </TextInput>
      </View>
    );
  };

  renderSectionHeader = ({section: {title}}) => {
    let sectionTitle = moment(title).format('dddd, MMM d');

    return (
      <Text 
        // allowFontScaling={false} 
        // style={[this.style.sectionText, sectionStyle]} 
        // onLayout={this.onHeaderLayout}
      >
        {sectionTitle}
      </Text>
    );
  }

  keyExtractor = (item, index) => {
    const {keyExtractor} = this.props;
    return _.isFunction(keyExtractor) ? keyExtractor(item, index) : String(index);
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
        <View style={styles.container}>
          <SectionList
            sections={this.state.ITEMS}
            extraData={this.state}
            renderItem={this.renderItem}
            renderSectionHeader={this.renderSectionHeader}
            keyExtractor={this.keyExtractor}
            onScrollToIndexFailed={(info) => { console.warn('onScrollToIndexFailed info: ', info); }}
            // getItemLayout={this.getItemLayout} // onViewableItemsChanged is not updated when list scrolls!!!
          />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  page: {
    height: "100%",
    width: "100%"
  },
  textInput: {
    fontSize: 12,
    padding: 10,
    textAlign: 'right'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  }
});