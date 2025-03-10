import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {createStackNavigator} from 'react-navigation-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faBars} from '@fortawesome/free-solid-svg-icons';
import Screen from 'modules/eventName';
import {NavigationActions} from 'react-navigation';
import {BasicStyles, Color} from 'common';
import {connect} from 'react-redux';

class HeaderOptions extends Component {
  constructor(props) {
    super(props);
  }
  back = () => {
    if(this.props.state.route !== null) {
       this.props.navigationProps.navigate('historyStack', { title: 'Upcoming' })
       this.props.setCurrentRoute(null);
    } else {
      this.props.navigationProps.pop()
    }
  };
  render() {
    const { theme } = this.props.state;
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={this.back.bind(this)}>
          {/*Donute Button Image */}
          <FontAwesomeIcon
            icon={faChevronLeft}
            size={BasicStyles.headerBackIconSize}
            style={[BasicStyles.iconStyle, {
              color: theme ? theme.primary : Color.primary
            }]}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({state: state});

const mapDispatchToProps = (dispatch) => {
  const {actions} = require('@redux');
  return {
    setCurrentRoute: (route) => dispatch(actions.setCurrentRoute(route)),
  };
};
let HeaderOptionsConnect  = connect(mapStateToProps, mapDispatchToProps)(HeaderOptions);

const EventNameStack = createStackNavigator({
  cartScreen: {
    screen: Screen,
    navigationOptions: ({navigation}) => ({
      title: navigation.state?.params?.data?.merchant?.name || 'No name provided',
      headerLeft: <HeaderOptionsConnect navigationProps={navigation} />,
      ...BasicStyles.drawerHeader1
    }),
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EventNameStack);
